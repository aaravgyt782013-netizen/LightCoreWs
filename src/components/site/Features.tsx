"use client";

import { useEffect, useState } from "react";
import { features, modules } from "@/lib/site";
import { featureIcons, CheckIcon, CopyIcon } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Reveal } from "@/components/ui/Reveal";

const MODULE_TELEMETRY: Record<
  string,
  { latency: string; coverage: string; status: string }
> = {
  "Anti-Nuke": {
    latency: "Event monitoring",
    coverage: "Configurable rate limits",
    status: "Configuration-based",
  },
  AutoMod: {
    latency: "Content filtering",
    coverage: "Rules and thresholds",
    status: "Configuration-based",
  },
  "Night Mode": {
    latency: "Scheduled controls",
    coverage: "UTC and local schedules",
    status: "Configuration-based",
  },
  Ticket: {
    latency: "Ticket workflow",
    coverage: "Support routing",
    status: "Configuration-based",
  },
  VoiceMaster: {
    latency: "Voice controls",
    coverage: "Temporary channels",
    status: "Configuration-based",
  },
};

export function Features() {
  const { config } = useSiteConfig();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const feature = features[active];
  const ActiveIcon = featureIcons[feature.icon];
  const meta = MODULE_TELEMETRY[feature.key] ?? {
    latency: "Configured workflow",
    coverage: "Rule-based controls",
    status: "Setup required",
  };

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % features.length);
      setCopiedCmd(false);
    }, 5600);
    return () => window.clearInterval(id);
  }, [paused]);

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
    <section
      id="features"
      className="relative py-22 sm:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">Command suite</p>
          <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.06] tracking-tight text-white sm:text-[48px]">
            The tools your server needs,{" "}
            <span className="text-gradient-brand">in one dashboard</span>
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-zinc-400">
            Explore five core modules, review their controls, and configure
            the protection that fits your community.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-[368px_minmax(0,1fr)]">
          {/* Interactive Module Rail */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {features.map((f, i) => {
              const Icon = featureIcons[f.icon];
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
                  className={`group relative flex min-w-[180px] items-center gap-3.5 overflow-hidden rounded-2xl border px-4 py-3.5 text-left transition-all duration-300 ease-smooth active:scale-[0.985] ${
                    isActive
                      ? "border-brand-500/50 bg-gradient-to-r from-brand-950/80 via-ink-900 to-ink-900 text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.09),0_20px_50px_-26px_rgb(var(--brand-500)/0.88)]"
                      : "border-white/[0.07] bg-ink-900/55 text-zinc-400 hover:border-brand-500/30 hover:bg-ink-850/85 hover:text-zinc-100"
                  }`}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-brand-500 shadow-[0_0_14px_rgb(var(--brand-400))]"
                    />
                  )}
                  <span
                    className={`flex size-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ease-smooth ${
                      isActive
                        ? "border-brand-500/40 bg-brand-600/22 text-brand-300 shadow-[0_0_24px_-6px_rgb(var(--brand-500)/0.85)]"
                        : "border-white/[0.07] bg-white/[0.03] text-zinc-500 group-hover:border-brand-500/25 group-hover:text-zinc-200"
                    }`}
                  >
                    <Icon className="size-[18px]" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-[14px] font-semibold tracking-tight">
                      {f.key}
                    </span>
                    <span className="mt-0.5 block font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                      0{i + 1} · {MODULE_TELEMETRY[f.key]?.latency ?? "armed"}
                    </span>
                  </span>
                  {isActive && (
                    <span className="size-2 rounded-full bg-brand-500 shadow-[0_0_12px_2px_rgb(var(--brand-500)/0.85)]" />
                  )}
                </button>
              );
            })}

            <div className="mt-1 hidden rounded-2xl border border-white/[0.07] bg-ink-900/55 p-4 lg:block">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                  guard arsenal
                </p>
                <span className="font-mono text-[9px] text-brand-400">
                  26 total
                </span>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {modules.slice(0, 9).map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-white/[0.07] bg-black/45 px-2 py-0.5 font-mono text-[9px] text-zinc-400 transition-colors hover:border-brand-500/35 hover:text-zinc-200"
                  >
                    {m}
                  </span>
                ))}
                <span className="rounded-md border border-brand-500/35 bg-brand-950/60 px-2 py-0.5 font-mono text-[9px] font-semibold text-brand-300">
                  +17 more
                </span>
              </div>
            </div>
          </div>

          {/* Active Feature Showcase Card */}
          <SpotlightCard className="overflow-hidden rounded-[26px] border-brand-500/22 p-6 sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-10 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500/80 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-600) / 0.22), transparent)",
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
                        module 0{active + 1} / 0{features.length}
                      </p>
                      <h3 className="mt-1 font-display text-[25px] font-bold tracking-tight text-white sm:text-[28px]">
                        {feature.headline}
                      </h3>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/[0.09] px-3 py-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-emerald-300">
                    <span className="size-1.5 animate-ticker rounded-full bg-emerald-400" />
                    selected
                  </span>
                </div>

                {/* Module configuration details */}
                <div className="mt-6 grid grid-cols-3 gap-2.5">
                  {[
                    { k: "Workflow", v: meta.latency },
                    { k: "Scope", v: meta.coverage },
                    { k: "Mode", v: meta.status },
                  ].map((item) => (
                    <div
                      key={item.k}
                      className="rounded-xl border border-white/[0.065] bg-black/45 px-3 py-2.5"
                    >
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.22em] text-zinc-500">
                        {item.k}
                      </p>
                      <p className="mt-1 truncate text-[12px] font-semibold text-zinc-100 sm:text-[13px]">
                        {item.v}
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

              {liveCommand && (
                <button
                  type="button"
                  onClick={() => void handleCopyCommand()}
                  title="Click to copy command"
                  className="group mt-7 flex w-full items-center gap-3 overflow-x-auto rounded-2xl border border-white/[0.09] bg-black/75 px-4 py-3.5 text-left transition-all duration-300 ease-smooth hover:border-brand-500/50 hover:bg-black/90 active:scale-[0.99]"
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
                        copy cmd
                      </>
                    )}
                  </span>
                </button>
              )}
            </div>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}
