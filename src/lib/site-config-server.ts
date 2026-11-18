import { kvDelete, kvGet, kvSet } from "@/lib/kv-store";
import {
  createDefaultSiteConfig,
  mergeSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";

const SITE_CONFIG_KEY = "site/config-v1";

export async function getSiteConfig(): Promise<SiteConfig> {
  const base = createDefaultSiteConfig();
  const envRole = process.env.DISCORD_PREMIUM_ROLE_ID?.trim() || "";
  if (envRole) base.premiumRoleId = envRole;

  const stored = await kvGet<Partial<SiteConfig>>(SITE_CONFIG_KEY);
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
  const fresh = createDefaultSiteConfig();
  fresh.updatedAt = new Date().toISOString();
  fresh.updatedBy = updatedBy;
  await kvSet(SITE_CONFIG_KEY, fresh);
  return fresh;
}
