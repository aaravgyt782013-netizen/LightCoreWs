"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { InviteButton } from "@/components/ui/InviteButton";
import { featureIcons, ArrowRight } from "@/components/ui/Icons";
import { features, site, stats } from "@/lib/site";
import { useCountUp } from "@/components/ui/useCountUp";

const logs = [
  { t: "GUARD", ok: true, msg: "gateway session established · shard 07" },
  { t: "SCAN", ok: true, msg: "26 modules armed · thresholds loaded" },
  { t: "WARN", ok: false, msg: "mass channel delete by @raider (7/3 per min)" },
  { t: "DENY", ok: false, msg: "action blocked in 41ms · actor quarantined" },
  { t: "FIX", ok: true, msg: "rollback restored 6 channels · 4 roles" },
  { t: "AUDIT", ok: true, msg: "incident #4471 written to audit stream" },
  { t: "GUARD", ok: true, msg: "heartbeat ok · latency 38ms" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-[112px] sm:pt-[128px]">
      <div className="container-x">
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,480px)] lg:gap-10">
          {/* copy */}
          <div className="relative">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 backdrop-blur">
              <span className="relative flex size-6 items-center justify-center rounded-full bg-brand-600/15">
                <span className="absolute size-full animate-pulse-ring rounded-full border border-brand-500/60" />
                <span className="size-1.5 rounded-full bg-brand-500" />
              </span>
              <span className="font-mono text-[10.5px] uppercase tracking-[0.24em] text-zinc-300">
                All systems operational
              </span>
            </div>

            <h1 className="mt-7 font-display text-[38px] font-bold leading-[0.95] tracking-[0.08em] text-white sm:text-[54px] lg:text-[64px]">
              <span className="text-zinc-400">LIGHT</span><span className="text-brand-500">CORE</span>
            </h1>

            <p className="mt-6 max-w-[34rem] text-balance text-[15.5px] leading-relaxed text-zinc-400 sm:text-[16.5px]">
              Real-time raid prevention, auto-moderation, and nuke blocking. Keep
              your Discord server protected around the clock, with zero setup
              latency.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <InviteButton size="lg" />
              <a
                href={site.dashboard}
                className="group inline-flex h-[52px] items-center gap-3 rounded-full border border-white/12 bg-white/[0.03] px-6 text-[15px] font-medium text-zinc-200 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
              >
                Open Dashboard
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </a>
            </div>

            {/* feature chips */}
            <div className="mt-11 flex flex-wrap items-center gap-2">
              {features.map((f, i) => {
                const Icon = featureIcons[f.icon];
                return (
                  <a
                    key={f.key}
                    href="#features"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-850/70 px-3.5 py-2 text-[12.5px] font-medium text-zinc-300 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-500/40 hover:text-white"
                    style={{ animationDelay: `${i * 120}ms` }}
                  >
                    <Icon className="size-[15px] text-brand-400/90 transition-colors group-hover:text-brand-400" />
                    {f.key}
                  </a>
                );
              })}
            </div>
          </div>

          {/* console */}
          <ConsolePanel />
        </div>

        <StatsBar />
      </div>
    </section>
  );
}

function ConsolePanel() {
  const [step, setStep] = useState(4);
  const scroller = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((s) => (s + 1 > logs.length ? 4 : s + 1));
    }, 1650);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(closest-side,rgba(239,16,16,0.18),transparent_75%)] blur-2xl" />
      <div className="panel panel-inner relative overflow-hidden rounded-[22px] shadow-panel">
        {/* header */}
        <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-brand-500 shadow-[0_0_10px_2px_rgba(255,43,43,0.6)]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-400">
              guard engine
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400/80">
            ● live
          </span>
        </div>

        {/* body */}
        <div className="relative p-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-brand-500/50 to-transparent" />
          <div
            ref={scroller}
            className="flex h-[286px] flex-col gap-2 overflow-hidden font-mono text-[11.5px] leading-relaxed [&>*:first-child]:mt-auto"
          >
            {logs
              .slice(Math.max(0, step - 6), step)
              .map((l, i) => (
              <div
                key={`${l.t}-${i}`}
                className="flex items-start gap-2.5 rounded-lg border border-white/[0.05] bg-white/[0.015] px-2.5 py-2"
              >
                <span
                  className={`mt-px shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium tracking-wider ${
                    l.ok
                      ? "bg-emerald-500/10 text-emerald-300/90"
                      : "bg-brand-600/15 text-brand-300"
                  }`}
                >
                  {l.t}
                </span>
                <span className="text-zinc-400">{l.msg}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-[10px] text-zinc-500">
            <span>uptime 99.99%</span>
            <span className="flex items-center gap-1.5">
              threat level
              <span className="text-emerald-400">nominal</span>
            </span>
          </div>
        </div>
      </div>

      {/* floating badge */}
      <div className="absolute -bottom-5 -left-4 hidden animate-floaty items-center gap-2.5 rounded-xl border border-white/10 bg-ink-900/90 px-3.5 py-2.5 shadow-panel backdrop-blur sm:flex">
        <Image
          src="/brand/lightcore-512.png"
          alt=""
          width={22}
          height={22}
          className="size-[22px] object-contain"
        />
        <div className="leading-tight">
          <p className="text-[11px] font-medium text-white">Nuke blocked</p>
          <p className="font-mono text-[9.5px] text-zinc-500">
            rollback complete · 41ms
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, suffix, label, decimals, hint }: {
  value: number;
  suffix: string;
  label: string;
  decimals?: number;
  hint: string;
}) {
  const { ref, display } = useCountUp(value, { decimals });
  return (
    <div ref={ref} className="group relative px-5 py-6 text-center sm:px-6">
      <p className="font-display text-[30px] font-semibold tracking-tight text-white sm:text-[36px]">
        {display}
        <span className="text-brand-500">{suffix}</span>
      </p>
      <p className="mt-1.5 text-[12px] font-medium uppercase tracking-[0.16em] text-zinc-400">
        {label}
      </p>
      <p className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.24em] text-zinc-600">
        {hint}
      </p>
    </div>
  );
}

function StatsBar() {
  return (
    <div className="relative mt-16">
      <div className="hairline" />
      <div className="grid grid-cols-2 divide-x divide-white/[0.06] rounded-2xl border border-white/[0.06] bg-white/[0.015] backdrop-blur-sm sm:grid-cols-4 sm:[&>*:nth-child(n+3)]:border-t sm:[&>*:nth-child(n+3)]:border-white/[0.06] sm:[&>*:nth-child(2n)]:border-l-0 md:[&>*]:border-l md:[&>*]:border-t-0 md:[&>*:first-child]:border-l-0">
        {stats.map((s) => (
          <Stat
            key={s.label}
            value={s.value}
            suffix={s.suffix}
            label={s.label}
            hint={s.hint}
            decimals={s.decimals}
          />
        ))}
      </div>
    </div>
  );
}
