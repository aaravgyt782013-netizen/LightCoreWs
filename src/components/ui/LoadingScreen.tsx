"use client";

import { useEffect, useId, useState } from "react";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";

const defaultSteps = [
  "Initializing Core...",
  "Syncing Gateway...",
  "Arming Guard Engine...",
  "Preparing Workspace...",
];

export function LoadingScreen({
  label,
  sublabel,
  fullScreen = true,
  cycle = true,
}: {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  cycle?: boolean;
}) {
  const { config } = useSiteConfig();
  const [stepIdx, setStepIdx] = useState(0);
  const gradId = useId();

  useEffect(() => {
    if (!cycle || label) return;
    const id = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % defaultSteps.length);
    }, 1500);
    return () => window.clearInterval(id);
  }, [cycle, label]);

  const activeStatus = label || config.loaderText || defaultSteps[stepIdx];
  const logoSrc = config.logoUrl || site.logo;

  return (
    <div
      role="status"
      aria-live="polite"
      className={
        fullScreen
          ? "fixed inset-x-0 top-0 z-[100] flex h-[100svh] min-h-[100svh] w-full items-center justify-center overflow-hidden bg-ink-950 px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center"
          : "relative flex min-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-brand-200/10 bg-ink-950/90 px-6 py-16 text-center"
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.28] [mask-image:radial-gradient(circle_at_50%_46%,#000,transparent_66%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--brand-500) / 0.24), rgb(var(--brand-400) / 0.06) 55%, transparent 78%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center">
        {/* Center bot logo with triple spinning luminous brand orbital lines */}
        <div className="relative flex size-[152px] shrink-0 items-center justify-center">
        <span
          aria-hidden
          className="absolute size-[110px] animate-pulse-ring rounded-full border border-brand-400/50"
        />

        <svg
          aria-hidden
          viewBox="0 0 152 152"
          className="absolute inset-0 size-full animate-spin-slow text-brand-400"
        >
          <circle
            cx="76"
            cy="76"
            r="71"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.16"
            strokeWidth="1"
          />
          <circle
            cx="76"
            cy="76"
            r="71"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeDasharray="56 92 22 92"
            opacity="0.78"
          />
        </svg>

        <svg
          aria-hidden
          viewBox="0 0 126 126"
          className="absolute size-[126px] animate-spin-orbit drop-shadow-[0_0_14px_rgb(var(--brand-400)/0.8)]"
        >
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--brand-100))" />
              <stop offset="45%" stopColor="rgb(var(--brand-400))" />
              <stop
                offset="100%"
                stopColor="rgb(var(--brand-600))"
                stopOpacity="0.06"
              />
            </linearGradient>
          </defs>
          <circle
            cx="63"
            cy="63"
            r="57"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeDasharray="124 234"
          />
          <circle cx="63" cy="6" r="3" fill="rgb(var(--brand-300))" />
        </svg>

        <svg
          aria-hidden
          viewBox="0 0 100 100"
          className="absolute size-[100px] animate-spin-reverse text-brand-500"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="48 95 36 95"
            opacity="0.88"
          />
        </svg>

        <div className="relative flex size-[68px] items-center justify-center rounded-2xl border border-brand-400/40 bg-ink-900 p-1 shadow-[0_0_38px_rgb(var(--brand-500)/0.55)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt={`${config.brandName || site.name} logo`}
            width={60}
            height={60}
            className={`size-full object-cover ${
              config.logoShape === "circle" ? "rounded-full" : "rounded-[12px]"
            }`}
          />
        </div>
      </div>

      <div className="relative mt-8 flex flex-col items-center">
        <p className="font-display text-[22px] font-bold tracking-[0.22em] text-white sm:text-[25px]">
          <Wordmark />
        </p>

        <div className="mt-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.26em] text-brand-300">
          <span className="size-1.5 animate-ticker rounded-full bg-brand-400 shadow-[0_0_10px_rgb(var(--brand-400))]" />
          <span>{activeStatus}</span>
        </div>

        {sublabel && (
          <p className="mt-2 max-w-xs font-mono text-[10px] tracking-[0.14em] text-zinc-400">
            {sublabel}
          </p>
        )}

        <div
          aria-hidden
          className="mt-5 h-[2px] w-48 overflow-hidden rounded-full bg-brand-200/[0.08]"
        >
          <div className="h-full w-20 animate-loader-slide rounded-full bg-gradient-to-r from-transparent via-brand-400 to-brand-200 shadow-[0_0_14px_rgb(var(--brand-400))]" />
        </div>
        </div>
      </div>
    </div>
  );
}
