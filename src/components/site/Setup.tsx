"use client";

import Link from "next/link";
import { useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import {
  ArrowRight,
  CheckIcon,
  CopyIcon,
  ShieldIcon,
} from "@/components/ui/Icons";

export function Setup() {
  const { config } = useSiteConfig();
  const [copied, setCopied] = useState(false);
  const cmd = `${config.prefix || "."}antinuke enable`;

  const copyCmd = async () => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <section id="setup" className="relative py-24 sm:py-32">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Simple Setup</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[46px]">
              Up and running in{" "}
              <span className="text-gradient-brand">under a minute.</span>
            </h2>
            <p className="mt-4 max-w-lg text-[15.5px] leading-relaxed text-zinc-400">
              Three calm, straightforward steps — no coding, no messy setup
              channels, and sensible defaults right out of the box.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3.5 rounded-full border border-brand-400/22 bg-ink-900/75 px-5 py-3 shadow-[inset_0_1px_0_rgb(255_250_230/0.06)] backdrop-blur-xl">
            <span className="font-display text-[26px] font-bold tabular-nums leading-none text-white">
              30<span className="text-brand-400">s</span>
            </span>
            <span className="h-6 w-px bg-white/10" />
            <span className="text-[12px] leading-tight text-zinc-400">
              Average setup time
            </span>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* Step 1 */}
          <Reveal delay={0}>
            <SpotlightCard className="flex h-full flex-col justify-between rounded-[28px] p-6 transition-transform duration-500 ease-smooth hover:-translate-y-1 sm:p-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-brand-400/28 bg-brand-400/[0.1] font-display text-[14px] font-bold text-brand-200">
                    01
                  </span>
                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400">
                    Invite
                  </span>
                </div>
                <h3 className="mt-6 font-display text-[20px] font-semibold tracking-tight text-white">
                  Add LightCore to your server
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                  Authorize via Discord&apos;s official bot invite screen and
                  place the LightCore role near the top of your role list.
                </p>
              </div>
              <ul className="mt-6 space-y-2.5 border-t border-white/[0.06] pt-5">
                {[
                  "Official Discord OAuth 2.0 invite",
                  "Slash + prefix commands ready instantly",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-[12.5px] text-zinc-300">
                    <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-400/15 text-brand-300">
                      <CheckIcon className="size-2.5" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </Reveal>

          {/* Step 2 */}
          <Reveal delay={90}>
            <SpotlightCard className="flex h-full flex-col justify-between rounded-[28px] p-6 transition-transform duration-500 ease-smooth hover:-translate-y-1 sm:p-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-brand-400/28 bg-brand-400/[0.1] font-display text-[14px] font-bold text-brand-200">
                    02
                  </span>
                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400">
                    Enable
                  </span>
                </div>
                <h3 className="mt-6 font-display text-[20px] font-semibold tracking-tight text-white">
                  Flip on your favorite modules
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                  Choose a one-click preset inside the web dashboard or paste a
                  single command right inside your server.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void copyCmd()}
                className="mt-6 flex w-full items-center gap-2.5 rounded-full border border-brand-400/22 bg-black/55 py-2.5 pl-4 pr-3 text-left transition-all duration-300 ease-smooth hover:border-brand-300/45 active:scale-[0.99]"
              >
                <code className="font-mono text-[12.5px] font-medium text-brand-200">
                  {cmd}
                </code>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-[10.5px] font-medium text-zinc-300">
                  {copied ? (
                    <>
                      <CheckIcon className="size-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <CopyIcon className="size-3" />
                      Copy
                    </>
                  )}
                </span>
              </button>
            </SpotlightCard>
          </Reveal>

          {/* Step 3 */}
          <Reveal delay={180}>
            <SpotlightCard className="flex h-full flex-col justify-between rounded-[28px] p-6 transition-transform duration-500 ease-smooth hover:-translate-y-1 sm:p-7">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex size-10 items-center justify-center rounded-2xl border border-brand-400/28 bg-brand-400/[0.1] font-display text-[14px] font-bold text-brand-200">
                    03
                  </span>
                  <span className="rounded-full bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-zinc-400">
                    Relax
                  </span>
                </div>
                <h3 className="mt-6 font-display text-[20px] font-semibold tracking-tight text-white">
                  Enjoy a calmer, brighter server
                </h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-zinc-400">
                  LightCore handles raids, spam, voice rooms, tickets, and
                  welcome messages automatically while you focus on your people.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-2 border-t border-white/[0.06] pt-5">
                {["Auto-Protect", "Clean Chat", "Voice Rooms", "Help Tickets"].map(
                  (tag) => (
                    <div
                      key={tag}
                      className="rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-center text-[12px] font-medium text-zinc-300"
                    >
                      {tag}
                    </div>
                  ),
                )}
              </div>
            </SpotlightCard>
          </Reveal>
        </div>

        {/* Gentle, transparent privacy & OAuth2 reassurance */}
        <Reveal delay={140} className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/[0.065] bg-ink-900/60 px-6 py-4 backdrop-blur-xl">
            <p className="flex flex-wrap items-center gap-2 text-[13.5px] text-zinc-300">
              <ShieldIcon className="size-4 shrink-0 text-emerald-400" />
              <span>
                <strong className="font-semibold text-white">
                  Privacy-first by design:
                </strong>{" "}
                sign-in uses read-only Discord{" "}
                <code className="font-mono text-brand-200">identify</code> &amp;{" "}
                <code className="font-mono text-brand-200">guilds</code> scopes
                only — never joins servers on your behalf.
              </span>
            </p>
            <Link
              href="/security"
              className="group inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-300 transition-colors hover:text-brand-100"
            >
              Security details
              <ArrowRight className="size-3.5 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
