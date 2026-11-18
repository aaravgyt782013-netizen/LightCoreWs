export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* primary top ambient brand dome */}
      <div
        className="absolute -top-[28vh] left-1/2 h-[78vh] w-[125vw] max-w-[1640px] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-500) / 0.17), rgb(var(--brand-400) / 0.06) 46%, transparent 76%)",
        }}
      />
      {/* cool secondary aura on right */}
      <div
        className="absolute right-[-18vw] top-[28vh] h-[64vh] w-[58vw] max-w-[820px] rounded-full blur-3xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-400) / 0.1), transparent 72%)",
        }}
      />
      {/* subtle edge highlight on lower left */}
      <div
        className="absolute bottom-[-18vh] left-[-14vw] h-[56vh] w-[52vw] max-w-[740px] rounded-full blur-3xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.09), transparent 72%)",
        }}
      />
      {/* subtle fading architectural grid */}
      <div
        className="absolute inset-0 bg-grid-fade bg-grid"
        style={{
          maskImage:
            "radial-gradient(85% 60% at 50% 18%, #000 0%, rgba(0,0,0,0.42) 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(85% 60% at 50% 18%, #000 0%, rgba(0,0,0,0.42) 60%, transparent 100%)",
        }}
      />
      {/* ultra-subtle film grain */}
      <div className="grain absolute inset-0 opacity-[0.045] mix-blend-overlay" />
    </div>
  );
}
