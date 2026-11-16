"use client";

import { useState } from "react";
import { features, modules } from "@/lib/site";
import { featureIcons, CheckIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

export function Features() {
  const [active, setActive] = useState(0);
  const feature = features[active];
  const ActiveIcon = featureIcons[feature.icon];

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
                  onClick={() => setActive(i)}
                  aria-pressed={isActive}
                  className={`group relative flex min-w-[168px] items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-300 ${
                    isActive
                      ? "border-brand-600/40 bg-brand-950/40 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_18px_45px_-30px_rgba(239,16,16,0.9)]"
                      : "border-white/[0.07] bg-white/[0.015] text-zinc-400 hover:border-white/[0.14] hover:bg-white/[0.035] hover:text-zinc-200"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-brand-600/20 text-brand-400"
                        : "bg-white/[0.04] text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13.5px] font-medium">
                      {f.key}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                      module 0{i + 1}
                    </span>
                  </span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-brand-500 shadow-[0_0_10px_2px_rgba(255,43,43,0.55)]" />
                  )}
                </button>
              );
            })}

            <div className="mt-1 hidden rounded-xl border border-white/[0.06] bg-white/[0.012] px-4 py-3.5 lg:block">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-600">
                module coverage
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {modules.slice(0, 10).map((m) => (
                  <span
                    key={m}
                    className="rounded border border-white/[0.06] bg-white/[0.02] px-1.5 py-0.5 font-mono text-[9px] text-zinc-500"
                  >
                    {m}
                  </span>
                ))}
                <span className="rounded border border-brand-600/30 bg-brand-950/40 px-1.5 py-0.5 font-mono text-[9px] text-brand-300">
                  +16 more
                </span>
              </div>
            </div>
          </div>

          {/* panel */}
          <div className="panel panel-inner relative overflow-hidden rounded-2xl p-6 shadow-panel sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(closest-side,rgba(239,16,16,0.16),transparent)]"
            />
            <div className="relative" key={feature.key}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-12 items-center justify-center rounded-xl border border-brand-600/25 bg-brand-950/50 text-brand-400">
                    <ActiveIcon className="size-6" />
                  </span>
                  <div>
                    <h3 className="font-display text-[22px] font-semibold tracking-tight text-white">
                      {feature.headline}
                    </h3>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                      always-on · zero config
                    </p>
                  </div>
                </div>
                <span className="hidden shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-2.5 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-emerald-400/90 sm:inline">
                  enabled
                </span>
              </div>

              <p className="mt-6 max-w-2xl text-[14.5px] leading-relaxed text-zinc-400">
                {feature.copy}
              </p>

              <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
                {feature.points.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-3 py-2.5"
                  >
                    <CheckIcon className="mt-0.5 size-3.5 shrink-0 text-brand-400" />
                    <span className="text-[12.5px] leading-snug text-zinc-300">
                      {p}
                    </span>
                  </li>
                ))}
              </ul>

              {feature.command && (
                <div className="mt-7 flex items-center gap-3 overflow-x-auto rounded-lg border border-white/[0.07] bg-ink-950/80 px-4 py-3">
                  <span className="font-mono text-[11px] text-zinc-600">$</span>
                  <code className="whitespace-nowrap font-mono text-[12.5px] text-brand-300">
                    {feature.command}
                  </code>
                  <span className="ml-auto hidden shrink-0 rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500 sm:inline">
                    discord
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
