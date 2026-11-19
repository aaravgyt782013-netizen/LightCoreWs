"use client";

import Link from "next/link";
import { useState } from "react";
import { site, voiceCards } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import {
  ArrowRight,
  CheckIcon,
  LockIcon,
  PlusIcon,
  VoiceIcon,
} from "@/components/ui/Icons";
import { FancyName } from "@/components/site/FancyName";

const LIMITS = [0, 4, 8, 16];
const BITRATES = [96, 128, 256, 384];

function InteractiveVoiceDeck() {
  const { config } = useSiteConfig();
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [limitIdx, setLimitIdx] = useState(0);
  const [bitrateIdx, setBitrateIdx] = useState(1);
  const limit = LIMITS[limitIdx];
  const bitrate = BITRATES[bitrateIdx];
  const logoSrc = config.logoUrl || site.logo;
  const prefix = config.prefix || site.prefix;

  return (
    <div className="relative space-y-3.5">
      <SpotlightCard className="overflow-hidden rounded-[24px] border-brand-500/25">
        <div
          aria-hidden
          className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-brand-500/80 to-transparent"
        />
        <div className="relative flex items-center justify-between border-b border-white/[0.07] bg-black/50 px-4 py-3">
          <div className="flex items-center gap-2">
            <VoiceIcon className="size-3.5 text-brand-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300">
              VoiceMaster · Interactive Deck
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
            {bitrate} kbps
          </span>
        </div>

        <div className="relative p-4 sm:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-500">
            Dynamic Voice Category
          </p>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] text-zinc-400">
              <PlusIcon className="size-3.5 text-brand-400" />
              <span>Join to Create</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-brand-500/40 bg-brand-950/45 px-3 py-2.5 transition-all duration-300">
              {locked ? (
                <LockIcon className="size-3.5 shrink-0 text-brand-400" />
              ) : (
                <VoiceIcon className="size-3.5 shrink-0 text-emerald-400" />
              )}
              <FancyName height={12} />
              <span className="truncate text-[12px] font-medium text-white">
                &apos;s room
              </span>
              {hidden && (
                <span className="rounded border border-brand-500/35 bg-brand-500/15 px-1.5 py-0.5 font-mono text-[8.5px] uppercase text-brand-200">
                  ghost
                </span>
              )}
              <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[9.5px] text-zinc-300">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                3/{limit === 0 ? "∞" : limit}
              </span>
            </div>

            <div className="space-y-1 pl-3">
              {[
                { name: "aarav", tag: "host · speaking", active: true },
                { name: "nyx", tag: "connected", active: true },
                { name: "kira", tag: "deafened", active: false },
              ].map((m) => (
                <div key={m.name} className="flex items-center gap-2.5 py-1">
                  <span
                    className={`relative size-5 shrink-0 overflow-hidden rounded-full ring-1 ${
                      m.active ? "ring-emerald-400/60" : "ring-white/10"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoSrc}
                      alt=""
                      width={20}
                      height={20}
                      className="size-full object-cover opacity-85"
                    />
                  </span>
                  <span className="text-[11.5px] text-zinc-200">{m.name}</span>
                  <span className="ml-auto font-mono text-[9px] text-zinc-500">
                    {m.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/[0.07] bg-black/65 p-3 font-mono text-[10.5px] leading-relaxed">
            <p className="text-zinc-400">
              <span className="text-brand-400">{prefix}voicemaster</span> setup
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-emerald-400">
              <CheckIcon className="size-3" />{" "}
              {locked
                ? "Channel locked to permitted members"
                : hidden
                  ? "Room hidden from server channel list"
                  : "Auto-cleanup & owner permissions synced"}
            </p>
          </div>
        </div>
      </SpotlightCard>

      {/* Interactive 4-Button Owner Deck */}
      <SpotlightCard className="rounded-[22px] p-4">
        <div className="relative flex items-center justify-between gap-3">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.2em] text-brand-300">
            Owner Controls · Click to Test
          </p>
          <Link
            href="/dashboard/demo?tab=voicemaster"
            className="font-mono text-[9.5px] text-zinc-400 hover:text-white"
          >
            Edit Template →
          </Link>
        </div>

        <div className="relative mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            className={`rounded-xl border py-2 text-center font-mono text-[10px] font-medium uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              locked
                ? "border-brand-500/60 bg-brand-600/25 text-white shadow-[0_0_20px_-6px_rgb(var(--brand-500))]"
                : "border-white/[0.08] bg-black/50 text-zinc-400 hover:border-brand-500/35 hover:text-white"
            }`}
          >
            {locked ? "Locked" : "Lock"}
          </button>
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            className={`rounded-xl border py-2 text-center font-mono text-[10px] font-medium uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              hidden
                ? "border-brand-500/60 bg-brand-600/25 text-white shadow-[0_0_20px_-6px_rgb(var(--brand-500))]"
                : "border-white/[0.08] bg-black/50 text-zinc-400 hover:border-brand-500/35 hover:text-white"
            }`}
          >
            {hidden ? "Ghost On" : "Ghost"}
          </button>
          <button
            type="button"
            onClick={() => setLimitIdx((i) => (i + 1) % LIMITS.length)}
            className={`rounded-xl border py-2 text-center font-mono text-[10px] font-medium uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              limit > 0
                ? "border-brand-500/60 bg-brand-600/25 text-white shadow-[0_0_20px_-6px_rgb(var(--brand-500))]"
                : "border-white/[0.08] bg-black/50 text-zinc-400 hover:border-brand-500/35 hover:text-white"
            }`}
          >
            Cap {limit === 0 ? "∞" : limit}
          </button>
          <button
            type="button"
            onClick={() => setBitrateIdx((i) => (i + 1) % BITRATES.length)}
            className="rounded-xl border border-white/[0.08] bg-black/50 py-2 text-center font-mono text-[10px] font-medium uppercase tracking-wider text-zinc-300 transition-all duration-200 hover:border-brand-500/35 hover:text-white active:scale-95"
          >
            {bitrate}k
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
}

export function VoiceMaster() {
  return (
    <section id="voicemaster" className="relative py-20 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,448px)] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow">Dynamic Voice</p>
              <h2 className="mt-5 max-w-xl font-display text-[32px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
                Personal rooms with{" "}
                <span className="text-gradient-brand">VoiceMaster</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-400">
                Instant Join-to-Create temporary voice channels with up to
                384 kbps studio audio, full host controls built directly into
                chat, and zero empty-channel clutter.
              </p>
            </Reveal>

            <div className="mt-8 space-y-3">
              {voiceCards.map((c, i) => (
                <Reveal key={c.kicker} delay={i * 75}>
                  <SpotlightCard className="group flex gap-4 rounded-2xl p-4 transition-transform duration-300 ease-smooth hover:-translate-y-0.5 sm:p-5">
                    <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-brand-500/30 bg-brand-950/50 font-mono text-[10.5px] font-semibold text-brand-300">
                      0{i + 1}
                    </span>
                    <div className="relative">
                      <h3 className="font-display text-[15.5px] font-bold tracking-tight text-white">
                        {c.kicker}
                      </h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
                        {c.title}
                      </p>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={200} className="mt-6">
              <Link
                href="/dashboard/demo?tab=voicemaster"
                className="group inline-flex items-center gap-2 text-[13.5px] font-semibold text-brand-300 transition hover:text-white"
              >
                Configure VoiceMaster in the interactive demo
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={110} className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-600) / 0.24), transparent)",
              }}
            />
            <InteractiveVoiceDeck />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
