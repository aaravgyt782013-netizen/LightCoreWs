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
    }, 6200);
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
      className="relative py-20 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x">
        <Reveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="eyebrow">8-in-1 Command Suite</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
              Every module your guild needs,{" "}
              <span className="text-gradient-brand">zero bot clutter.</span>
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
              Inspect all eight integrated suites below — copy any command in
              one click or jump directly into its interactive dashboard tab.
            </p>
          </div>
          <Link
            href="/docs"
            className="group inline-flex h-10 w-fit items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.03] px-4 text-[12.5px] font-medium text-zinc-200 transition hover:border-brand-500/45 hover:text-white"
          >
            Browse all 68+ commands
            <ArrowRight className="size-3.5 text-brand-400 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <div className="mt-11 grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* 8-Module Selector Rail */}
          <div className="scrollbar-none flex gap-2 overflow-x-auto pb-2 lg:grid lg:grid-cols-1 lg:gap-2 lg:overflow-visible lg:pb-0">
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
                  className={`group relative flex min-w-[185px] items-center gap-3.5 overflow-hidden rounded-2xl border px-4 py-3 text-left transition-all duration-300 ease-smooth active:scale-[0.985] ${
                    isActive
                      ? "border-brand-500/50 bg-gradient-to-r from-brand-950/80 via-ink-900 to-ink-900 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.09),0_18px_46px_-26px_rgb(var(--brand-500)/0.85)]"
                      : "border-white/[0.07] bg-ink-900/55 text-zinc-400 hover:border-brand-500/30 hover:bg-ink-850/85 hover:text-zinc-100"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-2.5 left-0 w-[3px] rounded-r-full bg-brand-500 shadow-[0_0_14px_rgb(var(--brand-400))]"
                    />
                  )}
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ease-smooth ${
                      isActive
                        ? "border-brand-500/40 bg-brand-600/22 text-brand-300 shadow-[0_0_24px_-6px_rgb(var(--brand-500)/0.85)]"
                        : "border-white/[0.07] bg-white/[0.03] text-zinc-500 group-hover:border-brand-500/25 group-hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="size-[17px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[14px] font-semibold tracking-tight">
                      {f.key}
                    </span>
                    <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                      0{i + 1} · {f.category}
                    </span>
                  </span>
                  {isActive && (
                    <span className="size-2 shrink-0 rounded-full bg-brand-500 shadow-[0_0_12px_2px_rgb(var(--brand-500)/0.85)]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Feature Deep-Dive Stage */}
          <SpotlightCard className="overflow-hidden rounded-[28px] border-brand-500/25 p-6 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/80 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-600) / 0.2), transparent)",
              }}
            />

            <div
              className="animate-log-in relative flex h-full flex-col justify-between"
              key={feature.key}
            >
              <div>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex size-13 items-center justify-center rounded-2xl border border-brand-500/40 bg-brand-950/65 p-3 text-brand-400 shadow-[0_0_32px_-8px_rgb(var(--brand-500)/0.8)]">
                      <ActiveIcon className="size-6" />
                    </span>
                    <div>
                      <p className="font-mono text-[9.5px] uppercase tracking-[0.26em] text-brand-400">
                        Module 0{active + 1} / 0{features.length} ·{" "}
                        {feature.category}
                      </p>
                      <h3 className="mt-1 font-display text-[24px] font-bold tracking-tight text-white sm:text-[30px]">
                        {feature.headline}
                      </h3>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/demo?tab=${feature.demoTab}`}
                    className="group inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:text-white"
                  >
                    Try in Sandbox
                    <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Spec Tiles */}
                <div className="mt-6 grid grid-cols-3 gap-2.5 sm:gap-3">
                  {feature.highlights.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/[0.07] bg-black/50 px-3.5 py-3"
                    >
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-zinc-500">
                        {item.label}
                      </p>
                      <p className="mt-1 truncate font-display text-[13.5px] font-semibold text-white sm:text-[15px]">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 max-w-2xl text-[15px] leading-[1.72] text-zinc-300">
                  {feature.copy}
                </p>

                <ul className="mt-6 grid gap-2.5 sm:grid-cols-3">
                  {feature.points.map((p) => (
                    <li
                      key={p}
                      className="flex items-start gap-2.5 rounded-xl border border-white/[0.07] bg-black/45 px-3.5 py-3 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/35"
                    >
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                        <CheckIcon className="size-2.5" />
                      </span>
                      <span className="text-[12.5px] leading-snug text-zinc-200">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                {liveCommand && (
                  <button
                    type="button"
                    onClick={() => void handleCopyCommand()}
                    title="Click to copy command"
                    className="group flex flex-1 items-center gap-3 overflow-x-auto rounded-2xl border border-white/[0.09] bg-black/75 px-4 py-3.5 text-left transition-all duration-300 ease-smooth hover:border-brand-500/50 hover:bg-black/90 active:scale-[0.99]"
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-brand-500/30 bg-brand-950/60 font-mono text-[11px] font-bold text-brand-400">
                      &gt;
                    </span>
                    <code className="whitespace-nowrap font-mono text-[13px] font-medium text-zinc-100">
                      {liveCommand}
                    </code>
                    <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/[0.09] bg-white/[0.04] px-3 py-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-300 transition-all duration-200 group-hover:border-brand-500/45 group-hover:bg-brand-500/15 group-hover:text-white">
                      {copiedCmd ? (
                        <>
                          <CheckIcon className="size-3 text-emerald-400" />
                          copied
                        </>
                      ) : (
                        <>
                          <CopyIcon className="size-3" />
                          copy
                        </>
                      )}
                    </span>
                  </button>
                )}

                <Link
                  href={`/dashboard/demo?tab=${feature.demoTab}`}
                  className="btn-primary inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-2xl px-5 text-[13px] font-semibold text-white transition hover:-translate-y-0.5"
                >
                  Configure Live
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
