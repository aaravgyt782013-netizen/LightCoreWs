"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { InviteButton } from "@/components/ui/InviteButton";
import { CrownIcon } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { nav, site } from "@/lib/site";

export function Navbar() {
  const { config } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 14);
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
        setProgress(Math.min(1, Math.max(0, y / max)));
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        style={{ top: "var(--top-banner-offset, 0px)" }}
        className={`fixed inset-x-0 z-50 transition-all duration-500 ease-smooth ${
          scrolled
            ? "border-b border-white/[0.08] bg-ink-950/88 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-[68px] items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${config.brandName} home`}
          >
            <Logo size={35} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[16px] font-bold tracking-[0.17em] text-white transition-colors group-hover:text-white">
                <Wordmark />
              </span>
              {config.navBadge && (
                <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.36em] text-brand-400/90">
                  {config.navBadge}
                </span>
              )}
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-white/[0.06] bg-ink-900/55 px-1.5 py-1 backdrop-blur-xl lg:flex">
            {nav.map((item) =>
              item.href === "/premium" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/35 bg-brand-600/15 px-3.5 py-1.5 text-[13px] font-semibold text-brand-200 transition-all duration-200 hover:border-brand-400/65 hover:bg-brand-600/25 hover:text-white hover:shadow-[0_0_24px_-8px_rgb(var(--brand-500)/0.85)]"
                >
                  <CrownIcon className="size-3.5 text-brand-400" />
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-zinc-400 transition-all duration-200 hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>

          <div className="hidden items-center gap-3.5 md:flex">
            <a
              href={config.supportUrl || site.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              Support
            </a>
            <Link
              href={site.dashboard}
              className="rounded-full border border-white/[0.09] bg-white/[0.025] px-3.5 py-1.5 text-[13px] font-medium text-zinc-200 transition-all duration-200 hover:border-brand-500/40 hover:bg-brand-500/[0.08] hover:text-white"
            >
              Dashboard
            </Link>
            <InviteButton size="sm" />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-50 flex size-10 items-center justify-center rounded-full border border-white/12 bg-ink-900/80 transition-colors hover:border-brand-500/45 md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-4 rounded bg-white transition-all duration-300 ease-smooth ${
                  open ? "top-1/2 rotate-45 bg-brand-400" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded bg-white transition-all duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 rounded bg-white transition-all duration-300 ease-smooth ${
                  open ? "top-1/2 -rotate-45 bg-brand-400" : "top-full"
                }`}
              />
            </span>
          </button>
        </div>

        {/* ultra-sleek live crimson scroll progress hairline */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 transition-opacity duration-300 ${
            scrolled && progress > 0.01 ? "opacity-90" : "opacity-0"
          }`}
          style={{ transform: `scaleX(${progress})` }}
        />
      </header>

      {/* mobile sheet */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pb-safe absolute inset-x-0 top-0 border-b border-brand-500/20 bg-ink-950/98 px-5 pb-8 pt-24 shadow-panel transition-transform duration-300 ease-smooth ${
            open ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex flex-col gap-1">
            {nav.map((item) =>
              item.href.includes("#") ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white active:bg-white/[0.08]"
                >
                  {item.label}
                  <span className="font-mono text-[10px] text-zinc-600">
                    {item.href.replace(/^\//, "")}
                  </span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-brand-500/25 bg-brand-600/10 px-3.5 py-3 text-[15px] font-semibold text-brand-300 transition-colors hover:bg-brand-600/20 hover:text-white"
                >
                  <span className="inline-flex items-center gap-2">
                    <CrownIcon className="size-4 text-brand-400" />
                    {item.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-brand-400">
                    plans
                  </span>
                </Link>
              ),
            )}
            <a
              href={config.supportUrl || site.discord}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              Support Server
              <span className="font-mono text-[10px] text-zinc-600">
                discord
              </span>
            </a>
          </div>
          <div className="mt-5 grid gap-2.5">
            <InviteButton size="lg" className="w-full" />
            <Link
              href={site.dashboard}
              onClick={() => setOpen(false)}
              className="inline-flex h-[50px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[14.5px] font-medium text-zinc-100 transition-colors hover:border-brand-500/40 hover:text-white"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
