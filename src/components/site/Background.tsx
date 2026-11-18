export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      {/* primary overhead crimson cathedral spotlight */}
      <div
        className="absolute -top-[30vh] left-1/2 h-[82vh] w-[130vw] max-w-[1680px] -translate-x-1/2 rounded-full blur-3xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.22), rgb(var(--brand-500) / 0.075) 45%, transparent 76%)",
        }}
      />
      {/* crisp upper center halo highlight */}
      <div
        className="absolute -top-[10vh] left-1/2 h-[38vh] w-[62vw] max-w-[820px] -translate-x-1/2 rounded-full blur-2xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-500) / 0.14), transparent 72%)",
        }}
      />
      {/* dramatic right-wing ruby glow */}
      <div
        className="absolute right-[-18vw] top-[26vh] h-[64vh] w-[56vw] max-w-[800px] rounded-full blur-3xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-700) / 0.12), transparent 72%)",
        }}
      />
      {/* subtle lower-left ember reflection */}
      <div
        className="absolute bottom-[-20vh] left-[-14vw] h-[56vh] w-[52vw] max-w-[740px] rounded-full blur-3xl transition-opacity duration-500"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-800) / 0.12), transparent 72%)",
        }}
      />
      {/* precision architectural micro-grid fading into pure obsidian */}
      <div
        className="absolute inset-0 bg-grid-fade bg-grid"
        style={{
          maskImage:
            "radial-gradient(82% 58% at 50% 16%, #000 0%, rgba(0,0,0,0.38) 58%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(82% 58% at 50% 16%, #000 0%, rgba(0,0,0,0.38) 58%, transparent 100%)",
        }}
      />
      {/* ultra-fine cinema film grain */}
      <div className="grain absolute inset-0 opacity-[0.038] mix-blend-overlay" />
    </div>
  );
}
