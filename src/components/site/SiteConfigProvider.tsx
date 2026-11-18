"use client";

import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildThemeCssVariables,
  createDefaultSiteConfig,
  mergeSiteConfig,
  type SiteConfig,
} from "@/lib/site-config";
import { ArrowRight, ShieldIcon } from "@/components/ui/Icons";

type SiteConfigContextValue = {
  config: SiteConfig;
  setLiveConfig: (next: SiteConfig) => void;
  refreshConfig: () => Promise<void>;
};

const SiteConfigContext = createContext<SiteConfigContextValue>({
  config: createDefaultSiteConfig(),
  setLiveConfig: () => {},
  refreshConfig: async () => {},
});

const LOCAL_CACHE_KEY = "lightcore_site_config_v1";

export function applySiteThemeToDom(cfg: SiteConfig) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const vars = buildThemeCssVariables(cfg);
  for (const [k, v] of Object.entries(vars)) {
    root.style.setProperty(k, v);
  }

  // Update dynamic favicon if customized
  if (cfg.faviconUrl) {
    let icon = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    if (!icon) {
      icon = document.createElement("link");
      icon.rel = "icon";
      document.head.appendChild(icon);
    }
    if (icon.href !== cfg.faviconUrl) {
      icon.href = cfg.faviconUrl;
    }
  }
}

export function SiteConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfig] = useState<SiteConfig>(() =>
    createDefaultSiteConfig(),
  );
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const setLiveConfig = useCallback((next: SiteConfig) => {
    setConfig(next);
    applySiteThemeToDom(next);
    try {
      window.localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(next));
    } catch {
      // Ignore storage quota restrictions.
    }
  }, []);

  const refreshConfig = useCallback(async () => {
    try {
      const res = await fetch("/api/site-config", { cache: "no-store" });
      if (!res.ok) return;
      const json = (await res.json()) as { config?: SiteConfig };
      if (json.config) {
        setLiveConfig(json.config);
      }
    } catch {
      // Fall back silently to defaults / cached config.
    }
  }, [setLiveConfig]);

  useEffect(() => {
    // Hydrate cached theme instantaneously before network resolves
    try {
      const raw = window.localStorage.getItem(LOCAL_CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as SiteConfig;
        if (cached && cached.brandName) {
          const safe = mergeSiteConfig(createDefaultSiteConfig(), cached);
          setConfig(safe);
          applySiteThemeToDom(safe);
        }
      }
    } catch {
      // Ignore malformed cache.
    }
    void refreshConfig();
  }, [refreshConfig]);

  const ctx = useMemo(
    () => ({ config, setLiveConfig, refreshConfig }),
    [config, setLiveConfig, refreshConfig],
  );

  const showAnnouncement =
    config.announcementEnabled &&
    Boolean(config.announcementText.trim()) &&
    !bannerDismissed;
  const showMaintenance =
    config.maintenanceEnabled && Boolean(config.maintenanceMessage.trim());

  const hasTopBanner = showAnnouncement || showMaintenance;

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--top-banner-offset",
      hasTopBanner ? "38px" : "0px",
    );
  }, [hasTopBanner]);

  return (
    <SiteConfigContext.Provider value={ctx}>
      {/* Global Live Maintenance or Announcement Strip */}
      {showMaintenance ? (
        <div className="fixed inset-x-0 top-0 z-[60] flex h-[38px] items-center justify-center gap-2 border-b border-amber-400/25 bg-ink-950/95 px-3 text-center text-[11.5px] text-amber-200 backdrop-blur-xl">
          <ShieldIcon className="size-3.5 shrink-0 text-amber-300" />
          <span className="truncate font-medium">
            {config.maintenanceMessage}
          </span>
        </div>
      ) : showAnnouncement ? (
        <div className="fixed inset-x-0 top-0 z-[60] flex h-[38px] items-center justify-center gap-2.5 border-b border-brand-400/25 bg-gradient-to-r from-ink-950 via-brand-950/85 to-ink-950 px-3 text-[11.5px] text-zinc-100 backdrop-blur-xl">
          {config.announcementBadge && (
            <span className="hidden rounded-full border border-brand-400/40 bg-brand-500/20 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-brand-200 sm:inline-block">
              {config.announcementBadge}
            </span>
          )}
          <span className="truncate">{config.announcementText}</span>
          {config.announcementLinkLabel && config.announcementLinkUrl && (
            config.announcementLinkUrl.startsWith("/") ? (
              <Link
                href={config.announcementLinkUrl}
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-300 hover:text-white"
              >
                {config.announcementLinkLabel}
                <ArrowRight className="size-3" />
              </Link>
            ) : (
              <a
                href={config.announcementLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-300 hover:text-white"
              >
                {config.announcementLinkLabel}
                <ArrowRight className="size-3" />
              </a>
            )
          )}
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setBannerDismissed(true)}
            className="ml-1 shrink-0 rounded px-1.5 text-zinc-400 hover:text-white"
          >
            ×
          </button>
        </div>
      ) : null}

      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}
