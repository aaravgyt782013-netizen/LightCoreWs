"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "@/lib/site";
import { Wordmark } from "@/components/ui/Logo";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";

const defaultSteps = [
  "Initializing Core",
  "Syncing Gateway",
  "Arming Guard Engine",
  "Preparing Workspace",
];

export function LoadingScreen({
  label,
  sublabel,
  fullScreen = true,
  cycle = true,
  fading = false,
}: {
  label?: string;
  sublabel?: string;
  fullScreen?: boolean;
  cycle?: boolean;
  fading?: boolean;
}) {
  const { config } = useSiteConfig();
  const [stepIdx, setStepIdx] = useState(0);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const rawId = useId().replace(/:/g, "");
  const outerGradId = `lc-outer-${rawId}`;
  const innerGradId = `lc-inner-${rawId}`;

  useEffect(() => {
    if (fullScreen && typeof document !== "undefined") {
      setPortalTarget(document.body);
    }
  }, [fullScreen]);

  useEffect(() => {
    if (!cycle || label) return;
    const id = window.setInterval(() => {
      setStepIdx((i) => (i + 1) % defaultSteps.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [cycle, label]);

  const activeStatus = (label || config.loaderText || defaultSteps[stepIdx])
    .replace(/\.{3}$/, "")
    .trim();
  const logoSrc = config.logoUrl || site.logo;

  const content = (
    <div
      role="status"
      aria-live="polite"
      style={
        fullScreen
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100dvh",
              minHeight: "100svh",
            }
          : undefined
      }
      className={
        fullScreen
          ? `z-[9990] grid select-none touch-none place-items-center overflow-hidden bg-ink-950 transition-opacity duration-300 ease-smooth ${
              fading ? "pointer-events-none opacity-0" : "opacity-100"
            }`
          : "relative grid min-h-[420px] w-full select-none place-items-center overflow-hidden rounded-3xl border border-white/[0.08] bg-ink-950/95 py-16"
      }
    >
      {/* Stationary centered background grid & crimson core bloom (zero layout impact) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-grid-fade bg-grid opacity-[0.26] [mask-image:radial-gradient(circle_at_50%_50%,#000_12%,transparent_65%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:size-[420px]"
        style={{
          background:
            "radial-gradient(closest-side, rgb(var(--brand-600) / 0.26), rgb(var(--brand-800) / 0.08) 56%, transparent 100%)",
        }}
      />

      {/* Strictly fixed-geometry center stack — zero vertical or horizontal fluctuation */}
      <div className="relative z-10 mx-auto flex w-[288px] max-w-[90vw] flex-col items-center justify-center text-center sm:w-[340px]">
        {/* Precision concentric HUD reactor (single centered SVG = zero subpixel wobble) */}
        <div className="relative size-[148px] shrink-0 sm:size-[164px]">
          {/* Stationary crimson halo behind logo */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-1/2 size-[92px] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgb(var(--brand-500) / 0.42), transparent 100%)",
            }}
          />

          <svg
            aria-hidden
            viewBox="0 0 160 160"
            className="pointer-events-none absolute inset-0 block size-full"
          >
            <defs>
              <linearGradient id={outerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="rgb(var(--brand-200))" />
                <stop offset="45%" stopColor="rgb(var(--brand-500))" />
                <stop
                  offset="100%"
                  stopColor="rgb(var(--brand-700))"
                  stopOpacity="0"
                />
              </linearGradient>
              <linearGradient id={innerGradId} x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(var(--brand-300))" />
                <stop offset="55%" stopColor="rgb(var(--brand-600))" />
                <stop
                  offset="100%"
                  stopColor="rgb(var(--brand-900))"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Static precision HUD guide tracks */}
            <circle
              cx="80"
              cy="80"
              r="74"
              fill="none"
              stroke="rgb(255 255 255 / 0.06)"
              strokeWidth="1"
            />
            <circle
              cx="80"
              cy="80"
              r="61"
              fill="none"
              stroke="rgb(var(--brand-500) / 0.14)"
              strokeWidth="1"
              strokeDasharray="2 6"
            />
            <circle
              cx="80"
              cy="80"
              r="49"
              fill="none"
              stroke="rgb(255 255 255 / 0.06)"
              strokeWidth="1"
            />

            {/* Outer slow precision sweep */}
            <g className="loader-ring-slow">
              <circle
                cx="80"
                cy="80"
                r="74"
                fill="none"
                stroke="rgb(var(--brand-500))"
                strokeOpacity="0.65"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray="58 174 58 174"
              />
            </g>

            {/* Primary luminous crimson orbit */}
            <g className="loader-ring-fast">
              <circle
                cx="80"
                cy="80"
                r="61"
                fill="none"
                stroke={`url(#${outerGradId})`}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="135 250"
              />
            </g>

            {/* Counter-rotating inner telemetry arc */}
            <g className="loader-ring-reverse">
              <circle
                cx="80"
                cy="80"
                r="49"
                fill="none"
                stroke={`url(#${innerGradId})`}
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="84 224"
              />
            </g>
          </svg>

          {/* Locked dead-center bot emblem */}
          <div className="absolute left-1/2 top-1/2 flex size-[64px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-brand-500/45 bg-ink-900 p-1 shadow-[0_0_32px_rgb(var(--brand-500)/0.5),inset_0_1px_0_rgb(255_255_255/0.14)] sm:size-[70px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoSrc}
              alt={`${config.brandName || site.name} logo`}
              width={62}
              height={62}
              className={`block size-full object-cover ${
                config.logoShape === "circle" ? "rounded-full" : "rounded-[12px]"
              }`}
            />
          </div>
        </div>

        {/* Brand wordmark — locked height */}
        <p className="mt-6 h-[28px] whitespace-nowrap font-display text-[20px] font-bold leading-[28px] tracking-[0.2em] text-white sm:text-[23px]">
          <Wordmark />
        </p>

        {/* Status line — strictly single-line locked height so text NEVER wraps or shifts */}
        <div className="mt-2 flex h-[20px] w-full items-center justify-center gap-2 overflow-hidden">
          <span className="size-1.5 shrink-0 animate-ticker rounded-full bg-brand-400 shadow-[0_0_8px_rgb(var(--brand-400))]" />
          <span className="truncate font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-brand-300 sm:text-[10.5px]">
            {activeStatus}
          </span>
        </div>

        {/* Sublabel slot — always reserves exact height when present, single-line ellipsis */}
        <div className="mt-1 flex h-[18px] w-full items-center justify-center overflow-hidden">
          {sublabel ? (
            <p className="truncate font-mono text-[9.5px] tracking-[0.1em] text-zinc-500">
              {sublabel}
            </p>
          ) : null}
        </div>

        {/* Smooth laser progress track */}
        <div
          aria-hidden
          className="relative mt-4 h-[2px] w-[176px] overflow-hidden rounded-full bg-white/[0.08]"
        >
          <div className="h-full w-16 animate-loader-slide rounded-full bg-gradient-to-r from-transparent via-brand-500 to-brand-300" />
        </div>
      </div>
    </div>
  );

  if (fullScreen && portalTarget) {
    return createPortal(content, portalTarget);
  }

  return content;
}
