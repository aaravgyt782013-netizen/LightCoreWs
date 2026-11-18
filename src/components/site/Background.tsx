export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      {/* Volumetric overhead crimson cathedral aura */}
      <div
        className="animate-aurora absolute -top-52 left-1/2 h-[680px] w-[1280px] rounded-full will-change-transform"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.26), rgb(var(--brand-800) / 0.1) 46%, transparent 74%)",
        }}
      />

      {/* Focused hot crimson horizon crown */}
      <div
        className="absolute -top-24 left-1/2 h-[220px] w-[620px] -translate-x-1/2 rounded-full blur-2xl"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-500) / 0.22), transparent 72%)",
        }}
      />

      {/* Deep side ambient ruby smoke */}
      <div
        className="absolute -left-72 top-[38%] h-[600px] w-[600px] rounded-full"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-700) / 0.11), transparent 72%)",
        }}
      />
      <div
        className="absolute -right-72 top-[68%] h-[640px] w-[640px] rounded-full"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.1), transparent 72%)",
        }}
      />

      {/* Razor-clean architectural micro-grid */}
      <div className="absolute inset-0 bg-grid-fade bg-grid [mask-image:radial-gradient(ellipse_78%_58%_at_50%_18%,#000_25%,transparent_84%)]" />

      {/* Deep OLED vignette + subtle film texture */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 85% at 50% 45%, transparent 52%, rgb(0 0 0 / 0.55) 100%)",
        }}
      />
      <div className="grain absolute inset-0 opacity-[0.14] mix-blend-overlay" />
    </div>
  );
}
