import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { site } from "@/lib/site";
import {
  cleanEnvString,
  isDiscordSnowflake,
  resolveDiscordClientId,
} from "@/lib/discord-oauth";
import {
  getRedirectUri,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  relativeRedirect,
  sanitizeInternalNextPath,
  sealSession,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  unsealSession,
  verifySignedOAuthState,
} from "@/lib/session";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import {
  canManageGuild,
  fetchAllUserGuilds,
  guildIconUrl,
} from "@/lib/discord-guilds";
import { recordAuthorizedUser } from "@/lib/auth-store";
import { isOwnerId } from "@/lib/admin";

export const dynamic = "force-dynamic";

const DISCORD_USER_AGENT = `LightCore (${site.url}, 2.1)`;

const SAFE_TOKEN_REASONS = new Set([
  "invalid_client",
  "invalid_grant",
  "unauthorized_client",
  "invalid_request",
  "unsupported_grant_type",
  "invalid_scope",
  "rate_limited",
]);

function statesEqual(a: string | undefined, b: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function resolveDestination(
  rawNext: string | null | undefined,
  guildId: string | null,
): `/${string}` {
  if (rawNext) {
    const cleaned = sanitizeInternalNextPath(rawNext);
    if (cleaned !== "/dashboard" || !guildId) {
      return cleaned;
    }
  }
  if (guildId && isDiscordSnowflake(guildId)) {
    return `/dashboard/${guildId}`;
  }
  return "/dashboard";
}

async function exchangeDiscordCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  redirectUri: string;
}): Promise<
  | {
      ok: true;
      data: {
        access_token: string;
        expires_in?: number;
        scope?: string;
      };
    }
  | { ok: false; reason: string }
> {
  const body = new URLSearchParams({
    client_id: params.clientId,
    client_secret: params.clientSecret,
    grant_type: "authorization_code",
    code: params.code,
    redirect_uri: params.redirectUri,
  }).toString();

  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": DISCORD_USER_AGENT,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = (await res.json()) as {
        access_token: string;
        expires_in?: number;
        scope?: string;
      };
      if (data?.access_token) {
        return { ok: true, data };
      }
      return { ok: false, reason: "empty_token" };
    }

    if (res.status === 429) {
      const rl = (await res.json().catch(() => ({}))) as {
        retry_after?: number;
      };
      const waitMs = Math.min(
        Math.ceil((Number(rl.retry_after) || 1) * 1000),
        2200,
      );
      if (attempt === 0 && waitMs <= 2200) {
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }
      return { ok: false, reason: "rate_limited" };
    }

    const errJson = (await res.json().catch(() => ({}))) as {
      error?: string;
    };
    const rawErr =
      typeof errJson.error === "string" ? errJson.error.toLowerCase() : "";
    const reason = SAFE_TOKEN_REASONS.has(rawErr)
      ? rawErr
      : `http_${res.status}`;
    return { ok: false, reason };
  }

  return { ok: false, reason: "rate_limited" };
}

async function handleDiscordOAuthCallback(req: NextRequest) {
  const reqCtx = { url: req.url, headers: req.headers };
  const { searchParams } = new URL(req.url);
  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const guildId = searchParams.get("guild_id");
  const storedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const storedNext = req.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  const existingSession = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);

  // Standalone bot invite redirect (`?guild_id=...` without `code`)
  if (!code && !oauthError && guildId && isDiscordSnowflake(guildId)) {
    return relativeRedirect(`/dashboard/${guildId}`, reqCtx);
  }

  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  const clientId = resolveDiscordClientId();

  if (!clientSecret) {
    return relativeRedirect("/login?error=oauth_not_configured", reqCtx);
  }

  if (oauthError) {
    const mapped =
      oauthError === "access_denied"
        ? "access_denied"
        : oauthError === "invalid_scope"
          ? "invalid_scope"
          : "oauth_failed";
    return relativeRedirect(`/login?error=${mapped}`, reqCtx);
  }

  if (!code || code.length > 128 || !/^[A-Za-z0-9._-]+$/.test(code)) {
    if (existingSession) {
      return relativeRedirect("/dashboard", reqCtx);
    }
    return relativeRedirect("/login?error=invalid_state", reqCtx);
  }

  const verifiedState = verifySignedOAuthState(state, storedNext);
  const cookieMatched = statesEqual(storedState, state);

  if (!verifiedState && !cookieMatched) {
    if (existingSession) {
      return relativeRedirect(resolveDestination(storedNext, guildId), reqCtx);
    }
    return relativeRedirect("/login?error=invalid_state", reqCtx);
  }

  const reqPathname = new URL(req.url).pathname.replace(/\/+$/, "");
  const baseRedirect = getRedirectUri(
    req.url,
    req.headers,
    verifiedState?.ru || null,
  );
  const redirectUri = (() => {
    if (process.env.DISCORD_REDIRECT_URI) return baseRedirect;
    try {
      const u = new URL(baseRedirect);
      if (
        reqPathname === "/api/auth/callback/discord" ||
        reqPathname === "/api/auth/callback" ||
        reqPathname === "/api/auth/discord/callback" ||
        reqPathname === "/oauth/callback"
      ) {
        u.pathname = reqPathname;
      }
      return u.toString();
    } catch {
      return baseRedirect;
    }
  })();

  const destination = resolveDestination(
    verifiedState?.next ?? storedNext,
    guildId,
  );

  try {
    const exchanged = await exchangeDiscordCode({
      clientId,
      clientSecret,
      code,
      redirectUri,
    });

    if (!exchanged.ok) {
      if (exchanged.reason === "invalid_grant" && existingSession) {
        return relativeRedirect(destination, reqCtx);
      }
      return relativeRedirect(
        `/login?error=token_exchange_failed&reason=${encodeURIComponent(exchanged.reason)}`,
        reqCtx,
      );
    }

    const tokenData = exchanged.data;
    const grantedScopes = (tokenData.scope || "")
      .split(/\s+/)
      .filter(Boolean);

    const [userRes, rawGuilds] = await Promise.all([
      fetch("https://discord.com/api/v10/users/@me", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
          "User-Agent": DISCORD_USER_AGENT,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(7000),
      }),
      grantedScopes.includes("guilds")
        ? Promise.race([
            fetchAllUserGuilds(tokenData.access_token),
            new Promise<null>((resolve) =>
              setTimeout(() => resolve(null), 4000),
            ),
          ])
        : Promise.resolve(null),
    ]);

    if (!userRes.ok) {
      return relativeRedirect("/login?error=user_fetch_failed", reqCtx);
    }

    const rawUser = (await userRes.json()) as {
      id: string;
      username: string;
      global_name?: string | null;
      avatar?: string | null;
      verified?: boolean;
      locale?: string | null;
    };

    if (!rawUser?.id || !rawUser?.username) {
      return relativeRedirect("/login?error=user_fetch_failed", reqCtx);
    }

    const ttl = Math.min(
      tokenData.expires_in ?? SESSION_TTL_SECONDS,
      SESSION_TTL_SECONDS,
    );
    const sealed = sealSession({
      user: {
        id: rawUser.id,
        username: rawUser.username,
        globalName: rawUser.global_name ?? null,
        avatar: rawUser.avatar ?? null,
        scopes: grantedScopes,
      },
      accessToken: tokenData.access_token,
      exp: Math.floor(Date.now() / 1000) + ttl,
    });

    if (!sealed) {
      return relativeRedirect("/login?error=oauth_not_configured", reqCtx);
    }

    const readOnlyScopes = grantedScopes.filter(
      (s) => s === "identify" || s === "guilds",
    );

    const avatarUrl = rawUser.avatar
      ? `https://cdn.discordapp.com/avatars/${rawUser.id}/${rawUser.avatar}.png?size=128`
      : null;

    const guildsList = (rawGuilds ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      iconUrl: guildIconUrl(g.id, g.icon),
      owner: g.owner,
      canManage: canManageGuild(g),
    }));

    const ownerLogin = isOwnerId(rawUser.id);

    const sideEffects = Promise.allSettled([
      recordAuthorizedUser({
        user: {
          id: rawUser.id,
          username: rawUser.username,
          globalName: rawUser.global_name ?? null,
          avatarUrl,
          email: null,
          verified:
            typeof rawUser.verified === "boolean" ? rawUser.verified : null,
          locale: rawUser.locale ?? null,
          scopes: readOnlyScopes,
          guildCount: guildsList.length,
          guilds: guildsList.slice(0, 200),
          authorizedAt: new Date().toISOString(),
        },
      }),
      sendDiscordLogEmbed({
        title: `${site.name} · Dashboard Sign-In`,
        description: `**${rawUser.global_name || rawUser.username}** (\`@${rawUser.username}\`) signed in to the dashboard.`,
        color: ownerLogin ? 0xef4444 : 0xdc2626,
        timestamp: new Date().toISOString(),
        fields: [
          { name: "User ID", value: `\`${rawUser.id}\``, inline: true },
          {
            name: "Servers",
            value: rawGuilds ? `${guildsList.length}` : "syncing",
            inline: true,
          },
          {
            name: "Role",
            value: ownerLogin ? "Bot Owner" : "User",
            inline: true,
          },
          {
            name: "Scopes",
            value:
              readOnlyScopes.map((s) => `\`${s}\``).join(" ") ||
              "`identify` `guilds`",
            inline: false,
          },
        ],
      }),
    ]);

    await Promise.race([
      sideEffects,
      new Promise<void>((resolve) => setTimeout(resolve, 3200)),
    ]);

    const isHttps = redirectUri.startsWith("https://");
    const res = relativeRedirect(destination, reqCtx);
    res.cookies.set(SESSION_COOKIE, sealed, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: ttl,
    });
    // Clear transient one-time OAuth handshake cookies immediately
    res.cookies.set(OAUTH_STATE_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 0,
    });
    res.cookies.set(OAUTH_NEXT_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch {
    return relativeRedirect("/login?error=oauth_failed", reqCtx);
  }
}

export async function GET(req: NextRequest) {
  return handleDiscordOAuthCallback(req);
}
