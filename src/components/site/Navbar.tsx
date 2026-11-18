"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { InviteButton } from "@/components/ui/InviteButton";
import { CrownIcon } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { nav, site } from "@/lib/site";

const SECTION_IDS = ["features", "setup", "protocol", "voicemaster", "faq"];

export function Navbar() {
  const { config } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 22);
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
        setProgress(Math.min(1, Math.max(0, y / max)));
        if (y < 240) setActiveSection("");
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
    if (typeof IntersectionObserver === "undefined") return;
    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (!elements.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-32% 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
          scrolled ? "px-3 pt-2.5 sm:px-6 sm:pt-3" : "px-0 pt-0"
        }`}
      >
        <div
          className={`relative mx-auto flex items-center justify-between transition-all duration-500 ease-smooth ${
            scrolled
              ? "h-[60px] max-w-[1200px] overflow-hidden rounded-2xl border border-white/[0.1] bg-ink-950/82 px-4 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.96),0_0_40px_-24px_rgb(var(--brand-600)/0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:px-5"
              : "container-x h-[72px] border border-transparent bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${config.brandName} home`}
          >
            <Logo size={34} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[15.5px] font-bold tracking-[0.17em] text-white">
                <Wordmark />
              </span>
              {config.navBadge && (
                <span className="mt-1 font-mono text-[7.5px] uppercase tracking-[0.36em] text-brand-400/90">
                  {config.navBadge}
                </span>
              )}
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 rounded-full border border-white/[0.07] bg-white/[0.025] p-1 backdrop-blur-xl lg:flex">
            {nav.map((item) => {
              if (item.href === "/premium") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="ml-0.5 inline-flex items-center gap-1.5 rounded-full border border-brand-500/35 bg-brand-600/15 px-3.5 py-1.5 text-[12.5px] font-semibold text-brand-200 transition-all duration-300 ease-smooth hover:border-brand-400/65 hover:bg-brand-600/28 hover:text-white hover:shadow-[0_0_24px_-6px_rgb(var(--brand-500)/0.85)]"
                  >
                    <CrownIcon className="size-3.5 text-brand-400" />
                    {item.label}
                  </Link>
                );
              }
              const sectionKey = item.href.split("#")[1] || "";
              const isCurrent = sectionKey && activeSection === sectionKey;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-300 ease-smooth ${
                    isCurrent
                      ? "bg-brand-500/15 text-white shadow-[inset_0_0_0_1px_rgb(var(--brand-500)/0.38)]"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2.5 md:flex">
            <a
              href={config.supportUrl || site.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-zinc-400 transition-colors duration-200 hover:text-white"
            >
              Support
            </a>
            <Link
              href={site.dashboard}
              className="rounded-full border border-white/[0.1] bg-white/[0.03] px-4 py-1.5 text-[12.5px] font-medium text-zinc-200 transition-all duration-300 ease-smooth hover:border-brand-500/45 hover:bg-brand-500/[0.1] hover:text-white active:scale-[0.98]"
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
            className="relative z-50 flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] transition-all duration-300 ease-smooth hover:border-brand-500/45 active:scale-95 md:hidden"
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

          {/* live crimson laser scroll-progress filament */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 transition-opacity duration-300 ${
              scrolled && progress > 0.01 ? "opacity-95" : "opacity-0"
            }`}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      {/* mobile floating drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/85 backdrop-blur-lg transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pb-safe absolute inset-x-3 top-[76px] overflow-hidden rounded-3xl border border-white/12 bg-ink-950/96 p-4 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.98),0_0_50px_-20px_rgb(var(--brand-600)/0.5)] backdrop-blur-2xl transition-all duration-300 ease-smooth ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-4 scale-[0.98] opacity-0"
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/80 to-transparent"
          />
          <div className="flex flex-col gap-1">
            {nav.map((item) =>
              item.href.includes("#") ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white active:bg-white/[0.09]"
                >
                  {item.label}
                  <span className="font-mono text-[10px] text-zinc-600">→</span>
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="my-0.5 flex items-center justify-between rounded-xl border border-brand-500/30 bg-brand-600/12 px-3.5 py-3 text-[15px] font-semibold text-brand-200 transition-colors hover:bg-brand-600/22 hover:text-white"
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
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Support Server
              <span className="font-mono text-[10px] text-zinc-600">↗</span>
            </a>
          </div>
          <div className="mt-4 grid gap-2.5 border-t border-white/[0.08] pt-4">
            <InviteButton size="lg" className="w-full" />
            <Link
              href={site.dashboard}
              onClick={() => setOpen(false)}
              className="inline-flex h-[50px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[14.5px] font-medium text-zinc-100 transition-colors hover:border-brand-500/45 hover:text-white"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
