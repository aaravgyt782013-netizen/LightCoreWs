"use client";

import Link from "next/link";
import { InviteButton } from "@/components/ui/InviteButton";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { site } from "@/lib/site";

export function CtaSection() {
  const { config } = useSiteConfig();
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[28px] border border-brand-500/25 bg-ink-900 px-6 py-14 text-center shadow-[0_36px_100px_-40px_rgba(0,0,0,0.98),0_0_80px_-34px_rgb(var(--brand-600)/0.55),inset_0_1px_0_rgba(255,255,255,0.08)] sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-500 to-transparent"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(64% 84% at 50% 0%, rgb(var(--brand-600) / 0.28), rgb(var(--brand-800) / 0.08) 50%, transparent 74%)",
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.42] [mask-image:radial-gradient(ellipse_at_50%_40%,#000,transparent_70%)]"
            />
            <div className="relative mx-auto max-w-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.logoUrl || site.logo}
                alt={`${config.brandName || site.name} logo`}
                width={68}
                height={68}
                className="mx-auto size-[68px] rounded-2xl object-cover ring-1 ring-brand-500/45 shadow-[0_0_44px_-4px_rgb(var(--brand-500)/0.7)]"
              />
              <h2 className="mt-7 font-display text-[30px] font-bold leading-[1.05] tracking-tight text-white sm:text-[48px]">
                Lock your server down
                <br className="hidden sm:block" /> in under{" "}
                <span className="text-gradient-brand">30 seconds</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-balance text-[15px] leading-relaxed text-zinc-300">
                Join thousands of communities protected 24/7 against nukes,
                raids, and rogue moderators by {config.brandName || site.name}.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <InviteButton size="lg" />
                <Link
                  href={site.dashboard}
                  className="group inline-flex h-[52px] items-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 text-[15px] font-medium text-zinc-100 backdrop-blur-md transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/45 hover:bg-brand-500/[0.1] hover:text-white"
                >
                  Open Dashboard
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </Link>
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-500">
                instant setup · live web dashboard · 26 armed guard modules
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
