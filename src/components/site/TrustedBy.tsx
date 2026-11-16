import Image from "next/image";
import { partners, type Partner } from "@/lib/site";
import { VerifiedIcon } from "@/components/ui/Icons";
import { Reveal } from "@/components/ui/Reveal";

function iconUrl(icon: string, size = 128) {
  return `https://cdn.discordapp.com/icons/${icon}?size=${size}`;
}

function PartnerCard({ p }: { p: Partner }) {
  const label = p.short ?? p.name;
  return (
    <div className="group relative flex h-[62px] w-[268px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] px-3 transition-colors duration-300 hover:border-white/[0.14] hover:bg-white/[0.04]">
      <div className="relative size-9 shrink-0 overflow-hidden rounded-full ring-1 ring-white/10">
        <Image
          src={iconUrl(p.icon)}
          alt=""
          width={36}
          height={36}
          unoptimized
          className="size-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <p className="truncate text-[12.5px] font-medium text-zinc-200">
            {label}
          </p>
          {p.verified && (
            <VerifiedIcon className="size-3 shrink-0 text-[#5865F2]" />
          )}
        </div>
        <p className="mt-0.5 font-mono text-[10px] tracking-wide text-zinc-500">
          {p.members}
        </p>
      </div>
    </div>
  );
}

function Row({
  items,
  reverse,
  duration,
}: {
  items: Partner[];
  reverse?: boolean;
  duration: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div className="marquee-mask mask-fade-x overflow-hidden">
      <div
        className={`marquee-track gap-3 ${
          reverse ? "animate-marquee-reverse" : "animate-marquee"
        }`}
        style={{ ["--marquee-duration" as string]: duration }}
      >
        {doubled.map((p, i) => (
          <PartnerCard key={`${p.name}-${i}`} p={p} />
        ))}
      </div>
    </div>
  );
}

export function TrustedBy() {
  const half = Math.ceil(partners.length / 2);
  const rowA = partners.slice(0, half);
  const rowB = partners.slice(half);

  return (
    <section id="trusted" className="relative overflow-hidden py-20 sm:py-24">
      <div className="container-x">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Trusted by</p>
          <h2 className="mt-4 font-display text-[30px] font-semibold tracking-tight text-white sm:text-[40px]">
            Securing The Best
          </h2>
          <p className="mt-4 text-balance text-[15px] leading-relaxed text-zinc-400">
            LIGHTCORE is the security partner for Discord&apos;s fastest-growing
            communities.
          </p>
        </Reveal>
      </div>

      <div className="mt-12 space-y-3">
        <Row items={rowA} duration="62s" />
        <Row items={rowB} reverse duration="76s" />
      </div>

      <div className="container-x mt-10">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[10.5px] uppercase tracking-[0.24em] text-zinc-600">
          <span>2,400+ guilds</span>
          <span className="hidden sm:inline">·</span>
          <span>38M+ members</span>
          <span className="hidden sm:inline">·</span>
          <span>99.99% uptime</span>
          <span className="hidden sm:inline">·</span>
          <span>0 breaches</span>
        </div>
      </div>
    </section>
  );
}
