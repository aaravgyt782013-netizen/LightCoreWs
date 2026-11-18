"use client";

import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  ActivityIcon,
  BoltIcon,
  CheckIcon,
  CrownIcon,
  LockIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

const INITIAL_GATES = [
  { id: "channels", name: "Anti-Channel Wipe", rate: "2 / 60s", ms: "38ms", on: true },
  { id: "bans", name: "Mass-Ban Interceptor", rate: "3 / 60s", ms: "24ms", on: true },
  { id: "webhooks", name: "Webhook Flood Guard", rate: "1 / 60s", ms: "19ms", on: true },
  { id: "roles", name: "Role Escalation Lock", rate: "0 / 60s", ms: "14ms", on: true },
];

const SNAPSHOT_LAYERS = [
  { label: "Channel tree & slowmodes", count: "148 synced" },
  { label: "Role hierarchy & bitfields", count: "64 locked" },
  { label: "Permission overwrites", count: "1,920 hashed" },
];

const TRUST_TIERS = [
  { role: "Server Owner", access: "Root Authority", badge: "crown" },
  { role: "Whitelisted Admins", access: "Scoped Bypass", badge: "check" },
  { role: "LightCore Engine", access: "26 Active Gates", badge: "shield" },
  { role: "Untrusted Actors", access: "Zero-Trust Sandbox", badge: "lock" },
];

export function DefenseBento() {
  const [gates, setGates] = useState(INITIAL_GATES);
  const armedCount = gates.filter((g) => g.on).length;

  const toggleGate = (id: string) => {
    setGates((prev) =>
      prev.map((g) => (g.id === id ? { ...g, on: !g.on } : g)),
    );
  };

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Next-gen engine</p>
          <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
            Engineered to <span className="text-gradient-brand">outpace</span>{" "}
            every threat
          </h2>
          <p className="mt-4 text-balance text-[15px] leading-relaxed text-zinc-400">
            Interactive real-time defense primitives built for high-stakes
            Discord communities — sub-50ms reaction, atomic rollback, and zero
            downtime.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          {/* Card 1: Interactive Live Rate-Gate Matrix (7 cols) */}
          <Reveal className="lg:col-span-7">
            <SpotlightCard className="flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-6 sm:p-7">
              <div className="relative flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.24em] text-brand-400">
                    <BoltIcon className="size-3.5" />
                    interactive firewall
                  </span>
                  <h3 className="mt-2 font-display text-[21px] font-bold tracking-tight text-white sm:text-[23px]">
                    Per-Actor Rate Gates
                  </h3>
                  <p className="mt-1.5 max-w-md text-[13px] leading-relaxed text-zinc-400">
                    Tap any protection gate below to preview instant zero-reload
                    arming across your server.
                  </p>
                </div>
                <span className="rounded-full border border-brand-500/35 bg-brand-950/55 px-3 py-1 font-mono text-[10px] font-semibold text-brand-200">
                  {armedCount}/{gates.length} armed
                </span>
              </div>

              <div className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
                {gates.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    role="switch"
                    aria-checked={g.on}
                    onClick={() => toggleGate(g.id)}
                    className={`group flex items-center justify-between gap-3 rounded-2xl border p-3.5 text-left transition-all duration-300 ease-smooth active:scale-[0.98] ${
                      g.on
                        ? "border-brand-500/40 bg-gradient-to-br from-brand-950/55 to-black/70 shadow-[0_14px_34px_-22px_rgb(var(--brand-500)/0.85)]"
                        : "border-white/[0.07] bg-black/45 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {g.name}
                      </p>
                      <p className="mt-0.5 font-mono text-[9.5px] text-zinc-400">
                        limit {g.rate} ·{" "}
                        <span className={g.on ? "text-brand-300" : "text-zinc-500"}>
                          {g.ms}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-all duration-300 ease-smooth ${
                        g.on
                          ? "border-brand-400/60 bg-brand-600 shadow-[0_0_16px_-2px_rgb(var(--brand-500))]"
                          : "border-white/12 bg-zinc-800/90"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full bg-white shadow transition-transform duration-300 ease-smooth ${
                          g.on ? "translate-x-[19px]" : "translate-x-[3px]"
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Card 2: Sub-50ms Reaction Benchmark + Oscilloscope (5 cols) */}
          <Reveal delay={80} className="lg:col-span-5">
            <SpotlightCard className="flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-6 sm:p-7">
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.24em] text-brand-400">
                  <ActivityIcon className="size-3.5" />
                  gateway speed
                </span>
                <div className="mt-2 flex items-baseline gap-2.5">
                  <span className="font-display text-[40px] font-bold leading-none tabular-nums text-white sm:text-[46px]">
                    38<span className="text-brand-500">ms</span>
                  </span>
                  <span className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9.5px] font-semibold text-emerald-300">
                    63× faster
                  </span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">
                  In-memory audit correlation neutralizes rogue actions before a
                  second API burst lands.
                </p>
              </div>

              {/* Crimson telemetry waveform */}
              <div className="relative mt-6 rounded-2xl border border-white/[0.07] bg-black/60 p-4">
                <svg
                  aria-hidden
                  viewBox="0 0 320 72"
                  fill="none"
                  className="animate-wave-pulse h-14 w-full"
                >
                  <defs>
                    <linearGradient id="lcWaveFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(var(--brand-500))" stopOpacity="0.36" />
                      <stop offset="100%" stopColor="rgb(var(--brand-500))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 54 L46 53 L68 50 L84 14 L98 60 L112 32 L126 52 L178 51 L196 18 L210 56 L224 38 L242 52 L320 51 L320 72 L0 72 Z"
                    fill="url(#lcWaveFill)"
                  />
                  <path
                    d="M0 54 L46 53 L68 50 L84 14 L98 60 L112 32 L126 52 L178 51 L196 18 L210 56 L224 38 L242 52 L320 51"
                    stroke="rgb(var(--brand-500))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="84" cy="14" r="3.5" fill="rgb(var(--brand-300))" />
                  <circle cx="196" cy="18" r="3.5" fill="rgb(var(--brand-300))" />
                </svg>
                <div className="mt-2 flex items-center justify-between font-mono text-[9.5px] text-zinc-500">
                  <span>
                    LightCore <span className="text-brand-300">38ms</span>
                  </span>
                  <span>Avg bot ~2,400ms</span>
                </div>
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Card 3: Atomic State Snapshots (5 cols) */}
          <Reveal delay={120} className="lg:col-span-5">
            <SpotlightCard className="flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-6 sm:p-7">
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.24em] text-brand-400">
                  <ShieldIcon className="size-3.5" />
                  state vault
                </span>
                <h3 className="mt-2 font-display text-[21px] font-bold tracking-tight text-white">
                  1:1 Instant Rollback
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-zinc-400">
                  Deleted channels, role colors, positions, and permission
                  overwrites rebuild automatically in sequence.
                </p>
              </div>

              <div className="relative mt-6 space-y-2">
                {SNAPSHOT_LAYERS.map((layer, idx) => (
                  <div
                    key={layer.label}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/55 px-3.5 py-2.5 transition-all duration-300 ease-smooth hover:translate-x-1 hover:border-brand-500/40"
                  >
                    <span className="flex items-center gap-2.5 text-[12.5px] font-medium text-zinc-200">
                      <span className="font-mono text-[9.5px] text-brand-400">
                        0{idx + 1}
                      </span>
                      {layer.label}
                    </span>
                    <span className="shrink-0 font-mono text-[9.5px] text-emerald-300">
                      {layer.count}
                    </span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>

          {/* Card 4: Zero-Trust Clearance Hierarchy (7 cols) */}
          <Reveal delay={160} className="lg:col-span-7">
            <SpotlightCard className="flex h-full flex-col justify-between overflow-hidden rounded-[26px] p-6 sm:p-7">
              <div className="relative">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.24em] text-brand-400">
                  <LockIcon className="size-3.5" />
                  zero-trust hierarchy
                </span>
                <h3 className="mt-2 font-display text-[21px] font-bold tracking-tight text-white sm:text-[23px]">
                  Surgical Whitelist Control
                </h3>
                <p className="mt-1.5 max-w-lg text-[13px] leading-relaxed text-zinc-400">
                  Senior staff work uninterrupted while compromised bots and
                  rogue admins hit an unbreakable wall.
                </p>
              </div>

              <div className="relative mt-6 grid gap-2.5 sm:grid-cols-2">
                {TRUST_TIERS.map((tier) => (
                  <div
                    key={tier.role}
                    className="flex items-center gap-3 rounded-2xl border border-white/[0.075] bg-black/55 px-4 py-3 transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/40"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-950/55 text-brand-400">
                      {tier.badge === "crown" ? (
                        <CrownIcon className="size-4" />
                      ) : tier.badge === "check" ? (
                        <CheckIcon className="size-4" />
                      ) : tier.badge === "shield" ? (
                        <ShieldIcon className="size-4" />
                      ) : (
                        <LockIcon className="size-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-white">
                        {tier.role}
                      </p>
                      <p className="font-mono text-[9.5px] uppercase tracking-wider text-zinc-500">
                        {tier.access}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
