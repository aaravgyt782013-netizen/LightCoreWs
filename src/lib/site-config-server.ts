import { kvDelete, kvGet, kvSet } from "@/lib/kv-store";
import {
  createDefaultSiteConfig,
  mergeSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";

const SITE_CONFIG_KEY = "site/config-v2";
const LEGACY_SITE_CONFIG_KEY = "site/config-v1";

export async function getSiteConfig(): Promise<SiteConfig> {
  const base = createDefaultSiteConfig();
  const envRole = process.env.DISCORD_PREMIUM_ROLE_ID?.trim() || "";
  if (envRole) base.premiumRoleId = envRole;

  let stored = await kvGet<Partial<SiteConfig>>(SITE_CONFIG_KEY);
  if (!stored) {
    const legacy = await kvGet<Partial<SiteConfig>>(LEGACY_SITE_CONFIG_KEY);
    if (legacy) {
      // Carry forward custom branding/pricing/logos while upgrading default theme to Crimson & Obsidian Black.
      const {
        themePreset: _legacyTheme,
        surfacePreset: _legacySurface,
        customAccentHex: _legacyHex,
        ...kept
      } = legacy;
      void _legacyTheme;
      void _legacySurface;
      void _legacyHex;
      stored = kept;
    }
  }
  if (!stored) return base;

  const merged = mergeSiteConfig(base, stored);
  merged.updatedAt = typeof stored.updatedAt === "string" ? stored.updatedAt : null;
  merged.updatedBy = typeof stored.updatedBy === "string" ? stored.updatedBy : null;
  if (!merged.premiumRoleId && envRole) {
    merged.premiumRoleId = envRole;
  }
  return merged;
}

export async function saveSiteConfig(
  patch: unknown,
  updatedBy: string,
): Promise<SiteConfig> {
  const current = await getSiteConfig();
  const next = mergeSiteConfig(current, patch, updatedBy);
  await kvSet(SITE_CONFIG_KEY, next);
  return next;
}

export async function resetSiteConfig(updatedBy: string): Promise<SiteConfig> {
  await kvDelete(SITE_CONFIG_KEY);
  await kvDelete(LEGACY_SITE_CONFIG_KEY);
  const fresh = createDefaultSiteConfig();
  fresh.updatedAt = new Date().toISOString();
  fresh.updatedBy = updatedBy;
  await kvSet(SITE_CONFIG_KEY, fresh);
  return fresh;
}
