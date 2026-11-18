import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { site } from "@/lib/site";
import {
  cleanEnvString,
  resolveDiscordClientId,
  resolveOAuthScopes,
} from "@/lib/discord-oauth";
import {
  getRedirectUri,
  OAUTH_NEXT_COOKIE,
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
  relativeRedirect,
  sealSession,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/session";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import {
  canManageGuild,
  fetchAllUserGuilds,
  guildIconUrl,
} from "@/lib/discord-guilds";
import {
  addUserToGuildWithToken,
  recordAuthorizedUser,
} from "@/lib/auth-store";
import { isOwnerId } from "@/lib/admin";

export const dynamic = "force-dynamic";

function statesMatch(a: string | undefined, b: string | null): boolean {
  if (!a || !b) return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function clearOAuthCookies(res: ReturnType<typeof relativeRedirect>) {
  res.cookies.delete(OAUTH_STATE_COOKIE);
  res.cookies.delete(OAUTH_NEXT_COOKIE);
  res.cookies.delete(OAUTH_REDIRECT_COOKIE);
  return res;
}

export async function handleDiscordOAuthCallback(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const storedState = req.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const storedNext = req.cookies.get(OAUTH_NEXT_COOKIE)?.value;
  const storedRedirect = req.cookies.get(OAUTH_REDIRECT_COOKIE)?.value;
  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  const clientId = resolveDiscordClientId();

  if (!clientSecret) {
    return clearOAuthCookies(relativeRedirect("/login?error=oauth_not_configured"));
  }

  if (oauthError) {
    const mapped =
      oauthError === "access_denied"
        ? "access_denied"
        : oauthError === "invalid_scope"
          ? "invalid_scope"
          : "oauth_failed";
    return clearOAuthCookies(relativeRedirect(`/login?error=${mapped}`));
  }

  if (!code || !statesMatch(storedState, state)) {
    return clearOAuthCookies(relativeRedirect("/login?error=invalid_state"));
  }

  const redirectUri = getRedirectUri(req.url, req.headers, storedRedirect);

  try {
    const tokenRes = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!tokenRes.ok) {
      return clearOAuthCookies(
        relativeRedirect("/login?error=token_exchange_failed"),
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
      scope?: string;
    };

    const grantedScopes = (
      tokenData.scope || resolveOAuthScopes(site.oauthScopes)
    )
      .split(/\s+/)
      .filter(Boolean);

    const [userRes, rawGuilds] = await Promise.all([
      fetch("https://discord.com/api/v10/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
        signal: AbortSignal.timeout(10000),
      }),
      grantedScopes.includes("guilds")
        ? fetchAllUserGuilds(tokenData.access_token)
        : Promise.resolve(null),
    ]);

    if (!userRes.ok) {
      return clearOAuthCookies(
        relativeRedirect("/login?error=user_fetch_failed"),
      );
    }

    const rawUser = (await userRes.json()) as {
      id: string;
      username: string;
      global_name?: string | null;
      avatar?: string | null;
      email?: string | null;
      verified?: boolean;
      locale?: string | null;
    };

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

    const hasJoinScope = grantedScopes.includes("guilds.join");
    const expiresInSeconds = tokenData.expires_in ?? SESSION_TTL_SECONDS;

    await recordAuthorizedUser({
      user: {
        id: rawUser.id,
        username: rawUser.username,
        globalName: rawUser.global_name ?? null,
        avatarUrl,
        email: rawUser.email ?? null,
        verified:
          typeof rawUser.verified === "boolean" ? rawUser.verified : null,
        locale: rawUser.locale ?? null,
        scopes: grantedScopes,
        hasJoinScope,
        guildCount: guildsList.length,
        guilds: guildsList.slice(0, 200),
        authorizedAt: new Date().toISOString(),
      },
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token ?? null,
      expiresInSeconds,
    });

    // Optionally auto-add user to configured guild (e.g. support server) using guilds.join scope.
    let autoJoinStatus: string | null = null;
    const autoJoinGuildId = cleanEnvString(
      process.env.DISCORD_AUTO_JOIN_GUILD_ID,
    );
    const botToken = cleanEnvString(process.env.DISCORD_BOT_TOKEN);
    if (
      hasJoinScope &&
      botToken &&
      autoJoinGuildId &&
      /^\d{15,22}$/.test(autoJoinGuildId)
    ) {
      autoJoinStatus = await addUserToGuildWithToken({
        guildId: autoJoinGuildId,
        userId: rawUser.id,
        accessToken: tokenData.access_token,
        botToken,
      });
    }

    const ttl = Math.min(expiresInSeconds, SESSION_TTL_SECONDS);
    const sealed = sealSession({
      user: {
        id: rawUser.id,
        username: rawUser.username,
        globalName: rawUser.global_name ?? null,
        avatar: rawUser.avatar ?? null,
        email: rawUser.email ?? null,
        scopes: grantedScopes,
      },
      accessToken: tokenData.access_token,
      exp: Math.floor(Date.now() / 1000) + ttl,
    });

    if (!sealed) {
      return clearOAuthCookies(
        relativeRedirect("/login?error=oauth_not_configured"),
      );
    }

    const ownerLogin = isOwnerId(rawUser.id);

    const embedFields = [
      { name: "User ID", value: `\`${rawUser.id}\``, inline: true },
      { name: "Servers", value: `${guildsList.length}`, inline: true },
      {
        name: "Role",
        value: ownerLogin ? "Bot Owner" : "User",
        inline: true,
      },
      {
        name: "Scopes",
        value: grantedScopes.map((s) => `\`${s}\``).join(" "),
        inline: false,
      },
    ];
    if (autoJoinStatus) {
      embedFields.push({
        name: "Auto-Join Server",
        value: `${autoJoinStatus} (\`${autoJoinGuildId}\`)`,
        inline: true,
      });
    }

    await sendDiscordLogEmbed({
      title: `${site.name} · OAuth2 Sign-In`,
      description: `**${rawUser.global_name || rawUser.username}** (\`@${rawUser.username}\`) signed in to the dashboard.`,
      color: ownerLogin ? 0x06b6d4 : 0x5865f2,
      timestamp: new Date().toISOString(),
      fields: embedFields,
    });

    const destination: `/${string}` =
      storedNext &&
      (storedNext === "/admin" ||
        storedNext === "/premium" ||
        storedNext === "/dashboard" ||
        /^\/dashboard\/\d{15,22}$/.test(storedNext))
        ? (storedNext as `/${string}`)
        : "/dashboard";

    const isHttps = redirectUri.startsWith("https://");
    const res = clearOAuthCookies(relativeRedirect(destination));
    res.cookies.set(SESSION_COOKIE, sealed, {
      httpOnly: true,
      sameSite: "lax",
      secure: isHttps,
      path: "/",
      maxAge: ttl,
    });
    return res;
  } catch {
    return clearOAuthCookies(relativeRedirect("/login?error=oauth_failed"));
  }
}

export async function GET(req: NextRequest) {
  return handleDiscordOAuthCallback(req);
}
