import crypto from "node:crypto";
import { site } from "@/lib/site";

const MAX_AUTHORIZED_USERS = 500;

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
};

type StoredAuthorizedUser = PublicAuthorizedUser & {
  encryptedAccessToken: string;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: number;
};

type GlobalAuthStore = typeof globalThis & {
  __lightcoreAuthUsers?: Map<string, StoredAuthorizedUser>;
};

function getMap(): Map<string, StoredAuthorizedUser> {
  const g = globalThis as GlobalAuthStore;
  if (!g.__lightcoreAuthUsers) {
    g.__lightcoreAuthUsers = new Map();
  }
  return g.__lightcoreAuthUsers;
}

function getCipherKey(): Buffer | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) return null;
  return crypto.scryptSync(secret, "lightcore-oauth-vault-v1", 32);
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

function decryptSecret(sealed: string): string | null {
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

export async function recordAuthorizedUser(input: {
  user: PublicAuthorizedUser;
  accessToken: string;
  refreshToken?: string | null;
  expiresInSeconds: number;
}): Promise<void> {
  const encryptedAccessToken = encryptSecret(input.accessToken);
  if (!encryptedAccessToken) return;

  const encryptedRefreshToken = input.refreshToken
    ? encryptSecret(input.refreshToken)
    : null;

  const map = getMap();
  map.delete(input.user.id);
  map.set(input.user.id, {
    ...input.user,
    encryptedAccessToken,
    encryptedRefreshToken,
    tokenExpiresAt: Date.now() + input.expiresInSeconds * 1000,
  });

  if (map.size > MAX_AUTHORIZED_USERS) {
    const oldestKey = map.keys().next().value;
    if (oldestKey) map.delete(oldestKey);
  }

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

export function listAuthorizedUsers(): PublicAuthorizedUser[] {
  const result: PublicAuthorizedUser[] = [];
  for (const stored of getMap().values()) {
    result.push({
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
    });
  }
  return result.reverse();
}

async function getValidAccessToken(
  stored: StoredAuthorizedUser,
): Promise<string | null> {
  const current = decryptSecret(stored.encryptedAccessToken);
  if (current && stored.tokenExpiresAt > Date.now() + 60_000) {
    return current;
  }

  const refresh = stored.encryptedRefreshToken
    ? decryptSecret(stored.encryptedRefreshToken)
    : null;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  if (!refresh || !clientSecret) return current;

  try {
    const res = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: site.clientId,
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
  const map = getMap();
  const targets = options.userIds?.length
    ? options.userIds
        .map((id) => map.get(id))
        .filter((u): u is StoredAuthorizedUser => Boolean(u && u.hasJoinScope))
    : Array.from(map.values()).filter((u) => u.hasJoinScope);

  let added = 0;
  let alreadyMember = 0;
  let failed = 0;

  // Cap per-request batch to 25 to respect Discord's guild member join rate limits.
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
