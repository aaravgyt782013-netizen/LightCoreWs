import { marqueeRowOne, marqueeRowTwo } from "@/lib/site";

export function ModuleMarquee() {
  const rowA = [...marqueeRowOne, ...marqueeRowOne];
  const rowB = [...marqueeRowTwo, ...marqueeRowTwo];

  return (
    <section
      aria-label="LightCore capability stream"
      className="relative overflow-hidden border-y border-white/[0.065] bg-ink-900/35 py-6 backdrop-blur-sm"
    >
      <div className="marquee-mask mask-fade-x space-y-2.5 overflow-hidden">
        <div
          style={{ ["--marquee-duration" as string]: "42s" }}
          className="marquee-track animate-marquee gap-2.5"
        >
          {rowA.map((item, idx) => (
            <div
              key={`a-${item.name}-${idx}`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.075] bg-ink-950/85 px-4 py-2 transition-colors hover:border-brand-500/40"
            >
              <span className="rounded-full border border-brand-500/35 bg-brand-950/60 px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.2em] text-brand-300">
                {item.tag}
              </span>
              <span className="text-[12.5px] font-medium text-zinc-200">
                {item.name}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{ ["--marquee-duration" as string]: "48s" }}
          className="marquee-track animate-marquee-reverse gap-2.5"
        >
          {rowB.map((item, idx) => (
            <div
              key={`b-${item.name}-${idx}`}
              className="inline-flex shrink-0 items-center gap-2.5 rounded-full border border-white/[0.075] bg-ink-950/85 px-4 py-2 transition-colors hover:border-brand-500/40"
            >
              <span className="rounded-full border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 font-mono text-[8.5px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                {item.tag}
              </span>
              <span className="text-[12.5px] font-medium text-zinc-300">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
