"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { site } from "@/lib/site";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { LoadingScreen } from "./LoadingScreen";

function sublabelForPath(pathname: string): string {
  if (pathname.startsWith("/login")) {
    return "Opening sign-in portal";
  }
  if (pathname.startsWith("/api/auth/discord")) {
    return "Connecting to Discord";
  }
  if (pathname.startsWith("/premium")) {
    return `${site.name} Premium plans`;
  }
  if (pathname.startsWith("/admin")) {
    return "Syncing owner workspace";
  }
  if (pathname.startsWith("/dashboard/")) {
    return "Loading server modules";
  }
  if (pathname.startsWith("/dashboard")) {
    return "Syncing server workspace";
  }
  if (pathname.startsWith("/status")) {
    return "Live shard telemetry";
  }
  if (pathname.startsWith("/docs")) {
    return "Command & module docs";
  }
  if (pathname.startsWith("/privacy") || pathname.startsWith("/terms")) {
    return "Legal documentation";
  }
  return `${site.name} guard engine`;
}

function isSelfManagedAsyncRoute(pathname: string): boolean {
  return pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
}

export function RouteLoader() {
  const { config } = useSiteConfig();
  const pathname = usePathname() || "/";
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [sublabel, setSublabel] = useState(() => sublabelForPath(pathname));
  const lastPathRef = useRef<string>(pathname);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Smooth fade-out once the target route has arrived (no blink on initial paint, no double-flash!)
  useEffect(() => {
    if (lastPathRef.current === pathname) return;
    lastPathRef.current = pathname;
    clearTimers();

    if (!visible) return;

    // For /dashboard & /admin, fade smoothly over the destination's own identical LoadingScreen
    const holdMs = isSelfManagedAsyncRoute(pathname) ? 60 : 160;
    const fadeId = window.setTimeout(() => setFading(true), holdMs);
    const hideId = window.setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, holdMs + 320);
    timersRef.current.push(fadeId, hideId);

    return clearTimers;
  }, [pathname, visible]);

  // Show rock-solid centered loader on internal page navigations & Discord sign-in
  useEffect(() => {
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

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
      if (url.pathname === window.location.pathname && url.hash) return;
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      if (
        url.pathname.startsWith("/api/") &&
        !url.pathname.startsWith("/api/auth/discord")
      ) {
        return;
      }

      clearTimers();
      setSublabel(sublabelForPath(url.pathname));
      setFading(false);
      setVisible(true);

      const safety = window.setTimeout(() => {
        setFading(true);
        const done = window.setTimeout(() => {
          setVisible(false);
          setFading(false);
        }, 320);
        timersRef.current.push(done);
      }, 9000);
      timersRef.current.push(safety);
    };

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        clearTimers();
        setVisible(false);
        setFading(false);
      }
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      clearTimers();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  if (!visible || !config.enableRouteLoader) return null;

  return (
    <LoadingScreen
      label={config.loaderText || "Loading Workspace"}
      sublabel={sublabel}
      fading={fading}
    />
  );
}
