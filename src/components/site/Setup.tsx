"use client";

import { useState } from "react";
import { setupSteps } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { CheckIcon, CopyIcon } from "@/components/ui/Icons";

type Quadrant = { title: string; copy: string };

export function Setup() {
  const { config } = useSiteConfig();
  const [copied, setCopied] = useState(false);

  const copyCmd = async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <section id="setup" className="relative py-22 sm:py-28">
      <div className="container-x">
        <Reveal className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="eyebrow">Deployment</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.06] tracking-tight text-white sm:text-[48px]">
              Zero-Config <span className="text-gradient-brand">Setup</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-zinc-400">
              Enterprise-grade protection armed across your entire guild in
              under 30 seconds.
            </p>
          </div>
          <div className="inline-flex w-fit items-center gap-3.5 rounded-2xl border border-brand-500/25 bg-ink-900/80 px-5 py-3.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_0_40px_-18px_rgb(var(--brand-500)/0.55)] backdrop-blur-xl">
            <span className="font-display text-[30px] font-bold tabular-nums leading-none text-white">
              30<span className="text-brand-500">s</span>
            </span>
            <span className="h-8 w-px bg-white/10" />
            <span className="font-mono text-[9.5px] uppercase leading-tight tracking-[0.22em] text-zinc-400">
              average
              <br />
              deployment
            </span>
          </div>
        </Reveal>

        <div className="relative mt-12 grid gap-5 lg:grid-cols-3">
          {setupSteps.map((s, i) => {
            const cmd =
              "command" in s && s.command
                ? s.command.replace(/^\S?(?=[a-z])/, config.prefix || ".")
                : null;
            return (
              <Reveal key={s.step} delay={i * 95}>
                <SpotlightCard className="group flex h-full flex-col overflow-hidden rounded-[24px] p-6 transition-transform duration-300 ease-smooth hover:-translate-y-1 sm:p-7">
                  <div className="relative flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl border border-brand-500/35 bg-brand-950/55 font-display text-[14px] font-bold tracking-wider text-brand-300 shadow-[0_0_24px_-8px_rgb(var(--brand-500)/0.75)] transition-transform duration-300 ease-smooth group-hover:scale-105">
                      {s.step}
                    </span>
                    <span className="rounded-full border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-400">
                      {s.phase}
                    </span>
                  </div>

                  <h3 className="relative mt-6 font-display text-[20px] font-bold tracking-tight text-white">
                    {s.title}
                  </h3>
                  <p className="relative mt-2.5 text-[13.5px] leading-relaxed text-zinc-400">
                    {s.copy}
                  </p>

                  {cmd && (
                    <button
                      type="button"
                      onClick={() => void copyCmd(cmd)}
                      className="relative mt-5 flex w-full items-center gap-2.5 rounded-xl border border-brand-500/25 bg-black/70 px-3.5 py-2.5 text-left transition-all duration-200 hover:border-brand-500/55 active:scale-[0.99]"
                    >
                      <span className="font-mono text-[10.5px] font-bold text-brand-500">
                        &gt;
                      </span>
                      <code className="font-mono text-[12px] font-medium text-brand-200">
                        {cmd}
                      </code>
                      <span className="ml-auto inline-flex items-center gap-1 font-mono text-[9px] uppercase text-zinc-400">
                        {copied ? (
                          <>
                            <CheckIcon className="size-3 text-emerald-400" />
                            copied
                          </>
                        ) : (
                          <CopyIcon className="size-3" />
                        )}
                      </span>
                    </button>
                  )}

                  {"bullets" in s && s.bullets && (
                    <ul className="relative mt-5 space-y-2.5">
                      {s.bullets.map((b: string) => (
                        <li key={b} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-400">
                            <CheckIcon className="size-2.5" />
                          </span>
                          <span className="text-[12.5px] leading-snug text-zinc-300">
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {"quadrants" in s && s.quadrants && (
                    <div className="relative mt-5 grid grid-cols-2 gap-2.5">
                      {(s.quadrants as readonly Quadrant[]).map((q) => (
                        <div
                          key={q.title}
                          className="rounded-xl border border-white/[0.07] bg-black/45 p-3 transition-colors duration-200 hover:border-brand-500/35"
                        >
                          <p className="text-[12px] font-semibold text-zinc-100">
                            {q.title}
                          </p>
                          <p className="mt-1 text-[10.5px] leading-snug text-zinc-500">
                            {q.copy}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
