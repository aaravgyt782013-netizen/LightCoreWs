export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950"
    >
      {/* Silky overhead solar-gold aurora cloud — ultra-wide feathered falloff */}
      <div
        className="animate-aurora absolute -top-64 left-1/2 h-[780px] w-[1440px] rounded-full will-change-transform"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-400) / 0.17) 0%, rgb(var(--brand-600) / 0.08) 44%, rgb(var(--brand-900) / 0.03) 68%, transparent 86%)",
        }}
      />

      {/* Soft sunlit golden crown behind navbar & hero */}
      <div
        className="absolute -top-32 left-1/2 h-[300px] w-[760px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-300) / 0.14), rgb(var(--brand-500) / 0.05) 55%, transparent 82%)",
        }}
      />

      {/* Whisper-soft diagonal golden silk ribbon (echoes the LightCore emblem backdrop) */}
      <div
        className="absolute -left-1/4 top-[8%] h-[540px] w-[150%] -rotate-[14deg] blur-3xl"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "linear-gradient(90deg, transparent 8%, rgb(var(--brand-500) / 0.045) 34%, rgb(var(--brand-300) / 0.06) 52%, rgb(var(--brand-600) / 0.04) 70%, transparent 92%)",
        }}
      />

      {/* Warm velvet honey drift on sides for organic depth */}
      <div
        className="absolute -left-80 top-[36%] h-[720px] w-[720px] rounded-full blur-2xl"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-500) / 0.075), transparent 76%)",
        }}
      />
      <div
        className="absolute -right-80 top-[64%] h-[760px] w-[760px] rounded-full blur-2xl"
        style={{
          opacity: "var(--glow-scale, 1)",
          background:
            "radial-gradient(closest-side, rgb(var(--brand-400) / 0.07), transparent 78%)",
        }}
      />

      {/* Optional ultra-soft architectural grid (off by default, toggleable in /admin) */}
      <div className="absolute inset-0 bg-grid-fade bg-grid [mask-image:radial-gradient(ellipse_72%_52%_at_50%_18%,#000_18%,transparent_80%)]" />

      {/* Plush velvet vignette + whisper film grain to eliminate gradient banding */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 105% 90% at 50% 42%, transparent 56%, rgb(0 0 0 / 0.5) 100%)",
        }}
      />
      <div className="grain absolute inset-0 opacity-[0.09] mix-blend-overlay" />
    </div>
  );
}
