import crypto from "node:crypto";
import { site } from "@/lib/site";
import { kvGet, kvListValues, kvSet } from "@/lib/kv-store";
import type { SessionPayload } from "@/lib/session";
import { getVaultCipherKey } from "@/lib/session";
import { cleanEnvString, resolveDiscordClientId } from "@/lib/discord-oauth";
import {
  canManageGuild,
  type DiscordGuild,
  fetchAllUserGuilds,
  guildIconUrl,
} from "@/lib/discord-guilds";

const USER_PREFIX = "users/";
const MAX_AUTHORIZED_USERS = 500;
const SESSION_SYNC_INTERVAL_MS = 5 * 60 * 1000;

export type UserGuildSummary = {
  id: string;
  name: string;
  iconUrl: string | null;
  owner: boolean;
  canManage: boolean;
};

export type PublicAuthorizedUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string | null;
  email: string | null;
  verified: boolean | null;
  locale: string | null;
  scopes: string[];
  hasJoinScope: boolean;
  guildCount: number;
  guilds: UserGuildSummary[];
  authorizedAt: string;
  lastSeenAt?: string;
};

type StoredAuthorizedUser = PublicAuthorizedUser & {
  encryptedAccessToken: string | null;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: number;
};

function userKey(userId: string): string {
  return `${USER_PREFIX}${userId}`;
}

function getCipherKey(): Buffer | null {
  return getVaultCipherKey();
}

function encryptSecret(plain: string): string | null {
  const key = getCipherKey();
  if (!key) return null;
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${tag.toString("base64url")}.${enc.toString("base64url")}`;
}

function decryptSecret(sealed: string | null): string | null {
  if (!sealed) return null;
  const key = getCipherKey();
  if (!key) return null;
  const parts = sealed.split(".");
  if (parts.length !== 3) return null;
  try {
    const iv = Buffer.from(parts[0], "base64url");
    const tag = Buffer.from(parts[1], "base64url");
    const enc = Buffer.from(parts[2], "base64url");
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(enc), decipher.final()]).toString(
      "utf8",
    );
  } catch {
    return null;
  }
}

function toPublicUser(stored: StoredAuthorizedUser): PublicAuthorizedUser {
  return {
    id: stored.id,
    username: stored.username,
    globalName: stored.globalName,
    avatarUrl: stored.avatarUrl,
    email: stored.email,
    verified: stored.verified,
    locale: stored.locale,
    scopes: stored.scopes,
    hasJoinScope: stored.hasJoinScope,
    guildCount: stored.guildCount,
    guilds: stored.guilds,
    authorizedAt: stored.authorizedAt,
    lastSeenAt: stored.lastSeenAt || stored.authorizedAt,
  };
}

export async function recordAuthorizedUser(input: {
  user: PublicAuthorizedUser;
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds: number;
}): Promise<void> {
  const existing = await kvGet<StoredAuthorizedUser>(userKey(input.user.id));
  const encryptedAccessToken =
    encryptSecret(input.accessToken) ?? existing?.encryptedAccessToken ?? null;
  const encryptedRefreshToken = input.refreshToken
    ? encryptSecret(input.refreshToken)
    : (existing?.encryptedRefreshToken ?? null);

  const nowIso = new Date().toISOString();
  const record: StoredAuthorizedUser = {
    ...input.user,
    authorizedAt: existing?.authorizedAt || input.user.authorizedAt || nowIso,
    lastSeenAt: nowIso,
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt: Date.now() + input.expiresInSeconds * 1000,
  };

  await kvSet(userKey(input.user.id), record);

  // Optional forwarding to the bot's own persistent API backend if configured.
  const botApiUrl = process.env.BOT_API_URL?.replace(/\/+$/, "");
  if (botApiUrl && process.env.BOT_API_KEY) {
    try {
      await fetch(`${botApiUrl}/oauth-users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BOT_API_KEY}`,
        },
        body: JSON.stringify({
          user: input.user,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken ?? null,
          expiresIn: input.expiresInSeconds,
        }),
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      // Non-fatal if bot API doesn't implement /oauth-users.
    }
  }
}

/**
 * Ensures any user with an active session cookie is persisted in the store
 * (even if they authenticated before persistent storage was active or on a
 * separate serverless instance).
 */
export async function ensureSessionUserRecorded(
  session: SessionPayload,
  prefetchedGuilds?: DiscordGuild[] | null,
): Promise<void> {
  try {
    const key = userKey(session.user.id);
    const existing = await kvGet<StoredAuthorizedUser>(key);
    const lastMs = existing?.lastSeenAt
      ? Date.parse(existing.lastSeenAt)
      : 0;

    if (
      existing &&
      Number.isFinite(lastMs) &&
      Date.now() - lastMs < SESSION_SYNC_INTERVAL_MS &&
      (existing.guildCount > 0 || !prefetchedGuilds?.length)
    ) {
      return;
    }

    const rawGuilds =
      prefetchedGuilds !== undefined
        ? prefetchedGuilds
        : existing?.guilds?.length
          ? null
          : await fetchAllUserGuilds(session.accessToken);

    const guilds: UserGuildSummary[] = rawGuilds
      ? rawGuilds.slice(0, 200).map((g) => ({
          id: g.id,
          name: g.name,
          iconUrl: guildIconUrl(g.id, g.icon),
          owner: g.owner,
          canManage: canManageGuild(g),
        }))
      : (existing?.guilds ?? []);

    const scopes =
      session.user.scopes && session.user.scopes.length > 0
        ? session.user.scopes
        : existing?.scopes?.length
          ? existing.scopes
          : site.oauthScopes.split(/\s+/).filter(Boolean);

    const avatarUrl = session.user.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
      : (existing?.avatarUrl ?? null);

    const nowIso = new Date().toISOString();
    const ttlMs = Math.max(60_000, session.exp * 1000 - Date.now());
    const encAccess =
      encryptSecret(session.accessToken) ??
      existing?.encryptedAccessToken ??
      null;

    const merged: StoredAuthorizedUser = {
      id: session.user.id,
      username: session.user.username,
      globalName: session.user.globalName ?? existing?.globalName ?? null,
      avatarUrl,
      email: session.user.email ?? existing?.email ?? null,
      verified: existing?.verified ?? null,
      locale: existing?.locale ?? null,
      scopes,
      hasJoinScope: scopes.includes("guilds.join"),
      guildCount: rawGuilds ? rawGuilds.length : (existing?.guildCount ?? guilds.length),
      guilds,
      authorizedAt: existing?.authorizedAt || nowIso,
      lastSeenAt: nowIso,
      encryptedAccessToken: encAccess,
      encryptedRefreshToken: existing?.encryptedRefreshToken ?? null,
      tokenExpiresAt: existing?.tokenExpiresAt || Date.now() + ttlMs,
    };

    await kvSet(key, merged);
  } catch {
    // Non-blocking sync safeguard.
  }
}

export async function listAuthorizedUsers(): Promise<PublicAuthorizedUser[]> {
  // Prefer remote Bot API user store if explicitly configured and returns users.
  const stored = await kvListValues<StoredAuthorizedUser>(
    USER_PREFIX,
    MAX_AUTHORIZED_USERS,
  );
  return stored
    .filter((u) => Boolean(u && u.id && u.username))
    .sort((a, b) => {
      const ta = Date.parse(a.lastSeenAt || a.authorizedAt || "") || 0;
      const tb = Date.parse(b.lastSeenAt || b.authorizedAt || "") || 0;
      return tb - ta;
    })
    .map(toPublicUser);
}

async function getValidAccessToken(
  stored: StoredAuthorizedUser,
): Promise<string | null> {
  const current = decryptSecret(stored.encryptedAccessToken);
  if (current && stored.tokenExpiresAt > Date.now() + 60_000) {
    return current;
  }

  const refresh = decryptSecret(stored.encryptedRefreshToken);
  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  if (!refresh || !clientSecret) return current;

  try {
    const res = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        "User-Agent": "LightCore (https://lightcorews.netlify.app, 2.0)",
      },
      body: new URLSearchParams({
        client_id: resolveDiscordClientId(),
        client_secret: clientSecret,
        grant_type: "refresh_token",
        refresh_token: refresh,
      }),
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return current;
    const data = (await res.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in?: number;
    };
    const nextEnc = encryptSecret(data.access_token);
    if (nextEnc) {
      stored.encryptedAccessToken = nextEnc;
      stored.tokenExpiresAt =
        Date.now() + (data.expires_in ?? 604800) * 1000;
    }
    if (data.refresh_token) {
      const nextRef = encryptSecret(data.refresh_token);
      if (nextRef) stored.encryptedRefreshToken = nextRef;
    }
    await kvSet(userKey(stored.id), stored);
    return data.access_token;
  } catch {
    return current;
  }
}

export async function addUserToGuildWithToken(options: {
  guildId: string;
  userId: string;
  accessToken: string;
  botToken: string;
}): Promise<"added" | "already_member" | "failed"> {
  try {
    const res = await fetch(
      `https://discord.com/api/v10/guilds/${options.guildId}/members/${options.userId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bot ${options.botToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: options.accessToken }),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (res.status === 201) return "added";
    if (res.status === 204) return "already_member";
    return "failed";
  } catch {
    return "failed";
  }
}

export async function addStoredUsersToGuild(options: {
  guildId: string;
  userIds?: string[];
  botToken: string;
}): Promise<{
  total: number;
  added: number;
  alreadyMember: number;
  failed: number;
}> {
  let targets: StoredAuthorizedUser[];

  if (options.userIds?.length) {
    const fetched = await Promise.all(
      options.userIds.slice(0, 25).map((id) =>
        kvGet<StoredAuthorizedUser>(userKey(id)),
      ),
    );
    targets = fetched.filter(
      (u): u is StoredAuthorizedUser => Boolean(u && u.hasJoinScope),
    );
  } else {
    const all = await kvListValues<StoredAuthorizedUser>(
      USER_PREFIX,
      MAX_AUTHORIZED_USERS,
    );
    targets = all.filter((u) => u.hasJoinScope);
  }

  let added = 0;
  let alreadyMember = 0;
  let failed = 0;

  for (const user of targets.slice(0, 25)) {
    const token = await getValidAccessToken(user);
    if (!token) {
      failed += 1;
      continue;
    }
    const outcome = await addUserToGuildWithToken({
      guildId: options.guildId,
      userId: user.id,
      accessToken: token,
      botToken: options.botToken,
    });
    if (outcome === "added") added += 1;
    else if (outcome === "already_member") alreadyMember += 1;
    else failed += 1;
  }

  return {
    total: Math.min(targets.length, 25),
    added,
    alreadyMember,
    failed,
  };
}
