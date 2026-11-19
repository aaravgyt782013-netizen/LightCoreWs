"use client";

import Link from "next/link";
import { InviteButton } from "@/components/ui/InviteButton";
import { Reveal } from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { ArrowRight, SparklesIcon } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { site } from "@/lib/site";

export function CtaSection() {
  const { config } = useSiteConfig();
  const brandName = config.brandName || site.name;

  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <SpotlightCard className="overflow-hidden rounded-[32px] border-brand-500/32 px-6 py-16 text-center shadow-[0_40px_110px_-40px_rgba(0,0,0,0.98),0_0_90px_-34px_rgb(var(--brand-600)/0.6)] sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-12 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(62% 82% at 50% 0%, rgb(var(--brand-600) / 0.3), rgb(var(--brand-900) / 0.1) 52%, transparent 76%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.42] [mask-image:radial-gradient(ellipse_at_50%_38%,#000,transparent_70%)]"
            />

            <div className="relative mx-auto max-w-2xl">
              <div className="relative mx-auto flex size-20 items-center justify-center">
                <span
                  aria-hidden
                  className="absolute inset-0 animate-pulse-ring rounded-3xl border border-brand-500/50"
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={config.logoUrl || site.logo}
                  alt={`${brandName} logo`}
                  width={72}
                  height={72}
                  className="relative size-[72px] rounded-2xl object-cover ring-1 ring-brand-400/50 shadow-[0_0_50px_-4px_rgb(var(--brand-500)/0.8)]"
                />
              </div>

              <h2 className="mt-7 font-display text-[32px] font-bold leading-[1.04] tracking-tight text-white sm:text-[52px]">
                Arm your Discord server
                <br className="hidden sm:block" /> in under{" "}
                <span className="text-gradient-brand">30 seconds.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-balance text-[15px] leading-relaxed text-zinc-300 sm:text-[16px]">
                Deploy {brandName}&apos;s 14-rule Anti-Nuke, AutoMod, VoiceMaster,
                Tickets, Verification, and Embed Studio for free — or test every
                module first in our zero-login sandbox.
              </p>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
                <InviteButton size="lg" />
                <Link
                  href={site.demo}
                  className="group inline-flex h-[52px] items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.05] px-7 text-[14.5px] font-semibold text-zinc-100 shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/55 hover:bg-brand-500/[0.14] hover:text-white active:scale-[0.98]"
                >
                  <SparklesIcon className="size-4 text-brand-400" />
                  Try Live Demo
                  <ArrowRight className="size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1" />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                <Link href="/docs" className="hover:text-white">
                  68+ Commands
                </Link>
                <span className="text-zinc-700">·</span>
                <Link href="/security" className="hover:text-white">
                  Read-Only OAuth 2.0
                </Link>
                <span className="text-zinc-700">·</span>
                <Link href="/status" className="hover:text-white">
                  Live System Status
                </Link>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}
