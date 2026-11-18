import { kvGet, kvSet } from "@/lib/kv-store";
import {
  createDefaultGuildConfig,
  mergeGuildConfig,
  type GuildConfig,
} from "@/lib/guild-config";

const CONFIG_KEY_PREFIX = "guild-configs/";

export async function loadGuildConfig(guildId: string): Promise<{
  config: GuildConfig;
  syncedWithBot: boolean;
}> {
  const key = `${CONFIG_KEY_PREFIX}${guildId}`;
  const botApiUrl = process.env.BOT_API_URL?.replace(/\/+$/, "");
  if (botApiUrl) {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      if (process.env.BOT_API_KEY) {
        headers.Authorization = `Bearer ${process.env.BOT_API_KEY}`;
      }
      const res = await fetch(
        `${botApiUrl}/guilds/${encodeURIComponent(guildId)}/config`,
        {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(4000),
        },
      );
      if (res.ok) {
        const remote = (await res.json()) as unknown;
        const base = createDefaultGuildConfig();
        const merged = mergeGuildConfig(base, remote, "bot");
        await kvSet(key, merged);
        return { config: merged, syncedWithBot: true };
      }
    } catch {
      // Fall back to persistent KV store below.
    }
  }

  const existing = await kvGet<GuildConfig>(key);
  if (existing) {
    const hydrated = mergeGuildConfig(
      createDefaultGuildConfig(),
      existing,
      existing.updatedBy || "staff",
    );
    hydrated.updatedAt = existing.updatedAt ?? null;
    hydrated.updatedBy = existing.updatedBy ?? null;
    return { config: hydrated, syncedWithBot: false };
  }
  const fresh = createDefaultGuildConfig();
  return { config: fresh, syncedWithBot: false };
}

export async function saveGuildConfig(
  guildId: string,
  patch: unknown,
  updatedBy: string,
): Promise<{ config: GuildConfig; syncedWithBot: boolean }> {
  const key = `${CONFIG_KEY_PREFIX}${guildId}`;
  const { config: current } = await loadGuildConfig(guildId);
  const next = mergeGuildConfig(current, patch, updatedBy);
  await kvSet(key, next);

  let syncedWithBot = false;
  const botApiUrl = process.env.BOT_API_URL?.replace(/\/+$/, "");
  if (botApiUrl) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (process.env.BOT_API_KEY) {
        headers.Authorization = `Bearer ${process.env.BOT_API_KEY}`;
      }
      const res = await fetch(
        `${botApiUrl}/guilds/${encodeURIComponent(guildId)}/config`,
        {
          method: "PUT",
          headers,
          body: JSON.stringify(next),
          signal: AbortSignal.timeout(5000),
        },
      );
      syncedWithBot = res.ok;
    } catch {
      syncedWithBot = false;
    }
  }

  return { config: next, syncedWithBot };
}
