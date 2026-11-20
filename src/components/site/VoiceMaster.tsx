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
  const rawLogo = config.logoUrl || site.logo;
  const avatarSrc =
    rawLogo === "/brand/logo.png" ? "/brand/lightcore-mark.png" : rawLogo;

  return (
    <SpotlightCard className="overflow-hidden rounded-[32px] p-5 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/60 to-transparent"
      />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl border border-brand-400/25 bg-brand-400/[0.1] text-brand-300">
            <VoiceIcon className="size-4" />
          </span>
          <span className="text-[13px] font-semibold text-zinc-100">
            VoiceMaster Preview
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
          {bitrate} kbps
        </span>
      </div>

      <div className="relative mt-4 rounded-[22px] border border-white/[0.06] bg-black/45 p-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/[0.05] bg-white/[0.025] px-3.5 py-2.5 text-[12.5px] text-zinc-400">
          <PlusIcon className="size-3.5 text-brand-300" />
          <span>Join to Create</span>
        </div>

        <div className="mt-2.5 flex items-center gap-2 rounded-2xl border border-brand-400/30 bg-brand-400/[0.08] px-3.5 py-3 transition-all duration-300 ease-smooth">
          {locked ? (
            <LockIcon className="size-4 shrink-0 text-brand-300" />
          ) : (
            <VoiceIcon className="size-4 shrink-0 text-emerald-400" />
          )}
          <FancyName height={12} />
          <span className="truncate text-[13px] font-medium text-white">
            &apos;s lounge
          </span>
          {hidden && (
            <span className="rounded-full bg-brand-400/20 px-2 py-0.5 text-[10px] font-medium text-brand-200">
              Hidden
            </span>
          )}
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-medium text-zinc-200">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            3 / {limit === 0 ? "∞" : limit}
          </span>
        </div>

        <div className="mt-3 space-y-1.5 pl-3">
          {[
            { name: "aarav", tag: "Host · speaking", active: true },
            { name: "nyx", tag: "Listening", active: true },
            { name: "kira", tag: "Chilling", active: false },
          ].map((m) => (
            <div key={m.name} className="flex items-center gap-2.5 py-1">
              <span
                className={`relative size-5 shrink-0 overflow-hidden rounded-full ring-1 ${
                  m.active ? "ring-brand-300/55" : "ring-white/10"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatarSrc}
                  alt=""
                  width={20}
                  height={20}
                  className="size-full bg-black object-cover"
                />
              </span>
              <span className="text-[12.5px] text-zinc-200">{m.name}</span>
              <span className="ml-auto text-[11px] text-zinc-500">{m.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tap-to-test room controls */}
      <div className="relative mt-4">
        <p className="mb-2.5 flex items-center justify-between px-1 text-[11.5px] text-zinc-400">
          <span>Tap to try room controls</span>
          <span className="inline-flex items-center gap-1 text-emerald-300">
            <CheckIcon className="size-3" />
            {locked
              ? "Invite-only"
              : hidden
                ? "Hidden room"
                : "Auto-deletes when empty"}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setLocked((v) => !v)}
            className={`rounded-full border py-2.5 text-center text-[12px] font-medium transition-all duration-300 ease-smooth active:scale-95 ${
              locked
                ? "border-brand-300/60 bg-brand-400 font-semibold text-brand-ink shadow-[0_8px_24px_-8px_rgb(var(--brand-400)/0.75)]"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-brand-400/30 hover:text-white"
            }`}
          >
            {locked ? "Locked" : "Lock"}
          </button>
          <button
            type="button"
            onClick={() => setHidden((v) => !v)}
            className={`rounded-full border py-2.5 text-center text-[12px] font-medium transition-all duration-300 ease-smooth active:scale-95 ${
              hidden
                ? "border-brand-300/60 bg-brand-400 font-semibold text-brand-ink shadow-[0_8px_24px_-8px_rgb(var(--brand-400)/0.75)]"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-brand-400/30 hover:text-white"
            }`}
          >
            {hidden ? "Hidden" : "Hide"}
          </button>
          <button
            type="button"
            onClick={() => setLimitIdx((i) => (i + 1) % LIMITS.length)}
            className={`rounded-full border py-2.5 text-center text-[12px] font-medium transition-all duration-300 ease-smooth active:scale-95 ${
              limit > 0
                ? "border-brand-300/60 bg-brand-400 font-semibold text-brand-ink shadow-[0_8px_24px_-8px_rgb(var(--brand-400)/0.75)]"
                : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-brand-400/30 hover:text-white"
            }`}
          >
            Limit {limit === 0 ? "∞" : limit}
          </button>
          <button
            type="button"
            onClick={() => setBitrateIdx((i) => (i + 1) % BITRATES.length)}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] py-2.5 text-center text-[12px] font-medium text-zinc-200 transition-all duration-300 ease-smooth hover:border-brand-400/30 hover:text-white active:scale-95"
          >
            {bitrate}k Audio
          </button>
        </div>
      </div>
    </SpotlightCard>
  );
}

export function VoiceMaster() {
  return (
    <section id="voicemaster" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,456px)] lg:items-center lg:gap-16">
          <div>
            <Reveal>
              <p className="eyebrow">Temporary Voice</p>
              <h2 className="mt-5 max-w-xl font-display text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[46px]">
                Cozy personal rooms with{" "}
                <span className="text-gradient-brand">VoiceMaster.</span>
              </h2>
              <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-zinc-400">
                Members hop into one channel and instantly get their own room to
                lock, rename, or share with friends — then it cleans itself up
                the moment everyone leaves.
              </p>
            </Reveal>

            <div className="mt-8 space-y-3">
              {voiceCards.map((c, i) => (
                <Reveal key={c.kicker} delay={i * 75}>
                  <SpotlightCard className="group flex gap-4 rounded-[24px] p-5 transition-transform duration-500 ease-smooth hover:-translate-y-0.5">
                    <span className="relative mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-2xl border border-brand-400/25 bg-brand-400/[0.09] text-[12px] font-semibold text-brand-200">
                      0{i + 1}
                    </span>
                    <div className="relative">
                      <h3 className="font-display text-[16px] font-semibold tracking-tight text-white">
                        {c.kicker}
                      </h3>
                      <p className="mt-1 text-[13.5px] leading-relaxed text-zinc-400">
                        {c.title}
                      </p>
                    </div>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>

            <Reveal delay={180} className="mt-7">
              <Link
                href={site.dashboard}
                className="group inline-flex items-center gap-2 text-[14px] font-medium text-brand-300 transition-colors duration-300 hover:text-brand-100"
              >
                Customize VoiceMaster in the dashboard
                <ArrowRight className="size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>

          <Reveal delay={110} className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-full blur-3xl"
              style={{
                background:
                  "radial-gradient(closest-side, rgb(var(--brand-400) / 0.16), transparent)",
              }}
            />
            <InteractiveVoiceDeck />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
