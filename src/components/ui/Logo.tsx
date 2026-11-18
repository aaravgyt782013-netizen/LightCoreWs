"use client";

import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { site } from "@/lib/site";

export function Logo({
  size = 36,
  className = "",
  glow = true,
  srcOverride,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
  srcOverride?: string;
}) {
  const { config } = useSiteConfig();
  const src = srcOverride || config.logoUrl || site.logo;
  const showGlow = glow && config.logoGlow;
  const radiusClass =
    config.logoShape === "circle"
      ? "rounded-full"
      : config.logoShape === "rounded"
        ? "rounded-lg"
        : "rounded-[24%]";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-brand-500/40 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${config.brandName || site.name} logo`}
        width={size}
        height={size}
        className={`relative size-full ${radiusClass} object-cover ring-1 ring-brand-500/30 drop-shadow-[0_0_16px_rgb(var(--brand-500)/0.55)] transition-transform duration-300 ease-smooth group-hover:scale-[1.03]`}
      />
    </span>
  );
}

export function Wordmark({
  leadClassName = "text-white",
  accentClassName = "text-brand-500",
}: {
  leadClassName?: string;
  accentClassName?: string;
}) {
  const { config } = useSiteConfig();
  return (
    <>
      <span className={leadClassName}>{config.wordmarkLead}</span>
      <span className={accentClassName}>{config.wordmarkAccent}</span>
    </>
  );
}
