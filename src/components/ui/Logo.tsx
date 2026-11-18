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
          className="absolute inset-0 rounded-full bg-brand-400/35 blur-xl"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${config.brandName || site.name} logo`}
        width={size}
        height={size}
        className={`relative size-full ${radiusClass} object-cover ring-1 ring-brand-200/15 drop-shadow-[0_0_14px_rgb(var(--brand-400)/0.5)]`}
      />
    </span>
  );
}

export function Wordmark({
  leadClassName = "",
  accentClassName = "text-brand-400",
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
