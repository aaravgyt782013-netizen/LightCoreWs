export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      {/* Primary top aqua aurora */}
      <div className="absolute left-1/2 top-[-18rem] h-[44rem] w-[78rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(6,182,212,0.22),rgba(34,211,238,0.06)_52%,transparent_76%)] blur-2xl" />
      {/* Secondary subtle oceanic glow */}
      <div className="absolute -right-40 top-[38%] h-[32rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(14,165,233,0.08),transparent_72%)] blur-3xl" />
      {/* Crisp cyan grid */}
      <div className="absolute inset-0 bg-grid-fade bg-grid opacity-[0.6] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_12%,transparent_74%)]" />
      {/* Fine film grain */}
      <div className="grain absolute inset-0 opacity-[0.03] mix-blend-soft-light" />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_38%,rgba(2,6,12,0.62)_100%)]" />
    </div>
  );
}
