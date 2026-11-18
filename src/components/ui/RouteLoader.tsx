"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { LoadingScreen } from "./LoadingScreen";

function sublabelForPath(pathname: string): string {
  if (pathname.startsWith("/login")) {
    return "Preparing Discord OAuth2 gateway";
  }
  if (pathname.startsWith("/api/auth/discord")) {
    return "Redirecting to Discord authorization";
  }
  if (pathname.startsWith("/premium")) {
    return `Loading ${site.name} Premium plans`;
  }
  if (pathname.startsWith("/admin")) {
    return "Verifying owner clearance";
  }
  if (pathname.startsWith("/dashboard/")) {
    return `Binding ${site.name} server modules`;
  }
  if (pathname.startsWith("/dashboard")) {
    return "Syncing your Discord servers";
  }
  if (pathname.startsWith("/status")) {
    return "Checking live gateway & shard telemetry";
  }
  if (pathname.startsWith("/docs")) {
    return `Loading ${site.name} command reference`;
  }
  if (pathname.startsWith("/privacy") || pathname.startsWith("/terms")) {
    return `Loading ${site.name} legal documentation`;
  }
  return `Initializing ${site.name} guard engine`;
}

function isSelfManagedAsyncRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

export function RouteLoader() {
  const { config } = useSiteConfig();
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(
    () => !isSelfManagedAsyncRoute(pathname),
  );
  const [fading, setFading] = useState(false);
  const [sublabel, setSublabel] = useState(() => sublabelForPath(pathname));
  const lastPathRef = useRef<string | null>(null);

  // Trigger splash loader on initial entry & pathname changes for static/SSR pages
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setVisible(false);
      setFading(false);
      lastPathRef.current = pathname;
      return;
    }

    // Dashboard & Admin hold their own LoadingScreen until live API data arrives
    if (isSelfManagedAsyncRoute(pathname)) {
      setVisible(false);
      setFading(false);
      lastPathRef.current = pathname;
      return;
    }

    const isInitial = lastPathRef.current === null;
    lastPathRef.current = pathname;

    setSublabel(sublabelForPath(pathname));
    setVisible(true);
    setFading(false);

    const holdMs = isInitial ? 340 : 220;
    const fadeTimer = window.setTimeout(() => setFading(true), holdMs);
    const hideTimer = window.setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, holdMs + 240);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [pathname]);

  // Show loader immediately on internal link clicks & Discord OAuth redirects
  useEffect(() => {
    let safetyTimer: number | null = null;
    const clearSafety = () => {
      if (safetyTimer !== null) {
        window.clearTimeout(safetyTimer);
        safetyTimer = null;
      }
    };

    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const anchor = (e.target as HTMLElement | null)?.closest("a");
      if (!anchor) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const rawHref = anchor.getAttribute("href");
      if (!rawHref || rawHref.startsWith("#") || rawHref.startsWith("mailto:")) {
        return;
      }

      let url: URL;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;

      // Same-page section anchor jump (e.g. /#features while on /) — skip loader
      if (url.pathname === window.location.pathname && url.hash) return;
      // Same exact URL — skip loader
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }

      // Skip other raw API links except OAuth redirect
      if (
        url.pathname.startsWith("/api/") &&
        !url.pathname.startsWith("/api/auth/discord")
      ) {
        return;
      }

      setSublabel(sublabelForPath(url.pathname));
      setFading(false);
      setVisible(true);
      clearSafety();
      safetyTimer = window.setTimeout(() => {
        setVisible(false);
        setFading(false);
      }, 10_000);
    };

    // Clear stuck overlay if user hits browser Back from Discord OAuth page (bfcache)
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        clearSafety();
        setVisible(false);
        setFading(false);
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      clearSafety();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  if (!visible || !config.enableRouteLoader) return null;

  return (
    <div
      className={`fixed inset-x-0 top-0 z-[110] h-[100svh] min-h-[100svh] w-full transition-opacity duration-300 ${
        fading ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <LoadingScreen
        label={config.loaderText || "Connection Establishing..."}
        sublabel={sublabel}
        fullScreen={false}
      />
    </div>
  );
}
