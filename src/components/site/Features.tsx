"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { features, site } from "@/lib/site";
import {
  ArrowRight,
  CheckIcon,
  CopyIcon,
  ShieldIcon,
  featureIcons,
} from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  const { config } = useSiteConfig();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const feature = features[active] ?? features[0];
  const ActiveIcon = featureIcons[feature.icon] ?? ShieldIcon;
  const prefix = config.prefix || site.prefix;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % features.length);
      setCopiedCmd(false);
    }, 6800);
    return () => window.clearInterval(id);
  }, [paused]);

  const liveCommand = feature.command
    ? feature.command.replace(/^\S?(?=[a-z])/, prefix)
    : undefined;

  const handleCopyCommand = async () => {
    if (!liveCommand) return;
    try {
      await navigator.clipboard.writeText(liveCommand);
      setCopiedCmd(true);
      window.setTimeout(() => setCopiedCmd(false), 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">All-in-One Suite</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[46px]">
              Everything your community needs,{" "}
              <span className="text-gradient-brand">zero bot clutter.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-zinc-400">
              Replace half a dozen separate bots with one smooth, reliable
              companion. Pick any module below to explore what it does.
            </p>
          </div>
          <Link
            href="/docs"
            className="btn-soft group inline-flex h-11 w-fit items-center gap-2 px-5 text-[13px] font-medium"
          >
            Browse all 68+ commands
            <ArrowRight className="size-3.5 text-brand-300 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[356px_minmax(0,1fr)] lg:gap-8">
          {/* Plush Module Selector Rail */}
          <div className="scrollbar-none flex gap-2.5 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-2 lg:overflow-visible lg:pb-0">
            {features.map((f, i) => {
              const Icon = featureIcons[f.icon] ?? ShieldIcon;
              const isActive = i === active;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setPaused(true);
                    setCopiedCmd(false);
                  }}
                  aria-pressed={isActive}
                  className={`group relative flex min-w-[190px] items-center gap-3.5 overflow-hidden rounded-[22px] border px-4 py-3.5 text-left transition-all duration-300 ease-smooth active:scale-[0.99] ${
                    isActive
                      ? "border-brand-400/32 bg-gradient-to-r from-brand-400/[0.11] via-ink-900/90 to-ink-900/80 text-white shadow-[inset_0_1px_0_rgb(255_252_235/0.08),0_20px_50px_-28px_rgb(var(--brand-400)/0.45)]"
                      : "border-white/[0.06] bg-ink-900/50 text-zinc-400 hover:border-white/[0.12] hover:bg-ink-900/80 hover:text-zinc-100"
                  }`}
                >
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300 ease-smooth ${
                      isActive
                        ? "border-brand-300/35 bg-brand-400/[0.14] text-brand-300 shadow-[0_0_24px_-6px_rgb(var(--brand-400)/0.55)]"
                        : "border-white/[0.065] bg-white/[0.03] text-zinc-500 group-hover:border-brand-400/20 group-hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[14.5px] font-semibold tracking-tight">
                      {f.key}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-zinc-500">
                      {f.category}
                    </span>
                  </span>
                  {isActive && (
                    <span className="size-2 shrink-0 rounded-full bg-brand-400 shadow-[0_0_12px_rgb(var(--brand-300))]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Feature Showcase Stage */}
          <SpotlightCard className="overflow-hidden rounded-[32px] p-6 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-28 -top-28 size-96 rounded-full blur-2xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-400) / 0.13), transparent)",
              }}
            />

            <div
              className="animate-log-in relative flex h-full flex-col justify-between"
              key={feature.key}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex size-14 items-center justify-center rounded-[20px] border border-brand-300/30 bg-brand-400/[0.1] p-3 text-brand-300 shadow-[0_0_32px_-8px_rgb(var(--brand-400)/0.45)]">
                      <ActiveIcon className="size-6" />
                    </span>
                    <div>
                      <p className="text-[11.5px] font-medium uppercase tracking-[0.16em] text-brand-300">
                        {feature.category}
                      </p>
                      <h3 className="mt-1 font-display text-[24px] font-bold tracking-tight text-white sm:text-[31px]">
                        {feature.headline}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Friendly Quick Highlights */}
                <div className="mt-7 grid grid-cols-3 gap-3">
                  {feature.highlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/[0.065] bg-black/40 px-4 py-3.5"
                    >
                      <p className="text-[10.5px] font-medium text-zinc-500">
                        {item.label}
                      </p>
                      <p className="mt-1 truncate font-display text-[14px] font-semibold text-zinc-100 sm:text-[15.5px]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 max-w-2xl text-[15.5px] leading-[1.75] text-zinc-300">
                  {feature.copy}
                </p>

                <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                  {feature.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5 transition-all duration-300 ease-smooth hover:border-brand-400/22 hover:bg-white/[0.035]"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                        <CheckIcon className="size-2.5" />
                      </span>
                      <span className="text-[12.5px] leading-snug text-zinc-200">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                {liveCommand && (
                  <button
                    type="button"
                    onClick={() => void handleCopyCommand()}
                    title="Click to copy command"
                    className="group flex h-[50px] flex-1 items-center gap-3 overflow-x-auto rounded-full border border-white/[0.08] bg-black/55 pl-4 pr-2.5 text-left transition-all duration-300 ease-smooth hover:border-brand-400/35 hover:bg-black/75 active:scale-[0.99]"
                  >
                    <code className="whitespace-nowrap font-mono text-[13px] font-medium text-brand-100">
                      {liveCommand}
                    </code>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-all duration-300 ease-smooth group-hover:border-brand-400/35 group-hover:bg-brand-400/15 group-hover:text-brand-100">
                      {copiedCmd ? (
                        <>
                          <CheckIcon className="size-3 text-emerald-400" />
                          Copied
                        </>
                      ) : (
                        <>
                          <CopyIcon className="size-3" />
                          Copy
                        </>
                      )}
                    </span>
                  </button>
                )}

                <Link
                  href={site.dashboard}
                  className="btn-primary btn-glow relative inline-flex h-[50px] shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full px-6 text-[13.5px] font-semibold hover:-translate-y-0.5 active:scale-[0.985]"
                >
                  <span className="relative z-10">Configure in Dashboard</span>
                  <ArrowRight className="relative z-10 size-3.5" />
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
