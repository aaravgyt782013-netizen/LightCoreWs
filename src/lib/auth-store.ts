import { kvGet, kvListValues, kvSet } from "@/lib/kv-store";
import type { SessionPayload } from "@/lib/session";
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
  guildCount: number;
  guilds: UserGuildSummary[];
  authorizedAt: string;
  lastSeenAt?: string;
};

/**
 * Privacy-first directory record: never persists or forwards user OAuth access
 * tokens, refresh tokens, or email addresses.
 */
type StoredAuthorizedUser = PublicAuthorizedUser;

function userKey(userId: string): string {
  return `${USER_PREFIX}${userId}`;
}

function sanitizeScopeList(scopes: string[] | undefined): string[] {
  if (!Array.isArray(scopes)) return ["identify", "guilds"];
  const allowed = scopes.filter(
    (scope) => scope === "identify" || scope === "guilds",
  );
  return allowed.length > 0 ? allowed : ["identify", "guilds"];
}

function toPublicUser(stored: StoredAuthorizedUser): PublicAuthorizedUser {
  const scopes = sanitizeScopeList(stored.scopes);
  return {
    id: stored.id,
    username: stored.username,
    globalName: stored.globalName,
    avatarUrl: stored.avatarUrl,
    email: null,
    verified: stored.verified ?? null,
    locale: stored.locale ?? null,
    scopes,
    guildCount: stored.guildCount,
    guilds: Array.isArray(stored.guilds) ? stored.guilds : [],
    authorizedAt: stored.authorizedAt,
    lastSeenAt: stored.lastSeenAt || stored.authorizedAt,
  };
}

export async function recordAuthorizedUser(input: {
  user: PublicAuthorizedUser;
}): Promise<void> {
  const existing = await kvGet<StoredAuthorizedUser>(userKey(input.user.id));
  const nowIso = new Date().toISOString();
  const scopes = sanitizeScopeList(input.user.scopes);

  const record: StoredAuthorizedUser = {
    id: input.user.id,
    username: input.user.username,
    globalName: input.user.globalName,
    avatarUrl: input.user.avatarUrl,
    email: null,
    verified: input.user.verified ?? null,
    locale: input.user.locale ?? null,
    scopes,
    guildCount: input.user.guildCount,
    guilds: input.user.guilds.slice(0, 200),
    authorizedAt: existing?.authorizedAt || input.user.authorizedAt || nowIso,
    lastSeenAt: nowIso,
  };

  await kvSet(userKey(input.user.id), record);
}

export async function ensureSessionUserRecorded(
  session: SessionPayload,
  prefetchedGuilds?: DiscordGuild[] | null,
): Promise<void> {
  try {
    const key = userKey(session.user.id);
    const existing = await kvGet<StoredAuthorizedUser>(key);
    const lastMs = existing?.lastSeenAt ? Date.parse(existing.lastSeenAt) : 0;

    if (
      existing &&
      Number.isFinite(lastMs) &&
      Date.now() - lastMs < SESSION_SYNC_INTERVAL_MS &&
      (existing.guildCount > 0 || !prefetchedGuilds?.length)
    ) {
      return;
    }

    let rawGuilds: DiscordGuild[] | null = prefetchedGuilds ?? null;
    if (!rawGuilds && session.user.scopes?.includes("guilds")) {
      rawGuilds = await Promise.race([
        fetchAllUserGuilds(session.accessToken),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500)),
      ]);
    }

    const guilds: UserGuildSummary[] = rawGuilds
      ? rawGuilds.slice(0, 200).map((g) => ({
          id: g.id,
          name: g.name,
          iconUrl: guildIconUrl(g.id, g.icon),
          owner: g.owner,
          canManage: canManageGuild(g),
        }))
      : (existing?.guilds ?? []);

    const avatarUrl = session.user.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
      : (existing?.avatarUrl ?? null);

    const nowIso = new Date().toISOString();
    const scopes = sanitizeScopeList(session.user.scopes);

    const updated: StoredAuthorizedUser = {
      id: session.user.id,
      username: session.user.username,
      globalName: session.user.globalName ?? existing?.globalName ?? null,
      avatarUrl,
      email: null,
      verified: existing?.verified ?? null,
      locale: existing?.locale ?? null,
      scopes,
      guildCount: rawGuilds
        ? rawGuilds.length
        : (existing?.guildCount ?? guilds.length),
      guilds,
      authorizedAt: existing?.authorizedAt ?? nowIso,
      lastSeenAt: nowIso,
    };

    await kvSet(key, updated);
  } catch {
    // Non-fatal directory refresh
  }
}

export async function listAuthorizedUsers(): Promise<PublicAuthorizedUser[]> {
  const rows = await kvListValues<StoredAuthorizedUser>(
    USER_PREFIX,
    MAX_AUTHORIZED_USERS,
  );
  return rows
    .filter((r): r is StoredAuthorizedUser => Boolean(r && r.id && r.username))
    .map(toPublicUser)
    .sort((a, b) =>
      (b.lastSeenAt || b.authorizedAt).localeCompare(
        a.lastSeenAt || a.authorizedAt,
      ),
    );
}
