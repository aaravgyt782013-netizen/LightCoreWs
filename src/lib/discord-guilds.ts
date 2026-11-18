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

export async function fetchAllUserGuilds(
  accessToken: string,
): Promise<DiscordGuild[] | null> {
  try {
    const res = await fetch("https://discord.com/api/v10/users/@me/guilds", {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    return (await res.json()) as DiscordGuild[];
  } catch {
    return null;
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
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
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
