"use client";

import { useState } from "react";
import { features, modules } from "@/lib/site";
import { featureIcons, CheckIcon, CopyIcon } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  const { config } = useSiteConfig();
  const [active, setActive] = useState(0);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const feature = features[active];
  const ActiveIcon = featureIcons[feature.icon];

  const liveCommand = feature.command
    ? feature.command.replace(/^\S?(?=[a-z])/, config.prefix || ".")
    : undefined;

  const handleCopyCommand = async () => {
    if (!liveCommand) return;
    try {
      await navigator.clipboard.writeText(liveCommand);
      setCopiedCmd(true);
      window.setTimeout(() => setCopiedCmd(false), 1600);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <section id="features" className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Features</p>
          <h2 className="mt-4 font-display text-[32px] font-semibold leading-[1.08] tracking-tight text-white sm:text-[46px]">
            Everything a server needs,
            <span className="text-gradient-brand"> already armed</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Five surfaces, one guard engine. Every module shares the same
            gateway interception layer, so nothing slips between the cracks.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {features.map((f, i) => {
              const Icon = featureIcons[f.icon];
              const isActive = i === active;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setCopiedCmd(false);
                  }}
                  aria-pressed={isActive}
                  className={`group relative flex min-w-[172px] items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ease-smooth ${
                    isActive
                      ? "border-brand-500/50 bg-gradient-to-r from-brand-950/75 via-ink-900 to-ink-900 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_18px_45px_-26px_rgb(var(--brand-500)/0.85)]"
                      : "border-white/[0.07] bg-ink-900/55 text-zinc-400 hover:border-brand-500/30 hover:bg-ink-850/80 hover:text-zinc-100"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
                      isActive
                        ? "border-brand-500/35 bg-brand-600/20 text-brand-400 shadow-[0_0_20px_-6px_rgb(var(--brand-500)/0.8)]"
                        : "border-white/[0.06] bg-white/[0.03] text-zinc-500 group-hover:border-brand-500/20 group-hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13.5px] font-semibold">
                      {f.key}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-500">
                      module 0{i + 1}
                    </span>
                  </span>
                  {isActive && (
                    <span className="size-2 rounded-full bg-brand-500 shadow-[0_0_12px_2px_rgb(var(--brand-500)/0.75)]" />
                  )}
                </button>
              );
            })}

            <div className="mt-1 hidden rounded-xl border border-white/[0.07] bg-ink-900/55 px-4 py-3.5 lg:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                module coverage
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {modules.slice(0, 10).map((m) => (
                  <span
                    key={m}
                    className="rounded border border-white/[0.07] bg-black/40 px-1.5 py-0.5 font-mono text-[9px] text-zinc-400"
                  >
                    {m}
                  </span>
                ))}
                <span className="rounded border border-brand-500/35 bg-brand-950/55 px-1.5 py-0.5 font-mono text-[9px] font-medium text-brand-300">
                  +16 more
                </span>
              </div>
            </div>
          </div>

          {/* active feature panel */}
          <div className="panel panel-inner relative overflow-hidden rounded-2xl border-brand-500/20 p-6 shadow-panel sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-600) / 0.22), transparent)",
              }}
            />
            <div className="animate-fade-in relative" key={feature.key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-950/60 text-brand-400 shadow-[0_0_28px_-8px_rgb(var(--brand-500)/0.7)]">
                    <ActiveIcon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-[23px] font-semibold tracking-tight text-white">
                      {feature.headline}
                    </h3>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      always-on · sub-500ms protection
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.08] px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-emerald-300 sm:inline-flex">
                  <span className="size-1.5 rounded-full bg-emerald-400" />
                  active
                </span>
              </div>

              <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-zinc-300">
                {feature.copy}
              </p>

              <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {feature.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 rounded-xl border border-white/[0.065] bg-black/40 px-3.5 py-3 transition-colors duration-200 hover:border-brand-500/30"
                  >
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-brand-400" />
                    <span className="text-[13px] leading-snug text-zinc-200">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>

              {liveCommand && (
                <button
                  type="button"
                  onClick={() => void handleCopyCommand()}
                  title="Click to copy command"
                  className="group mt-7 flex w-full items-center gap-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/70 px-4 py-3 text-left transition-all duration-200 hover:border-brand-500/45 hover:bg-black/85"
                >
                  <span className="font-mono text-[11px] text-brand-500">$</span>
                  <code className="whitespace-nowrap font-mono text-[12.5px] font-medium text-brand-200">
                    {liveCommand}
                  </code>
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-400 transition-colors group-hover:border-brand-500/35 group-hover:text-brand-200">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
