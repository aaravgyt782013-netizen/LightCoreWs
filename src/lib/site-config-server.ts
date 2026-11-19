import { kvDelete, kvGet, kvSet } from "@/lib/kv-store";
import {
  createDefaultSiteConfig,
  mergeSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";

const SITE_CONFIG_KEY = "site/config-v3";
const LEGACY_KEYS = ["site/config-v2", "site/config-v1"] as const;

export async function getSiteConfig(): Promise<SiteConfig> {
  const base = createDefaultSiteConfig();
  const envRole = process.env.DISCORD_PREMIUM_ROLE_ID?.trim() || "";
  if (envRole) base.premiumRoleId = envRole;

  let stored = await kvGet<Partial<SiteConfig>>(SITE_CONFIG_KEY);
  if (!stored) {
    for (const legacyKey of LEGACY_KEYS) {
      const legacy = await kvGet<Partial<SiteConfig>>(legacyKey);
      if (legacy) {
        // Carry forward custom pricing, premiumRoleId, and custom announcements while
        // smoothly upgrading theme, surface, logo, tagline, and hero copy to Solar Gold & Velvet Black.
        const {
          themePreset: _t,
          surfacePreset: _s,
          customAccentHex: _h,
          showGrid: _g,
          tagline: _tag,
          description: _desc,
          heroSubtext: _sub,
          loaderText: _loader,
          logoUrl: _logo,
          faviconUrl: _fav,
          ...kept
        } = legacy;
        void _t;
        void _s;
        void _h;
        void _g;
        void _tag;
        void _desc;
        void _sub;
        void _loader;
        void _logo;
        void _fav;
        stored = kept;
        break;
      }
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
  for (const k of LEGACY_KEYS) {
    await kvDelete(k);
  }
  const fresh = createDefaultSiteConfig();
  fresh.updatedAt = new Date().toISOString();
  fresh.updatedBy = updatedBy;
  await kvSet(SITE_CONFIG_KEY, fresh);
  return fresh;
}
