"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";

/**
 * Flicker-free global top laser route progress bar.
 * Replaces blocking full-screen splash resets on every click so route
 * navigations feel instantaneous, smooth, and zero-jitter on both mobile and
 * desktop — never colliding with Next.js Suspense or dashboard skeletons.
 */
export function RouteLoader() {
  const { config } = useSiteConfig();
  const pathname = usePathname() || "/";
  const prevPathRef = useRef(pathname);

  const [active, setActive] = useState(false);
  const [pct, setPct] = useState(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Complete and fade out progress bar as soon as pathname settles
  useEffect(() => {
    if (prevPathRef.current === pathname) return;
    prevPathRef.current = pathname;

    clearTimers();
    setPct(100);
    const doneId = window.setTimeout(() => {
      setActive(false);
      setPct(0);
    }, 240);
    timersRef.current.push(doneId);

    return () => clearTimers();
  }, [pathname]);

  // Start sleek top progress filament on genuine cross-route link clicks
  useEffect(() => {
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
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(rawHref, window.location.origin);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      if (
        url.pathname.startsWith("/api/") &&
        !url.pathname.startsWith("/api/auth/discord")
      ) {
        return;
      }

      clearTimers();
      setActive(true);
      setPct(24);
      timersRef.current.push(
        window.setTimeout(() => setPct(58), 140),
        window.setTimeout(() => setPct(82), 420),
        window.setTimeout(() => {
          setActive(false);
          setPct(0);
        }, 6500),
      );
    };

    const onPageShow = () => {
      clearTimers();
      setActive(false);
      setPct(0);
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      clearTimers();
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  if (!active || !config.enableRouteLoader) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[140] h-[2.5px] overflow-hidden"
    >
      <div
        className={`h-full origin-left bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 shadow-[0_0_14px_rgb(var(--brand-400))] transition-[width,opacity] duration-200 ease-out ${
          pct >= 100 ? "opacity-0" : "opacity-100"
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
