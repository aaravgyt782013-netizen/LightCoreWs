"use client";

import { useState } from "react";
import { faqs, modules } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export function Faq() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-22 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,390px)_minmax(0,1fr)]">
          <Reveal>
            <p className="eyebrow">FAQ</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.06] tracking-tight text-white sm:text-[46px]">
              Before you <span className="text-gradient-brand">deploy</span>
            </h2>
            <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed text-zinc-400">
              Everything server owners ask before arming {modules.length}{" "}
              automated security modules across their guild.
            </p>

            <div className="mt-8 rounded-2xl border border-white/[0.075] bg-ink-900/70 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-zinc-500">
                  module manifest
                </p>
                <span className="font-mono text-[9px] text-brand-400">
                  {modules.length} active
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {modules.map((m) => (
                  <span
                    key={m}
                    className="rounded-md border border-white/[0.065] bg-black/45 px-2 py-0.5 font-mono text-[9.5px] text-zinc-400 transition-all duration-200 hover:border-brand-500/40 hover:bg-brand-950/45 hover:text-brand-200"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openIdx === i;
              return (
                <Reveal key={f.q} delay={i * 55}>
                  <div
                    className={`overflow-hidden rounded-2xl border transition-all duration-300 ease-smooth ${
                      isOpen
                        ? "border-brand-500/40 bg-gradient-to-b from-brand-950/35 to-ink-900/90 shadow-[0_20px_50px_-30px_rgb(var(--brand-500)/0.65)]"
                        : "border-white/[0.075] bg-ink-900/55 hover:border-white/[0.15] hover:bg-ink-900/80"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4.5 py-[18px] text-left"
                    >
                      <span className="flex items-start gap-3.5">
                        <span
                          className={`mt-0.5 font-mono text-[10px] transition-colors ${
                            isOpen ? "text-brand-400" : "text-zinc-600"
                          }`}
                        >
                          0{i + 1}
                        </span>
                        <span className="font-display text-[15.5px] font-semibold leading-snug tracking-tight text-zinc-100 sm:text-[16.5px]">
                          {f.q}
                        </span>
                      </span>
                      <span
                        className={`relative flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-smooth ${
                          isOpen
                            ? "border-brand-500/60 bg-brand-600/20 text-brand-300"
                            : "border-white/12 bg-black/40 text-zinc-300"
                        }`}
                      >
                        <span className="absolute h-[1.5px] w-2.5 rounded bg-current" />
                        <span
                          className={`absolute h-2.5 w-[1.5px] rounded bg-current transition-transform duration-300 ease-smooth ${
                            isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                          }`}
                        />
                      </span>
                    </button>

                    <div
                      className="grid transition-[grid-template-rows,opacity] duration-300 ease-smooth"
                      style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 pl-[46px] pr-8 text-[13.5px] leading-[1.7] text-zinc-400">
                          {f.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
