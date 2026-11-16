export function PageBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-ink-950" />
      {/* top ember glow */}
      <div className="absolute left-1/2 top-[-18rem] h-[42rem] w-[72rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(239,16,16,0.20),rgba(239,16,16,0.04)_55%,transparent_75%)] blur-2xl" />
      {/* grid */}
      <div className="absolute inset-0 bg-grid-fade bg-grid opacity-[0.55] [mask-image:radial-gradient(ellipse_at_50%_0%,#000_10%,transparent_72%)]" />
      {/* noise */}
      <div className="grain absolute inset-0 opacity-[0.035] mix-blend-soft-light" />
      {/* vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_35%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
