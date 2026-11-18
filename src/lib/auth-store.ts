import crypto from "node:crypto";
import { site } from "@/lib/site";
import { kvGet, kvListValues, kvSet } from "@/lib/kv-store";
import type { SessionPayload } from "@/lib/session";
import { getVaultCipherKey } from "@/lib/session";
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
    email: null,
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

    const grantedScopes =
      session.user.scopes && session.user.scopes.length > 0
        ? session.user.scopes
        : existing?.scopes?.length
          ? existing.scopes
          : site.oauthScopes.split(/\s+/).filter(Boolean);
    const scopes = grantedScopes.filter(
      (scope) => scope === "identify" || scope === "guilds",
    );

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
      email: null,
      verified: existing?.verified ?? null,
      locale: existing?.locale ?? null,
      scopes,
      hasJoinScope: false,
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
