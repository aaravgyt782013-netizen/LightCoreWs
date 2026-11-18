"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { InviteButton } from "@/components/ui/InviteButton";
import { Wordmark } from "@/components/ui/Logo";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  featureIcons,
  ArrowRight,
  BoltIcon,
  CrownIcon,
  ShieldIcon,
} from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { defaultLogs, features, site, type LogEntry } from "@/lib/site";

const SIMULATED_RAID: LogEntry[] = [
  { t: "ALERT", ok: false, msg: "rogue bot attempted 12 channel deletes" },
  { t: "GATE", ok: false, msg: "rate threshold breached (12/2 per min)" },
  { t: "BLOCK", ok: false, msg: "sample action blocked · actor quarantined" },
  { t: "RESTORE", ok: true, msg: "sample recovery result · supported state restored" },
  { t: "SEALED", ok: true, msg: "sample result · protection workflow completed" },
];

const TELEMETRY_LAYERS = [
  { name: "Anti-Nuke Interceptor", metric: "Sample", pct: 78 },
  { name: "AutoMod Firewall", metric: "Sample", pct: 72 },
  { name: "State Rollback Engine", metric: "Sample", pct: 68 },
  { name: "VoiceMaster & Tickets", metric: "Sample", pct: 84 },
];

export function Hero() {
  const { config } = useSiteConfig();

  return (
    <section className="relative overflow-hidden pb-16 pt-[114px] sm:pb-20 sm:pt-[142px]">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:gap-14">
          {/* Staggered Hero Copy */}
          <div className="relative">
            <div
              className="animate-hero-in inline-flex items-center gap-2.5 rounded-full border border-brand-500/30 bg-brand-950/40 py-1.5 pl-1.5 pr-4 shadow-[0_0_36px_-10px_rgb(var(--brand-500)/0.65),inset_0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-xl"
              style={{ animationDelay: "0ms" }}
            >
              <span className="relative flex size-6 items-center justify-center rounded-full bg-brand-500/20">
                <span className="absolute size-full animate-pulse-ring rounded-full border border-brand-400/75" />
                <span className="size-1.5 rounded-full bg-brand-400 shadow-[0_0_10px_rgb(var(--brand-400))]" />
              </span>
              <span className="font-mono text-[9.5px] font-medium uppercase tracking-[0.16em] text-zinc-100 sm:text-[10.5px] sm:tracking-[0.22em]">
                {config.tagline}
              </span>
            </div>

            <h1
              className="animate-hero-in mt-7 font-display text-[42px] font-bold leading-[0.92] tracking-[0.06em] text-white drop-shadow-[0_16px_50px_rgb(var(--brand-600)/0.28)] sm:text-[60px] lg:text-[72px]"
              style={{ animationDelay: "70ms" }}
            >
              <Wordmark leadClassName="text-white" />
            </h1>

            <p
              className="animate-hero-in mt-6 max-w-[35rem] text-balance text-[15.5px] leading-[1.7] text-zinc-200 sm:text-[17px]"
              style={{ animationDelay: "140ms" }}
            >
              {config.description}.{" "}
              {config.heroSubtext && (
                <span className="text-zinc-400">{config.heroSubtext}</span>
              )}
            </p>

            <div
              className="animate-hero-in mt-9 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "210ms" }}
            >
              <InviteButton size="lg" />
              <Link
                href={site.dashboard}
                className="group inline-flex h-[52px] items-center gap-2.5 rounded-full border border-white/[0.13] bg-white/[0.04] px-6 text-[14.5px] font-medium text-zinc-100 shadow-[inset_0_1px_0_rgb(255_255_255/0.09)] backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-brand-500/[0.1] hover:text-white hover:shadow-[0_18px_44px_-16px_rgb(var(--brand-600)/0.6)] active:translate-y-0 active:scale-[0.98]"
              >
                Open Dashboard
                <ArrowRight className="size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
              </Link>
              <Link
                href="/premium"
                className="group inline-flex h-[52px] items-center gap-2 rounded-full border border-brand-500/28 bg-brand-950/35 px-5 text-[14px] font-medium text-brand-200 backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-400/60 hover:bg-brand-900/40 hover:text-white active:scale-[0.98]"
              >
                <CrownIcon className="size-4 text-brand-400 transition-transform duration-300 ease-smooth group-hover:scale-110" />
                Premium
              </Link>
            </div>

            {/* Interactive module quick-pills */}
            <div
              className="animate-hero-in mt-10 flex flex-wrap items-center gap-2"
              style={{ animationDelay: "280ms" }}
            >
              {features.map((f) => {
                const Icon = featureIcons[f.icon];
                return (
                  <a
                    key={f.key}
                    href="#features"
                    className="group inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-ink-900/80 px-3.5 py-2 text-[12px] font-medium text-zinc-300 shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-md transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-brand-950/45 hover:text-white hover:shadow-[0_12px_30px_-14px_rgb(var(--brand-500)/0.7)] active:scale-[0.97]"
                  >
                    <Icon className="size-[14px] text-brand-400 transition-transform duration-300 ease-smooth group-hover:scale-110" />
                    {f.key}
                  </a>
                );
              })}
            </div>
          </div>

          {/* Interactive Guard Command Console */}
          <div
            className="animate-hero-in"
            style={{ animationDelay: "180ms" }}
          >
            <ConsolePanel />
          </div>
        </div>

      </div>
    </section>
  );
}

function ConsolePanel() {
  const { config } = useSiteConfig();
  const [tab, setTab] = useState<"stream" | "telemetry">("stream");
  const [entries, setEntries] = useState<LogEntry[]>(defaultLogs);
  const [isLive, setIsLive] = useState(false);
  const [step, setStep] = useState(5);
  const [simulating, setSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState<LogEntry[]>([]);
  const simTimers = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      simTimers.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch("/api/logs?limit=12", { cache: "no-store" });
        if (!res.ok || !active) return;
        const data = (await res.json()) as {
          live?: boolean;
          logs?: LogEntry[];
        };
        if (
          active &&
          data.live &&
          Array.isArray(data.logs) &&
          data.logs.length > 0
        ) {
          setEntries(data.logs);
          setIsLive(true);
        }
      } catch {
        // Keep default animated stream when offline.
      }
    };
    void load();
    const poll = window.setInterval(() => void load(), 8000);
    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    if (isLive || simulating) return;
    const id = window.setInterval(() => {
      setStep((s) =>
        s + 1 > entries.length ? Math.min(4, entries.length) : s + 1,
      );
    }, 1850);
    return () => window.clearInterval(id);
  }, [isLive, simulating, entries.length]);

  const runSimulation = useCallback(() => {
    if (simulating) return;
    setTab("stream");
    setSimulating(true);
    setSimLogs([SIMULATED_RAID[0]]);
    simTimers.current.forEach((t) => window.clearTimeout(t));
    simTimers.current = [];

    SIMULATED_RAID.slice(1).forEach((entry, idx) => {
      const id = window.setTimeout(
        () => {
          setSimLogs((prev) => [
            ...prev,
            { ...entry, id: `sim-${Date.now()}-${idx}` },
          ]);
        },
        (idx + 1) * 560,
      );
      simTimers.current.push(id);
    });

    const endId = window.setTimeout(() => {
      setSimulating(false);
    }, SIMULATED_RAID.length * 560 + 2600);
    simTimers.current.push(endId);
  }, [simulating]);

  const visible =
    simLogs.length > 0 && simulating
      ? simLogs
      : isLive
        ? entries.slice(-6)
        : entries.slice(Math.max(0, step - 6), step);

  return (
    <div className="relative">
      {/* Multi-layer volumetric crimson aura behind console */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[2.4rem] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.28), rgb(var(--brand-800) / 0.1) 56%, transparent 82%)",
        }}
      />

      <SpotlightCard className="overflow-hidden rounded-[24px] border-brand-500/25 shadow-[0_36px_100px_-34px_rgba(0,0,0,0.98),0_0_70px_-30px_rgb(var(--brand-600)/0.55)]">
        {/* Top laser accent filament */}
        <div
          aria-hidden
          className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent"
        />

        {/* Console header with interactive mode switcher */}
        <div className="relative flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.075] bg-black/50 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-brand-500 shadow-[0_0_10px_rgb(var(--brand-500))]" />
              <span className="size-2.5 rounded-full bg-white/12" />
              <span className="size-2.5 rounded-full bg-white/12" />
            </span>
            <div className="ml-1 inline-flex rounded-lg border border-white/[0.07] bg-white/[0.03] p-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em]">
              <button
                type="button"
                onClick={() => setTab("stream")}
                className={`rounded-md px-2.5 py-1 transition-all duration-200 ${
                  tab === "stream"
                    ? "bg-brand-600/25 text-white shadow-[inset_0_0_0_1px_rgb(var(--brand-500)/0.45)]"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Feed
              </button>
              <button
                type="button"
                onClick={() => setTab("telemetry")}
                className={`rounded-md px-2.5 py-1 transition-all duration-200 ${
                  tab === "telemetry"
                    ? "bg-brand-600/25 text-white shadow-[inset_0_0_0_1px_rgb(var(--brand-500)/0.45)]"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Radar
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={runSimulation}
            disabled={simulating}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] font-medium uppercase tracking-wider transition-all duration-300 ease-smooth active:scale-95 ${
              simulating
                ? "border-brand-400/60 bg-brand-500/25 text-white shadow-[0_0_20px_-4px_rgb(var(--brand-500))]"
                : "border-brand-500/35 bg-brand-500/12 text-brand-200 hover:border-brand-400/70 hover:bg-brand-500/22 hover:text-white"
            }`}
          >
            <BoltIcon className="size-3 text-brand-400" />
            {simulating ? "running demo…" : "run demo"}
          </button>
        </div>

        <div className="border-b border-white/[0.06] bg-brand-950/20 px-4 py-2 font-mono text-[9px] uppercase tracking-[0.16em] text-zinc-400">
          {isLive
            ? "Live events from the connected bot"
            : simulating
              ? "Interactive simulation · sample events only"
              : "Demo preview · sample events only, not a live security feed"}
        </div>

        {/* Body */}
        <div className="relative p-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px animate-scan bg-gradient-to-r from-transparent via-brand-500/70 to-transparent" />

          {tab === "stream" ? (
            <div className="flex h-[288px] flex-col gap-2 overflow-hidden font-mono text-[11.5px] leading-relaxed [&>*:first-child]:mt-auto">
              {visible.map((l, i) => (
                <div
                  key={l.id ?? `${l.t}-${l.msg}-${i}`}
                  className="animate-log-in flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-black/55 px-3 py-2.5 transition-colors duration-200 hover:border-brand-500/30"
                >
                  <span
                    className={`mt-px shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-semibold tracking-wider ${
                      l.ok
                        ? "border border-emerald-500/25 bg-emerald-500/12 text-emerald-300"
                        : "border border-brand-500/40 bg-brand-600/22 text-brand-200"
                    }`}
                  >
                    {l.t}
                  </span>
                  <span className="text-zinc-200">{l.msg}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="animate-fade-in flex h-[288px] flex-col justify-between py-1">
              <div className="space-y-3">
                {TELEMETRY_LAYERS.map((layer) => (
                  <div
                    key={layer.name}
                    className="rounded-xl border border-white/[0.06] bg-black/50 px-3.5 py-2.5"
                  >
                    <div className="flex items-center justify-between text-[11.5px]">
                      <span className="font-medium text-zinc-200">
                        {layer.name}
                      </span>
                      <span className="font-mono text-[10px] font-semibold text-brand-300">
                        {layer.metric}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-700 via-brand-500 to-brand-300 shadow-[0_0_12px_rgb(var(--brand-500))]"
                        style={{ width: `${layer.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-8 gap-1.5 pt-2">
                {[31, 36, 29, 41, 34, 38, 33, 37].map((ms, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center rounded-lg border border-emerald-500/20 bg-emerald-500/[0.07] py-1.5 font-mono text-[8.5px]"
                  >
                    <span className="text-zinc-400">S{idx + 1}</span>
                    <span className="font-semibold text-emerald-300">
                      {ms}m
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.065] pt-3 font-mono text-[10px] text-zinc-500">
            <span>
              prefix <span className="text-brand-400">{config.prefix}</span> ·{" "}
              {isLive ? "live cluster" : "demo preview only"}
            </span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400">
              <span className="size-1.5 animate-ticker rounded-full bg-emerald-400" />
              illustrative preview
            </span>
          </div>
        </div>
      </SpotlightCard>

      {/* Floating glass micro-card */}
      <div className="absolute -bottom-5 -left-5 hidden animate-floaty items-center gap-3 rounded-2xl border border-brand-500/30 bg-ink-900/95 px-4 py-2.5 shadow-[0_22px_55px_-14px_rgba(0,0,0,0.98),0_0_34px_-12px_rgb(var(--brand-500)/0.65)] backdrop-blur-2xl sm:flex">
        <span className="flex size-8 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-600/20 text-brand-400">
          <ShieldIcon className="size-4" />
        </span>
        <div className="leading-tight">
          <p className="text-[12px] font-semibold text-white">
            Rollback Preview
          </p>
          <p className="font-mono text-[9.5px] text-brand-300">
            illustrative demo
          </p>
        </div>
      </div>
    </div>
  );
}

