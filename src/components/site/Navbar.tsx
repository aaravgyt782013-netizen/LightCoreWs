"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { InviteButton } from "@/components/ui/InviteButton";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import {
  ChevronDownIcon,
  CrownIcon,
  SearchIcon,
  ServerIcon,
  ShieldIcon,
  SparklesIcon,
} from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { nav, site } from "@/lib/site";

const SECTION_IDS = ["features", "showcase", "voicemaster", "setup", "faq"];

type LiteUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatarUrl: string;
};

export function Navbar() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { config } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>("");
  const [open, setOpen] = useState(false);

  const [authUser, setAuthUser] = useState<LiteUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 20);
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
    if (pathname !== "/" || typeof IntersectionObserver === "undefined") {
      setActiveSection("");
      return;
    }
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
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me?lite=1", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (
          data: {
            authenticated?: boolean;
            isAdmin?: boolean;
            user?: LiteUser | null;
          } | null,
        ) => {
          if (!active || !data) return;
          if (data.authenticated && data.user) {
            setAuthUser(data.user);
            setIsAdmin(Boolean(data.isAdmin));
          } else {
            setAuthUser(null);
            setIsAdmin(false);
          }
        },
      )
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onOutside);
    return () => document.removeEventListener("mousedown", onOutside);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLogout = async () => {
    setMenuOpen(false);
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Ignore network hiccups
    }
    setAuthUser(null);
    setIsAdmin(false);
    router.refresh();
  };

  return (
    <>
      <header
        style={{ top: "var(--top-banner-offset, 0px)" }}
        className={`fixed inset-x-0 z-50 transition-all duration-500 ease-smooth ${
          scrolled ? "px-3.5 pt-3 sm:px-6 sm:pt-3.5" : "px-0 pt-0"
        }`}
      >
        <div
          className={`relative mx-auto flex items-center justify-between transition-all duration-500 ease-smooth ${
            scrolled
              ? "h-[60px] max-w-[1180px] rounded-full border border-white/[0.085] bg-ink-950/82 pl-4 pr-3 shadow-[0_24px_64px_-22px_rgba(0,0,0,0.9),0_0_48px_-26px_rgb(var(--brand-400)/0.28),inset_0_1px_0_rgba(255,250,230,0.075)] backdrop-blur-2xl sm:pl-5 sm:pr-3.5"
              : "container-x h-[76px] border border-transparent bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
            aria-label={`${config.brandName} home`}
          >
            <Logo size={36} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[15.5px] font-bold tracking-[0.14em] text-white">
                <Wordmark />
              </span>
              {config.navBadge && (
                <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.22em] text-brand-300/80">
                  {config.navBadge}
                </span>
              )}
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 rounded-full border border-white/[0.065] bg-white/[0.025] p-1 backdrop-blur-xl lg:flex">
            {nav.map((item) => {
              if (item.href === "/premium") {
                const active = pathname === "/premium";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ml-0.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-300 ease-smooth ${
                      active
                        ? "border-brand-300/45 bg-brand-400/20 text-brand-100 shadow-[0_0_24px_-8px_rgb(var(--brand-400)/0.55)]"
                        : "border-brand-400/22 bg-brand-400/[0.08] text-brand-200 hover:border-brand-300/45 hover:bg-brand-400/[0.16] hover:text-brand-50"
                    }`}
                  >
                    <CrownIcon className="size-3.5 text-brand-300" />
                    {item.label}
                  </Link>
                );
              }

              const hash = item.href.includes("#")
                ? item.href.split("#")[1]
                : "";
              const isCurrent = hash
                ? pathname === "/" && activeSection === hash
                : pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-300 ease-smooth ${
                    isCurrent
                      ? "bg-brand-400/[0.12] text-brand-100 shadow-[inset_0_0_0_1px_rgb(var(--brand-400)/0.28)]"
                      : "text-zinc-400 hover:bg-white/[0.055] hover:text-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search commands and pages (Cmd+K)"
              title="Quick search (⌘K)"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.025] px-3 text-[12px] text-zinc-400 transition-all duration-300 ease-smooth hover:border-brand-400/30 hover:bg-white/[0.05] hover:text-white"
            >
              <SearchIcon className="size-3.5 text-brand-300" />
              <kbd className="font-mono text-[10px] tracking-wider text-zinc-500">
                ⌘K
              </kbd>
            </button>

            {authUser ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.1] bg-ink-900/90 pl-1.5 pr-3 text-[12.5px] font-medium text-zinc-100 transition-all duration-300 ease-smooth hover:border-brand-400/35"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={authUser.avatarUrl}
                    alt=""
                    className="size-6 rounded-full object-cover"
                  />
                  <span className="max-w-[96px] truncate">
                    {authUser.globalName || authUser.username}
                  </span>
                  <ChevronDownIcon
                    className={`size-3.5 text-zinc-400 transition-transform duration-300 ease-smooth ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="animate-pop-in absolute right-0 mt-2.5 w-56 overflow-hidden rounded-3xl border border-white/[0.09] bg-ink-900/96 p-2 shadow-[0_28px_72px_-18px_rgba(0,0,0,0.92)] backdrop-blur-2xl">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12.5px] text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <ServerIcon className="size-4 text-brand-300" />
                      My Servers
                    </Link>
                    <Link
                      href="/dashboard/demo"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12.5px] text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <SparklesIcon className="size-4 text-brand-300" />
                      Live Demo
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-[12.5px] text-brand-200 transition-colors hover:bg-brand-400/[0.12] hover:text-brand-50"
                      >
                        <ShieldIcon className="size-4 text-brand-300" />
                        Owner Studio
                      </Link>
                    )}
                    <div className="my-1.5 h-px bg-white/[0.06]" />
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center rounded-2xl px-3 py-2 text-left text-[12px] text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={site.dashboard}
                className={`inline-flex h-9 items-center rounded-full border px-4 text-[12.5px] font-medium transition-all duration-300 ease-smooth active:scale-[0.985] ${
                  pathname.startsWith("/dashboard")
                    ? "border-brand-400/40 bg-brand-400/[0.12] text-brand-50"
                    : "border-white/[0.09] bg-white/[0.03] text-zinc-200 hover:border-brand-400/30 hover:bg-white/[0.06] hover:text-white"
                }`}
              >
                Dashboard
              </Link>
            )}

            <InviteButton size="sm" />
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={openCommandPalette}
              aria-label="Search commands"
              className="flex size-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.035] text-zinc-300 transition-all duration-300 ease-smooth hover:border-brand-400/35 hover:text-white"
            >
              <SearchIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative z-50 flex size-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.035] transition-all duration-300 ease-smooth hover:border-brand-400/35 active:scale-95"
            >
              <span className="relative block h-3 w-4">
                <span
                  className={`absolute left-0 h-[1.5px] w-4 rounded-full bg-white transition-all duration-300 ease-smooth ${
                    open ? "top-1/2 rotate-45 bg-brand-300" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded-full bg-white transition-all duration-200 ${
                    open ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-4 rounded-full bg-white transition-all duration-300 ease-smooth ${
                    open ? "top-1/2 -rotate-45 bg-brand-300" : "top-full"
                  }`}
                />
              </span>
            </button>
          </div>

          {/* Silky golden scroll progress filament */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-8 bottom-0 h-[1.5px] origin-left rounded-full bg-gradient-to-r from-brand-600/70 via-brand-400 to-brand-200 transition-opacity duration-500 ${
              scrolled && progress > 0.015 ? "opacity-80" : "opacity-0"
            }`}
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </header>

      {/* Mobile plush floating drawer */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity duration-300 ease-smooth ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`pb-safe absolute inset-x-3.5 top-[80px] overflow-hidden rounded-[30px] border border-white/[0.09] bg-ink-900/96 p-5 shadow-[0_32px_90px_-20px_rgba(0,0,0,0.94),0_0_56px_-24px_rgb(var(--brand-400)/0.32)] backdrop-blur-2xl transition-all duration-300 ease-smooth ${
            open
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-[0.98] opacity-0"
          }`}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent"
          />
          <div className="flex flex-col gap-1">
            {nav.map((item) =>
              item.href === "/premium" ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="my-0.5 flex items-center justify-between rounded-2xl border border-brand-400/25 bg-brand-400/[0.09] px-4 py-3 text-[15px] font-semibold text-brand-100 transition-colors hover:bg-brand-400/[0.16]"
                >
                  <span className="inline-flex items-center gap-2">
                    <CrownIcon className="size-4 text-brand-300" />
                    {item.label}
                  </span>
                  <span className="text-[11px] font-medium text-brand-300">
                    Plans →
                  </span>
                </Link>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.055] hover:text-white"
                >
                  {item.label}
                  <span className="text-[12px] text-zinc-600">→</span>
                </Link>
              ),
            )}
            <Link
              href="/dashboard/demo"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.055] hover:text-white"
            >
              Try Demo
              <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-medium text-emerald-300">
                Interactive
              </span>
            </Link>
            <a
              href={config.supportUrl || site.discord}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-2xl px-4 py-3 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.055] hover:text-white"
            >
              Support Server
              <span className="text-[12px] text-zinc-600">↗</span>
            </a>
          </div>
          <div className="mt-4 grid gap-2.5 border-t border-white/[0.07] pt-4">
            <InviteButton size="lg" className="w-full" />
            <Link
              href={site.dashboard}
              onClick={() => setOpen(false)}
              className="btn-soft inline-flex h-[50px] w-full items-center justify-center text-[14.5px] font-medium"
            >
              {authUser ? "My Server Dashboard" : "Open Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
