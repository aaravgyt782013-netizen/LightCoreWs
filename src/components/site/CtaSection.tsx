import Image from "next/image";
import { InviteButton } from "@/components/ui/InviteButton";
import { Reveal } from "@/components/ui/Reveal";
import { ArrowRight } from "@/components/ui/Icons";
import { site } from "@/lib/site";

export function CtaSection() {
  return (
    <section className="relative py-20 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="relative overflow-hidden rounded-[26px] border border-cyan-200/12 bg-ink-900 px-6 py-14 text-center shadow-panel sm:px-12 sm:py-20">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(62%_82%_at_50%_0%,rgba(6,182,212,0.24),transparent_72%)]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-grid-fade bg-grid opacity-[0.4] [mask-image:radial-gradient(ellipse_at_50%_40%,#000,transparent_70%)]"
            />
            <div className="relative mx-auto max-w-2xl">
              <Image
                src={site.logo}
                alt={`${site.name} logo`}
                width={64}
                height={64}
                unoptimized
                className="mx-auto size-16 rounded-2xl object-cover ring-1 ring-brand-400/30 drop-shadow-[0_0_28px_rgba(34,211,238,0.55)]"
              />
              <h2 className="mt-7 font-display text-[30px] font-semibold leading-[1.05] tracking-tight text-white sm:text-[46px]">
                Lock your server down
                <br className="hidden sm:block" /> in under 30 seconds
              </h2>
              <p className="mx-auto mt-4 max-w-md text-balance text-[14.5px] leading-relaxed text-zinc-400">
                Join 2,400+ communities that stopped worrying about nukes,
                raids and rogue moderators.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <InviteButton size="lg" />
                <a
                  href={site.dashboard}
                  className="group inline-flex h-[52px] items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-6 text-[15px] font-medium text-zinc-200 transition-colors hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
                >
                  Open Dashboard
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
              <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-600">
                no credit card · no config files · free tier
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
