"use client";

import Link from "next/link";
import { useState } from "react";
import { faqs, site } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import { ArrowRight, DiscordIcon, SearchIcon } from "@/components/ui/Icons";

export function Faq() {
  const { config } = useSiteConfig();
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-32">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <p className="eyebrow">Questions</p>
            <h2 className="mt-5 font-display text-[32px] font-bold leading-[1.08] tracking-[-0.02em] text-white sm:text-[44px]">
              Good to know{" "}
              <span className="text-gradient-brand">before you start.</span>
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-zinc-400">
              Quick answers about setup, permissions, privacy, and running
              LightCore in your community.
            </p>

            <div className="mt-8 rounded-[26px] border border-white/[0.065] bg-ink-900/65 p-5 backdrop-blur-xl">
              <p className="font-display text-[15px] font-semibold text-white">
                Still curious about something?
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-zinc-400">
                Search all 68+ commands instantly or hop into our friendly
                support server anytime.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2.5">
                <a
                  href={config.supportUrl || site.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-soft inline-flex h-10 items-center gap-2 px-4 text-[12.5px] font-medium"
                >
                  <DiscordIcon className="size-4 text-brand-300" />
                  Support Server
                </a>
                <button
                  type="button"
                  onClick={openCommandPalette}
                  className="inline-flex h-10 items-center gap-2 rounded-full border border-white/[0.075] bg-white/[0.025] px-4 text-[12.5px] font-medium text-zinc-300 transition-all duration-300 ease-smooth hover:border-brand-400/30 hover:text-white"
                >
                  <SearchIcon className="size-3.5 text-brand-300" />
                  Search
                  <kbd className="font-mono text-[10px] text-zinc-500">⌘K</kbd>
                </button>
              </div>
              <Link
                href="/docs"
                className="group mt-4 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-brand-300 transition-colors hover:text-brand-100"
              >
                Read full command guide
                <ArrowRight className="size-3.5 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>

          <div className="space-y-3">
            {faqs.map((f, i) => {
              const isOpen = openIdx === i;
              return (
                <Reveal key={f.q} delay={i * 55}>
                  <div
                    className={`overflow-hidden rounded-[24px] border transition-all duration-500 ease-smooth ${
                      isOpen
                        ? "border-brand-400/30 bg-gradient-to-b from-brand-400/[0.07] to-ink-900/90 shadow-[0_24px_60px_-34px_rgb(var(--brand-400)/0.38)]"
                        : "border-white/[0.065] bg-ink-900/50 hover:border-white/[0.12] hover:bg-ink-900/75"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-display text-[15.5px] font-semibold leading-snug tracking-tight text-zinc-100 sm:text-[16.5px]">
                        {f.q}
                      </span>
                      <span
                        className={`relative flex size-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ease-smooth ${
                          isOpen
                            ? "border-brand-300/45 bg-brand-400/20 text-brand-200"
                            : "border-white/[0.1] bg-white/[0.03] text-zinc-400"
                        }`}
                      >
                        <span className="absolute h-[1.5px] w-2.5 rounded-full bg-current" />
                        <span
                          className={`absolute h-2.5 w-[1.5px] rounded-full bg-current transition-transform duration-300 ease-smooth ${
                            isOpen ? "rotate-90 opacity-0" : "rotate-0 opacity-100"
                          }`}
                        />
                      </span>
                    </button>

                    <div
                      className="grid transition-[grid-template-rows,opacity] duration-500 ease-smooth"
                      style={{
                        gridTemplateRows: isOpen ? "1fr" : "0fr",
                        opacity: isOpen ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p className="px-6 pb-5 pr-10 text-[14px] leading-[1.75] text-zinc-400">
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
