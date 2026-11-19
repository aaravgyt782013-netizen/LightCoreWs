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

const SECTION_IDS = [
  "features",
  "showcase",
  "setup",
  "protocol",
  "voicemaster",
  "faq",
];

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
          scrolled ? "px-3 pt-2.5 sm:px-6 sm:pt-3" : "px-0 pt-0"
        }`}
      >
        <div
          className={`relative mx-auto flex items-center justify-between transition-all duration-500 ease-smooth ${
            scrolled
              ? "h-[60px] max-w-[1220px] rounded-2xl border border-white/[0.1] bg-ink-950/84 px-4 shadow-[0_24px_64px_-20px_rgba(0,0,0,0.96),0_0_40px_-24px_rgb(var(--brand-600)/0.5),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-2xl sm:px-5"
              : "container-x h-[72px] border border-transparent bg-transparent"
          }`}
        >
          <Link
            href="/"
            className="group flex shrink-0 items-center gap-3"
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

          <nav className="hidden items-center gap-0.5 rounded-full border border-white/[0.075] bg-white/[0.025] p-1 backdrop-blur-xl lg:flex">
            {nav.map((item) => {
              if (item.href === "/premium") {
                const active = pathname === "/premium";
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`ml-0.5 inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[12.5px] font-semibold transition-all duration-300 ease-smooth ${
                      active
                        ? "border-brand-400/70 bg-brand-600/30 text-white shadow-[0_0_24px_-6px_rgb(var(--brand-500)/0.85)]"
                        : "border-brand-500/35 bg-brand-600/15 text-brand-200 hover:border-brand-400/65 hover:bg-brand-600/28 hover:text-white hover:shadow-[0_0_24px_-6px_rgb(var(--brand-500)/0.85)]"
                    }`}
                  >
                    <CrownIcon className="size-3.5 text-brand-400" />
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
                      ? "bg-brand-500/15 text-white shadow-[inset_0_0_0_1px_rgb(var(--brand-500)/0.38)]"
                      : "text-zinc-400 hover:bg-white/[0.06] hover:text-white"
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
              aria-label="Open command search (Cmd+K)"
              title="Search commands & pages (⌘K)"
              className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.025] px-3 text-[12px] text-zinc-400 transition-all duration-200 hover:border-brand-500/40 hover:bg-white/[0.05] hover:text-white"
            >
              <SearchIcon className="size-3.5 text-brand-400" />
              <kbd className="font-mono text-[10px] tracking-wider text-zinc-500">
                ⌘K
              </kbd>
            </button>

            {authUser ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-white/[0.12] bg-ink-900/90 pl-1.5 pr-3 text-[12.5px] font-medium text-zinc-100 transition-all hover:border-brand-500/45"
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
                    className={`size-3.5 text-zinc-400 transition-transform ${
                      menuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {menuOpen && (
                  <div className="animate-pop-in absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/[0.12] bg-ink-900/98 p-1.5 shadow-[0_28px_70px_-16px_rgba(0,0,0,0.96)] backdrop-blur-2xl">
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                    >
                      <ServerIcon className="size-4 text-brand-400" />
                      My Servers
                    </Link>
                    <Link
                      href="/dashboard/demo"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-zinc-200 hover:bg-white/[0.06] hover:text-white"
                    >
                      <SparklesIcon className="size-4 text-brand-400" />
                      Interactive Demo
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[12.5px] text-brand-200 hover:bg-brand-500/15 hover:text-white"
                      >
                        <ShieldIcon className="size-4 text-brand-400" />
                        Owner Control Panel
                      </Link>
                    )}
                    <div className="my-1 h-px bg-white/[0.07]" />
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="flex w-full items-center rounded-xl px-3 py-2 text-left text-[12px] text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={site.dashboard}
                className={`inline-flex h-9 items-center rounded-full border px-4 text-[12.5px] font-medium transition-all duration-300 ease-smooth active:scale-[0.98] ${
                  pathname.startsWith("/dashboard")
                    ? "border-brand-500/50 bg-brand-500/15 text-white"
                    : "border-white/[0.1] bg-white/[0.03] text-zinc-200 hover:border-brand-500/45 hover:bg-brand-500/[0.1] hover:text-white"
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
              className="flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] text-zinc-300 transition hover:border-brand-500/45 hover:text-white"
            >
              <SearchIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="relative z-50 flex size-10 items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] transition-all duration-300 ease-smooth hover:border-brand-500/45 active:scale-95"
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

          {/* live brand laser scroll-progress filament */}
          <div
            aria-hidden
            className={`pointer-events-none absolute inset-x-3 bottom-0 h-[1.5px] origin-left rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 transition-opacity duration-300 ${
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
              item.href === "/premium" ? (
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
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  {item.label}
                  <span className="font-mono text-[10px] text-zinc-600">→</span>
                </Link>
              ),
            )}
            <Link
              href="/dashboard/demo"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3.5 py-3 text-[15px] font-medium text-zinc-200 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              Interactive Demo
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9.5px] uppercase text-emerald-300">
                Live
              </span>
            </Link>
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
              {authUser ? "My Server Dashboard" : "Open Dashboard"}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
