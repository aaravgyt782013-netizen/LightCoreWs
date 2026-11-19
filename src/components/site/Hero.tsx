"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { InviteButton } from "@/components/ui/InviteButton";
import { Wordmark } from "@/components/ui/Logo";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import {
  ArrowRight,
  BoltIcon,
  LockIcon,
  SearchIcon,
  ShieldIcon,
  SparklesIcon,
  TicketIcon,
  UsersIcon,
  VoiceIcon,
} from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { DEFAULT_TAGLINE, site, type LogEntry } from "@/lib/site";

type QuickModule = {
  id: string;
  title: string;
  subtitle: string;
  statusNote: string;
  Icon: typeof ShieldIcon;
  defaultOn: boolean;
};

const QUICK_MODULES: QuickModule[] = [
  {
    id: "antinuke",
    title: "Server Protection",
    subtitle: "Stops raids, rogue bots, and mass deletes automatically",
    statusNote: "Server Protection is watching channels, roles & bans",
    Icon: ShieldIcon,
    defaultOn: true,
  },
  {
    id: "automod",
    title: "Smart Auto-Mod",
    subtitle: "Keeps chat clean from spam, scam links, and invite floods",
    statusNote: "Smart Auto-Mod is keeping every text channel clean",
    Icon: BoltIcon,
    defaultOn: true,
  },
  {
    id: "voicemaster",
    title: "VoiceMaster Rooms",
    subtitle: "Private temporary voice channels created when members join",
    statusNote: "Join-to-Create voice rooms & auto-cleanup ready",
    Icon: VoiceIcon,
    defaultOn: true,
  },
  {
    id: "tickets",
    title: "Support Tickets",
    subtitle: "One-click member help channels with saved transcripts",
    statusNote: "Support ticket panel & clean transcripts enabled",
    Icon: TicketIcon,
    defaultOn: true,
  },
  {
    id: "welcome",
    title: "Welcomes & Auto-Roles",
    subtitle: "Warm custom greetings and instant member roles on join",
    statusNote: "Custom welcome embeds & auto-roles greeting newcomers",
    Icon: UsersIcon,
    defaultOn: true,
  },
];

const HERO_STATS = [
  { value: "12", label: "Built-in Modules" },
  { value: "68+", label: "Easy Commands" },
  { value: "30s", label: "Quick Setup" },
  { value: "24/7", label: "Always Guarding" },
] as const;

export function Hero() {
  const { config } = useSiteConfig();
  const tagline = (config.tagline || DEFAULT_TAGLINE).trim();
  const isDefaultTagline =
    tagline.toLowerCase() === DEFAULT_TAGLINE.toLowerCase();

  return (
    <section className="relative overflow-hidden pb-16 pt-[116px] sm:pb-24 sm:pt-[144px]">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,486px)] lg:gap-16">
          {/* Left: Radiant Brand Story & Actions */}
          <div className="relative">
            <div
              className="animate-hero-in inline-flex items-center gap-2.5 rounded-full border border-brand-400/22 bg-brand-400/[0.07] py-1.5 pl-2 pr-4 shadow-[0_0_40px_-14px_rgb(var(--brand-400)/0.45),inset_0_1px_0_rgb(255_252_235/0.09)] backdrop-blur-xl"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex size-5 items-center justify-center rounded-full bg-brand-400/20">
                <span className="absolute size-full animate-pulse-ring rounded-full border border-brand-300/60" />
                <span className="size-1.5 rounded-full bg-brand-300 shadow-[0_0_10px_rgb(var(--brand-300))]" />
              </span>
              <span className="text-[12px] font-medium tracking-wide text-brand-100">
                All-in-One Discord Bot · Since 2026
              </span>
            </div>

            <h1
              className="animate-hero-in mt-6 font-display text-[44px] font-bold leading-[1.03] tracking-[-0.025em] text-white sm:text-[62px] lg:text-[68px]"
              style={{ animationDelay: "70ms" }}
            >
              {isDefaultTagline ? (
                <>
                  The bright side of{" "}
                  <span className="text-gradient-brand">automation.</span>
                </>
              ) : (
                <span className="text-gradient-brand">{tagline}</span>
              )}
            </h1>

            <p
              className="animate-hero-in mt-5 max-w-[34rem] text-balance text-[16px] leading-[1.72] text-zinc-300/95 sm:text-[17.5px]"
              style={{ animationDelay: "135ms" }}
            >
              Meet{" "}
              <span className="font-semibold text-white">
                {config.brandName || site.name}
              </span>{" "}
              — {config.heroSubtext ||
                "smart security, gentle auto-moderation, temporary voice rooms, support tickets, and welcomes, all managed from one calm, effortless dashboard."}
            </p>

            {/* Plush Capsule CTAs */}
            <div
              className="animate-hero-in mt-8 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "195ms" }}
            >
              <InviteButton size="lg" />
              <Link
                href={site.dashboard}
                className="btn-soft group inline-flex h-[52px] items-center gap-2.5 px-6 text-[14.5px] font-semibold active:scale-[0.985]"
              >
                Open Dashboard
                <ArrowRight className="size-4 text-brand-300 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
              </Link>
              <Link
                href={site.demo}
                className="group inline-flex h-[52px] items-center gap-2 rounded-full px-4 text-[14px] font-medium text-zinc-300 transition-all duration-300 ease-smooth hover:bg-white/[0.04] hover:text-brand-200 active:scale-[0.985]"
              >
                <SparklesIcon className="size-4 text-brand-400" />
                Try Demo
              </Link>
            </div>

            {/* Gentle Reassurance Row */}
            <div
              className="animate-hero-in mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12.5px] text-zinc-400"
              style={{ animationDelay: "245ms" }}
            >
              <Link
                href="/security"
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-emerald-300"
              >
                <LockIcon className="size-3.5 text-emerald-400" />
                <span>Official read-only Discord sign-in</span>
              </Link>
              <button
                type="button"
                onClick={openCommandPalette}
                className="inline-flex items-center gap-2 transition-colors duration-300 hover:text-brand-200"
              >
                <SearchIcon className="size-3.5 text-brand-400" />
                <span>
                  Press{" "}
                  <kbd className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10.5px] text-zinc-300">
                    ⌘K
                  </kbd>{" "}
                  to explore commands
                </span>
              </button>
            </div>

            {/* Soft Rounded Stat Pills */}
            <div
              className="animate-hero-in mt-10 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4"
              style={{ animationDelay: "295ms" }}
            >
              {HERO_STATS.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-white/[0.065] bg-ink-900/65 px-4 py-3.5 shadow-[inset_0_1px_0_rgb(255_250_230/0.05)] backdrop-blur-md transition-all duration-500 ease-smooth hover:border-brand-400/22 hover:bg-ink-900/85"
                >
                  <p className="font-display text-[23px] font-bold leading-none tracking-tight text-white">
                    {item.value}
                  </p>
                  <p className="mt-1.5 text-[11.5px] font-medium text-zinc-400">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Plush Velvet & Solar-Gold Emblem + 1-Tap Module Studio */}
          <div className="animate-hero-in" style={{ animationDelay: "150ms" }}>
            <QuickStudioCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function QuickStudioCard() {
  const { config } = useSiteConfig();
  const logoSrc = config.logoUrl || site.logo;
  const prefix = config.prefix || site.prefix;

  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(QUICK_MODULES.map((m) => [m.id, m.defaultOn])),
  );
  const [statusLine, setStatusLine] = useState<string>(
    "All core modules active and running smoothly",
  );
  const [liveConnected, setLiveConnected] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/logs", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { logs?: LogEntry[]; live?: boolean } | null) => {
        if (!active || !data) return;
        if (data.live && Array.isArray(data.logs) && data.logs[0]?.msg) {
          setLiveConnected(true);
          setStatusLine(data.logs[0].msg);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const enabledCount = QUICK_MODULES.filter((m) => enabled[m.id]).length;

  const toggleModule = (mod: QuickModule) => {
    setEnabled((prev) => {
      const nextVal = !prev[mod.id];
      setStatusLine(
        nextVal ? mod.statusNote : `${mod.title} paused — tap anytime to re-enable`,
      );
      return { ...prev, [mod.id]: nextVal };
    });
  };

  return (
    <div className="relative">
      {/* Ultra-soft diffused golden aura behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[44px] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--brand-400) / 0.2), rgb(var(--brand-600) / 0.06) 62%, transparent 100%)",
        }}
      />

      <SpotlightCard className="overflow-hidden rounded-[32px] p-5 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent"
        />

        {/* Brand Identity Header showcasing the new LightCore Logo */}
        <div className="relative flex items-center gap-4 rounded-[24px] border border-white/[0.065] bg-black/55 p-3.5 sm:p-4">
          <div className="relative shrink-0">
            <span
              aria-hidden
              className="absolute -inset-1.5 rounded-[22px] bg-brand-400/25 blur-lg"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={`${config.brandName || site.name} emblem`}
              width={64}
              height={64}
              className="relative size-16 rounded-[20px] bg-black object-cover ring-1 ring-brand-300/35 shadow-[0_10px_30px_-6px_rgb(var(--brand-400)/0.5)]"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-[17px] font-bold tracking-[0.08em] text-white">
                <Wordmark />
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-medium text-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                {liveConnected ? "Live" : "Online"}
              </span>
            </div>
            <p className="mt-1 truncate text-[12.5px] text-brand-200/90">
              {config.tagline || DEFAULT_TAGLINE}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500">
              Prefix{" "}
              <code className="rounded-md bg-white/[0.06] px-1.5 py-0.5 font-mono text-brand-300">
                {prefix}
              </code>{" "}
              + Slash Commands · {enabledCount}/{QUICK_MODULES.length} active
            </p>
          </div>
        </div>

        {/* Smooth 1-Tap Module Toggles */}
        <div className="relative mt-4 space-y-2">
          {QUICK_MODULES.map((mod) => {
            const isOn = Boolean(enabled[mod.id]);
            const Icon = mod.Icon;
            return (
              <button
                key={mod.id}
                type="button"
                role="switch"
                aria-checked={isOn}
                onClick={() => toggleModule(mod)}
                className={`group flex w-full items-center gap-3.5 rounded-[20px] border px-3.5 py-3 text-left transition-all duration-300 ease-smooth active:scale-[0.99] ${
                  isOn
                    ? "border-brand-400/18 bg-white/[0.03] hover:border-brand-300/32 hover:bg-white/[0.05]"
                    : "border-white/[0.05] bg-black/30 opacity-70 hover:opacity-95"
                }`}
              >
                <span
                  className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ease-smooth ${
                    isOn
                      ? "border-brand-400/28 bg-brand-400/[0.11] text-brand-300 shadow-[0_0_24px_-8px_rgb(var(--brand-400)/0.5)]"
                      : "border-white/[0.07] bg-white/[0.03] text-zinc-500"
                  }`}
                >
                  <Icon className="size-[18px]" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold text-zinc-100">
                    {mod.title}
                  </span>
                  <span className="mt-0.5 block truncate text-[11.5px] text-zinc-400">
                    {mod.subtitle}
                  </span>
                </span>

                {/* Butter-smooth capsule switch */}
                <span
                  aria-hidden
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ease-smooth ${
                    isOn
                      ? "bg-brand-400 shadow-[0_0_18px_-4px_rgb(var(--brand-400)/0.75)]"
                      : "bg-white/[0.1]"
                  }`}
                >
                  <span
                    className={`size-5 rounded-full transition-transform duration-300 ease-smooth ${
                      isOn
                        ? "translate-x-5 bg-ink-950 shadow-sm"
                        : "translate-x-0 bg-zinc-400"
                    }`}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Soft Live Feedback Footer */}
        <div className="relative mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/[0.06] bg-black/45 px-4 py-2.5 text-[12px]">
          <span className="flex min-w-0 flex-1 items-center gap-2 text-zinc-300">
            <span className="size-1.5 shrink-0 rounded-full bg-brand-400 shadow-[0_0_8px_rgb(var(--brand-300))]" />
            <span className="truncate">{statusLine}</span>
          </span>
          <Link
            href={site.demo}
            className="group inline-flex shrink-0 items-center gap-1 font-medium text-brand-300 transition-colors hover:text-brand-100"
          >
            All 12 modules
            <ArrowRight className="size-3.5 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
          </Link>
        </div>
      </SpotlightCard>
    </div>
  );
}
