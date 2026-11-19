import { marqueeRowOne, marqueeRowTwo } from "@/lib/site";

export function ModuleMarquee() {
  const rowA = [...marqueeRowOne, ...marqueeRowOne];
  const rowB = [...marqueeRowTwo, ...marqueeRowTwo];

  return (
    <section
      aria-label="LightCore modules"
      className="relative overflow-hidden border-y border-white/[0.055] bg-ink-900/30 py-7 backdrop-blur-sm"
    >
      <div className="marquee-mask mask-fade-x space-y-3 overflow-hidden">
        <div className="marquee-track animate-marquee gap-3">
          {rowA.map((item, idx) => (
            <div
              key={`a-${item.name}-${idx}`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.065] bg-ink-900/75 px-4 py-2 transition-all duration-300 ease-smooth hover:border-brand-400/30 hover:bg-ink-850/90"
            >
              <span className="rounded-full border border-brand-400/22 bg-brand-400/[0.08] px-2.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em] text-brand-200">
                {item.tag}
              </span>
              <span className="text-[13px] font-medium text-zinc-200">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <div className="marquee-track animate-marquee-reverse gap-3">
          {rowB.map((item, idx) => (
            <div
              key={`b-${item.name}-${idx}`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.06] bg-ink-900/65 px-4 py-2 transition-all duration-300 ease-smooth hover:border-brand-400/25 hover:bg-ink-850/85"
            >
              <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[9.5px] font-medium uppercase tracking-[0.14em] text-zinc-400">
                {item.tag}
              </span>
              <span className="text-[13px] font-medium text-zinc-300">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
