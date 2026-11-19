import crypto from "node:crypto";
import {
  cleanEnvString,
  isAutoJoinDisabledByEnv,
  resolveAutoJoinGuildId,
  resolveAutoJoinRoleId,
} from "@/lib/discord-oauth";

export type DiscordGuild = {
  id: string;
  name: string;
  icon: string | null;
  owner: boolean;
  permissions: string;
};

const ADMIN_OR_MANAGE = BigInt(0x8) | BigInt(0x20);

export function canManageGuild(g: DiscordGuild): boolean {
  if (g.owner) return true;
  try {
    return (BigInt(g.permissions) & ADMIN_OR_MANAGE) !== BigInt(0);
  } catch {
    return false;
  }
}

export function guildIconUrl(guildId: string, icon: string | null): string | null {
  if (!icon) return null;
  const ext = icon.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=128`;
}

type CachedUserGuilds = {
  guilds: DiscordGuild[];
  expiresAt: number;
};

type UserGuildGlobalCache = typeof globalThis & {
  __lightcoreUserGuildCache?: Map<string, CachedUserGuilds>;
};

export async function fetchAllUserGuilds(
  accessToken: string,
): Promise<DiscordGuild[] | null> {
  const g = globalThis as UserGuildGlobalCache;
  if (!g.__lightcoreUserGuildCache) {
    g.__lightcoreUserGuildCache = new Map();
  }
  const cacheKey = crypto
    .createHash("sha256")
    .update(accessToken)
    .digest("hex")
    .slice(0, 24);

  const cached = g.__lightcoreUserGuildCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.guilds;
  }

  try {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
        "User-Agent": "LightCore (https://lightcorews.onrender.com, 2.0)",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(5500),
    });
    if (!res.ok) return cached ? cached.guilds : null;
    const guilds = (await res.json()) as DiscordGuild[];
    g.__lightcoreUserGuildCache.set(cacheKey, {
      guilds,
      expiresAt: Date.now() + 30_000,
    });
    if (g.__lightcoreUserGuildCache.size > 200) {
      const first = g.__lightcoreUserGuildCache.keys().next().value;
      if (first) g.__lightcoreUserGuildCache.delete(first);
    }
    return guilds;
  } catch {
    return cached ? cached.guilds : null;
  }
}

export type AutoJoinResult = {
  status: "joined" | "already_member" | "skipped" | "failed";
  guildId?: string;
  roleAssigned?: boolean;
  reason?: string;
};

async function putGuildMember(input: {
  guildId: string;
  userId: string;
  botToken: string;
  accessToken: string;
  roleId?: string;
}): Promise<Response> {
  const payload: { access_token: string; roles?: string[] } = {
    access_token: input.accessToken,
  };
  if (input.roleId) {
    payload.roles = [input.roleId];
  }

  const endpoint = `https://discord.com/api/v10/guilds/${input.guildId}/members/${input.userId}`;
  const reqInit: RequestInit = {
    method: "PUT",
    headers: {
      Authorization: `Bot ${input.botToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": "LightCore (https://lightcorews.onrender.com, 2.0)",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
    signal: AbortSignal.timeout(5500),
  };

  const first = await fetch(endpoint, reqInit);
  if (first.status !== 429) return first;

  // Respect short Discord rate-limit windows so back-to-back sign-ins still join.
  try {
    const body = (await first.json()) as { retry_after?: number };
    const waitMs = Math.ceil((Number(body.retry_after) || 0.8) * 1000);
    if (waitMs > 0 && waitMs <= 2500) {
      await new Promise((r) => setTimeout(r, waitMs));
      return await fetch(endpoint, {
        ...reqInit,
        signal: AbortSignal.timeout(5000),
      });
    }
  } catch {
    // Fall through to returning initial 429
  }
  return first;
}

/**
 * Automatically adds an authorizing Discord user to the configured target server
 * using Discord's official OAuth2 `guilds.join` endpoint:
 *   PUT /api/v10/guilds/{guild.id}/members/{user.id}
 * Requires:
 *  1. The user approved the `guilds.join` OAuth2 scope.
 *  2. The application's bot is inside the target server with `CREATE_INSTANT_INVITE`
 *     (and `MANAGE_ROLES` above the role if an optional auto-role is set).
 */
export async function addUserToConfiguredGuild(input: {
  userId: string;
  accessToken: string;
  guildIdOverride?: string | null;
  roleIdOverride?: string | null;
  enabled?: boolean;
}): Promise<AutoJoinResult> {
  if (input.enabled === false || isAutoJoinDisabledByEnv()) {
    return { status: "skipped", reason: "auto_join_disabled" };
  }

  const guildId = resolveAutoJoinGuildId(input.guildIdOverride);
  if (!/^\d{15,22}$/.test(guildId)) {
    return { status: "skipped", reason: "target_guild_not_configured" };
  }
  if (!/^\d{15,22}$/.test(input.userId)) {
    return { status: "failed", guildId, reason: "invalid_user_id" };
  }
  const token = cleanEnvString(process.env.DISCORD_BOT_TOKEN)
    .replace(/^Bot\s+/i, "")
    .trim();
  if (!token) {
    return { status: "skipped", guildId, reason: "bot_token_not_configured" };
  }

  const roleId = resolveAutoJoinRoleId(input.roleIdOverride);

  try {
    let usedRole = Boolean(roleId);
    let res = await putGuildMember({
      guildId,
      userId: input.userId,
      botToken: token,
      accessToken: input.accessToken,
      roleId: roleId || undefined,
    });

    // If role hierarchy blocked the PUT, retry cleanly without `roles` so the
    // user is still automatically added to the server.
    if (usedRole && (res.status === 403 || res.status === 400)) {
      usedRole = false;
      res = await putGuildMember({
        guildId,
        userId: input.userId,
        botToken: token,
        accessToken: input.accessToken,
      });
    }

    if (res.status === 201) {
      return { status: "joined", guildId, roleAssigned: usedRole };
    }
    if (res.status === 204) {
      // User is already in the guild; if an auto-role is configured, best-effort assign it.
      if (roleId) {
        try {
          const roleRes = await fetch(
            `https://discord.com/api/v10/guilds/${guildId}/members/${input.userId}/roles/${roleId}`,
            {
              method: "PUT",
              headers: {
                Authorization: `Bot ${token}`,
                "User-Agent": "LightCore (https://lightcorews.onrender.com, 2.0)",
              },
              cache: "no-store",
              signal: AbortSignal.timeout(3500),
            },
          );
          return {
            status: "already_member",
            guildId,
            roleAssigned: roleRes.status === 204,
          };
        } catch {
          return { status: "already_member", guildId, roleAssigned: false };
        }
      }
      return { status: "already_member", guildId };
    }
    if (res.status === 401) {
      return { status: "failed", guildId, reason: "invalid_bot_or_user_token" };
    }
    if (res.status === 403) {
      return {
        status: "failed",
        guildId,
        reason: "bot_missing_guild_or_create_invite_permission",
      };
    }
    if (res.status === 404) {
      return {
        status: "failed",
        guildId,
        reason: "target_guild_or_bot_not_found",
      };
    }
    if (res.status === 400) {
      return {
        status: "failed",
        guildId,
        reason: "max_guilds_reached_or_invalid_request",
      };
    }
    if (res.status === 429) {
      return { status: "failed", guildId, reason: "discord_rate_limited" };
    }
    return { status: "failed", guildId, reason: `discord_api_http_${res.status}` };
  } catch {
    return { status: "failed", guildId, reason: "discord_api_unavailable" };
  }
}

export async function fetchManageableGuilds(
  accessToken: string,
): Promise<DiscordGuild[] | null> {
  const all = await fetchAllUserGuilds(accessToken);
  if (!all) return null;
  return all.filter(canManageGuild);
}

type CachedBotGuilds = {
  guilds: { id: string; name: string; iconUrl: string | null }[];
  ids: Set<string>;
  expiresAt: number;
};

type GlobalCache = typeof globalThis & {
  __lightcoreBotGuildsV2?: CachedBotGuilds;
};

export async function fetchBotGuilds(): Promise<CachedBotGuilds | null> {
  const token = process.env.DISCORD_BOT_TOKEN
    ?.trim()
    .replace(/^["']|["']$/g, "")
    .replace(/^Bot\s+/i, "")
    .trim();
  if (!token) return null;

  const g = globalThis as GlobalCache;
  if (
    g.__lightcoreBotGuildsV2 &&
    g.__lightcoreBotGuildsV2.expiresAt > Date.now()
  ) {
    return g.__lightcoreBotGuildsV2;
  }

  try {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as {
      id: string;
      name: string;
      icon: string | null;
    }[];
    const guilds = raw.map((x) => ({
      id: x.id,
      name: x.name,
      iconUrl: guildIconUrl(x.id, x.icon),
    }));
    const entry: CachedBotGuilds = {
      guilds,
      ids: new Set(guilds.map((x) => x.id)),
      expiresAt: Date.now() + 60_000,
    };
    g.__lightcoreBotGuildsV2 = entry;
    return entry;
  } catch {
    return null;
  }
}

export type DiscordChannelOption = {
  id: string;
  name: string;
  type: "text" | "voice" | "category";
  position: number;
};

export type DiscordRoleOption = {
  id: string;
  name: string;
  color: string | null;
  position: number;
};

export type LiveGuildDetails = {
  botInGuild: boolean;
  memberCount: number | null;
  onlineCount: number | null;
  boostCount: number | null;
  boostTier: number | null;
  channels: DiscordChannelOption[];
  roles: DiscordRoleOption[];
};

export async function fetchLiveGuildDetails(
  guildId: string,
): Promise<LiveGuildDetails | null> {
  const token = cleanEnvString(process.env.DISCORD_BOT_TOKEN)
    .replace(/^Bot\s+/i, "")
    .trim();
  if (!token) return null;

  const headers = { Authorization: `Bot ${token}` };

  try {
    const [guildRes, chanRes, roleRes] = await Promise.all([
      fetch(
        `https://discord.com/api/v10/guilds/${guildId}?with_counts=true`,
        { headers, cache: "no-store", signal: AbortSignal.timeout(5000) },
      ),
      fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }),
      fetch(`https://discord.com/api/v10/guilds/${guildId}/roles`, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(5000),
      }),
    ]);

    if (!guildRes.ok) {
      return {
        botInGuild: false,
        memberCount: null,
        onlineCount: null,
        boostCount: null,
        boostTier: null,
        channels: [],
        roles: [],
      };
    }

    const guildData = (await guildRes.json()) as {
      approximate_member_count?: number;
      approximate_presence_count?: number;
      premium_subscription_count?: number;
      premium_tier?: number;
    };

    const rawChannels = chanRes.ok
      ? ((await chanRes.json()) as {
          id: string;
          name: string;
          type: number;
          position?: number;
        }[])
      : [];

    const channels: DiscordChannelOption[] = rawChannels
      .filter((c) => c.type === 0 || c.type === 5 || c.type === 2 || c.type === 4)
      .map((c) => ({
        id: c.id,
        name: c.name,
        type:
          c.type === 2
            ? ("voice" as const)
            : c.type === 4
              ? ("category" as const)
              : ("text" as const),
        position: c.position ?? 0,
      }))
      .sort((a, b) => a.position - b.position);

    const rawRoles = roleRes.ok
      ? ((await roleRes.json()) as {
          id: string;
          name: string;
          color: number;
          position: number;
          managed?: boolean;
        }[])
      : [];

    const roles: DiscordRoleOption[] = rawRoles
      .filter((r) => r.id !== guildId && !r.managed)
      .sort((a, b) => b.position - a.position)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color ? `#${r.color.toString(16).padStart(6, "0")}` : null,
        position: r.position,
      }));

    return {
      botInGuild: true,
      memberCount: guildData.approximate_member_count ?? null,
      onlineCount: guildData.approximate_presence_count ?? null,
      boostCount: guildData.premium_subscription_count ?? null,
      boostTier: guildData.premium_tier ?? null,
      channels,
      roles,
    };
  } catch {
    return null;
  }
}
