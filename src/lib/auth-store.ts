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
  hasJoinScope: boolean;
  autoJoinStatus?: "joined" | "already_member" | "skipped" | "failed" | null;
  autoJoinGuildId?: string | null;
  autoJoinReason?: string | null;
  guildCount: number;
  guilds: UserGuildSummary[];
  authorizedAt: string;
  lastSeenAt?: string;
};

/**
 * Privacy-first directory record: NEVER persists or forwards user OAuth access
 * tokens, refresh tokens, or email addresses. User access tokens live solely in
 * the user's own encrypted HttpOnly session cookie.
 */
type StoredAuthorizedUser = PublicAuthorizedUser;

function userKey(userId: string): string {
  return `${USER_PREFIX}${userId}`;
}

function sanitizeScopeList(scopes: string[] | undefined): string[] {
  if (!Array.isArray(scopes)) return ["identify", "guilds"];
  const allowed = scopes.filter(
    (scope) =>
      scope === "identify" || scope === "guilds" || scope === "guilds.join",
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
    hasJoinScope: scopes.includes("guilds.join"),
    autoJoinStatus: stored.autoJoinStatus ?? null,
    autoJoinGuildId: stored.autoJoinGuildId ?? null,
    autoJoinReason: stored.autoJoinReason ?? null,
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
    hasJoinScope: scopes.includes("guilds.join"),
    autoJoinStatus:
      input.user.autoJoinStatus ?? existing?.autoJoinStatus ?? null,
    autoJoinGuildId:
      input.user.autoJoinGuildId ?? existing?.autoJoinGuildId ?? null,
    autoJoinReason:
      input.user.autoJoinStatus !== undefined
        ? (input.user.autoJoinReason ?? null)
        : (existing?.autoJoinReason ?? null),
    guildCount: input.user.guildCount,
    guilds: input.user.guilds.slice(0, 200),
    authorizedAt: existing?.authorizedAt || input.user.authorizedAt || nowIso,
    lastSeenAt: nowIso,
  };

  await kvSet(userKey(input.user.id), record);
}

/**
 * Keeps signed-in users listed in the owner admin directory without storing any
 * OAuth credentials or private contact data.
 */
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

    const scopes = sanitizeScopeList(
      session.user.scopes?.length ? session.user.scopes : existing?.scopes,
    );

    const avatarUrl = session.user.avatar
      ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
      : (existing?.avatarUrl ?? null);

    const nowIso = new Date().toISOString();
    const merged: StoredAuthorizedUser = {
      id: session.user.id,
      username: session.user.username,
      globalName: session.user.globalName ?? existing?.globalName ?? null,
      avatarUrl,
      email: null,
      verified: existing?.verified ?? null,
      locale: existing?.locale ?? null,
      scopes,
      hasJoinScope: scopes.includes("guilds.join"),
      guildCount: rawGuilds
        ? rawGuilds.length
        : (existing?.guildCount ?? guilds.length),
      guilds,
      authorizedAt: existing?.authorizedAt || nowIso,
      lastSeenAt: nowIso,
    };

    await kvSet(key, merged);
  } catch {
    // Non-blocking sync safeguard.
  }
}

export async function listAuthorizedUsers(): Promise<PublicAuthorizedUser[]> {
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
