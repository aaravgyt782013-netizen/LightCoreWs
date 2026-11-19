"use client";

import { useId } from "react";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";

export function LoadingScreen({
  label,
  sublabel,
  fullScreen = true,
  delayed = false,
}: {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  cycle?: boolean;
  delayed?: boolean;
}) {
  const { config } = useSiteConfig();
  const gradId = useId();

  const activeStatus = label || config.loaderText || "Initializing LightCore";
  const logoSrc = config.logoUrl || site.logo;

  return (
    <div
      role="status"
      aria-live="polite"
      className={[
        fullScreen
          ? "fixed inset-0 z-[100] flex min-h-[100dvh] w-full items-center justify-center overflow-hidden bg-ink-950 px-6 text-center"
          : "relative flex h-full min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-ink-950 px-6 py-16 text-center",
        delayed ? "loader-delayed" : "",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.24] [mask-image:radial-gradient(circle_at_50%_48%,#000,transparent_64%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--brand-500) / 0.22), rgb(var(--brand-700) / 0.06) 58%, transparent 80%)",
        }}
      />

      <div className="relative z-10 flex w-full max-w-sm flex-col items-center justify-center">
        {/* Stabilized GPU-composited LightCore reactor orbital */}
        <div className="relative flex size-[136px] shrink-0 items-center justify-center">
          <svg
            aria-hidden
            viewBox="0 0 136 136"
            className="absolute inset-0 size-full transform-gpu animate-spin-slow text-brand-400 will-change-transform"
          >
            <circle
              cx="68"
              cy="68"
              r="63"
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.14"
              strokeWidth="1"
            />
            <circle
              cx="68"
              cy="68"
              r="63"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeDasharray="52 86 20 86"
              opacity="0.72"
            />
          </svg>

          <svg
            aria-hidden
            viewBox="0 0 112 112"
            className="absolute size-[112px] transform-gpu animate-spin-orbit will-change-transform"
          >
            <defs>
              <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(var(--brand-100))" />
                <stop offset="50%" stopColor="rgb(var(--brand-500))" />
                <stop
                  offset="100%"
                  stopColor="rgb(var(--brand-600))"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke={`url(#${gradId})`}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeDasharray="110 205"
            />
            <circle cx="56" cy="6" r="2.8" fill="rgb(var(--brand-300))" />
          </svg>

          <div className="relative flex size-[64px] items-center justify-center rounded-2xl border border-brand-500/40 bg-ink-900 p-1 shadow-[0_0_36px_-4px_rgb(var(--brand-500)/0.55)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={`${config.brandName || site.name} logo`}
              width={56}
              height={56}
              className={`size-full object-cover ${
                config.logoShape === "circle"
                  ? "rounded-full"
                  : config.logoShape === "rounded"
                    ? "rounded-lg"
                    : "rounded-[12px]"
              }`}
            />
          </div>
        </div>

        {/* Fixed-height typography block — zero vertical layout shift */}
        <div className="relative mt-7 flex flex-col items-center">
          <p className="font-display text-[21px] font-bold tracking-[0.22em] text-white sm:text-[24px]">
            <Wordmark />
          </p>

          <div className="mt-3 flex h-5 items-center justify-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.24em] text-brand-300">
            <span className="size-1.5 shrink-0 animate-ticker rounded-full bg-brand-400 shadow-[0_0_8px_rgb(var(--brand-400))]" />
            <span className="truncate">{activeStatus}</span>
          </div>

          <p className="mt-1.5 min-h-[16px] max-w-xs truncate font-mono text-[10px] tracking-[0.12em] text-zinc-500">
            {sublabel || "\u00A0"}
          </p>

          <div
            aria-hidden
            className="mt-4 h-[2px] w-44 overflow-hidden rounded-full bg-white/[0.07]"
          >
            <div className="h-full w-20 transform-gpu animate-loader-slide rounded-full bg-gradient-to-r from-transparent via-brand-500 to-brand-300 will-change-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
