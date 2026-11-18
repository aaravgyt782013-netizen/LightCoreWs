"use client";

import { useState } from "react";
import { site, voiceCards } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { VoiceIcon, CheckIcon, LockIcon, PlusIcon } from "@/components/ui/Icons";
import { FancyName } from "@/components/site/FancyName";

const LIMITS = [0, 4, 8, 16];

function InteractiveVoiceDeck() {
  const { config } = useSiteConfig();
  const [locked, setLocked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [limitIdx, setLimitIdx] = useState(0);
  const limit = LIMITS[limitIdx];
  const logoSrc = config.logoUrl || site.logo;
  const prefix = config.prefix || site.prefix;

  return (
    <div className="relative space-y-3.5">
      <SpotlightCard className="overflow-hidden rounded-[24px] border-brand-500/22">
        <div
          aria-hidden
          className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-brand-500/80 to-transparent"
        />
        <div className="relative flex items-center justify-between border-b border-white/[0.07] bg-black/45 px-4 py-3">
          <div className="flex items-center gap-2">
            <VoiceIcon className="size-3.5 text-brand-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-300">
              voicemaster · live preview
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-300">
            <span className="size-1.5 animate-ticker rounded-full bg-emerald-400" />
            ready
          </span>
        </div>

        <div className="relative p-4 sm:p-5">
          <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-zinc-500">
            Active Voice Hub
          </p>

          <div className="mt-2.5 space-y-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[12px] text-zinc-400">
              <PlusIcon className="size-3.5 text-brand-400" />
              <span>Join to Create</span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-brand-500/35 bg-brand-950/45 px-3 py-2.5 transition-all duration-300">
              {locked ? (
                <LockIcon className="size-3.5 shrink-0 text-brand-400" />
              ) : (
                <VoiceIcon className="size-3.5 shrink-0 text-brand-400" />
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
                { tag: "owner · speaking", active: true },
                { tag: "connected", active: true },
                { tag: "muted", active: false },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-2.5 py-1">
                  <span
                    className={`relative size-5 shrink-0 overflow-hidden rounded-full ring-1 ${
                      m.active ? "ring-brand-500/50" : "ring-white/10"
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
                  <span className="text-[11.5px] text-zinc-300">
                    member_0{i + 1}
                  </span>
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
              <CheckIcon className="size-3" /> Hub &amp; dynamic permissions synced
            </p>
          </div>
        </div>
      </SpotlightCard>

      {/* Interactive owner controls */}
      <SpotlightCard className="rounded-[22px] p-4">
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-500/45">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt=""
                width={40}
                height={40}
                className="size-full object-cover"
              />
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-[13.5px] font-semibold text-white">
                <FancyName height={13} />
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-brand-300">
                room controls · tap to try
              </p>
            </div>
          </div>
        </div>

        <div className="relative mt-3.5 grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            className={`rounded-xl border py-2 text-center font-mono text-[10px] font-medium uppercase tracking-wider transition-all duration-200 active:scale-95 ${
              locked
                ? "border-brand-500/60 bg-brand-600/25 text-white shadow-[0_0_20px_-6px_rgb(var(--brand-500))]"
                : "border-white/[0.08] bg-black/50 text-zinc-400 hover:border-brand-500/35 hover:text-white"
            }`}
          >
            {locked ? "locked" : "lock"}
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
            {hidden ? "hidden" : "ghost"}
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
            limit {limit === 0 ? "∞" : limit}
          </button>
        </div>
      </SpotlightCard>
    </div>
  );
}

export function VoiceMaster() {
  return (
    <section id="voicemaster" className="relative py-22 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,432px)] lg:items-center">
          <div>
            <Reveal>
              <p className="eyebrow">Dynamic voice</p>
              <h2 className="mt-5 max-w-xl font-display text-[32px] font-bold leading-[1.06] tracking-tight text-white sm:text-[48px]">
                Personal rooms with{" "}
                <span className="text-gradient-brand">VoiceMaster</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-zinc-400">
                Instant join-to-create voice rooms with full owner controls
                built directly into chat and automatic empty-room cleanup.
              </p>
            </Reveal>

            <div className="mt-9 space-y-3">
              {voiceCards.map((c, i) => (
                <Reveal key={c.kicker} delay={i * 80}>
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
          </div>

          <Reveal delay={120} className="relative">
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
