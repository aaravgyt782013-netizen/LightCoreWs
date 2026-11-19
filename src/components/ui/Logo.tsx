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
  const baseSrc = srcOverride || config.logoUrl || site.logo;
  const src =
    !srcOverride && baseSrc === "/brand/logo.png" && size <= 56
      ? "/brand/lightcore-mark.png"
      : baseSrc;
  const showGlow = glow && config.logoGlow;
  const radiusClass =
    config.logoShape === "circle"
      ? "rounded-full"
      : config.logoShape === "rounded"
        ? "rounded-xl"
        : "rounded-[28%]";

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {showGlow && (
        <span
          aria-hidden
          className="absolute -inset-1 rounded-full bg-brand-400/25 blur-xl transition-opacity duration-500 ease-smooth group-hover:opacity-100"
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`${config.brandName || site.name} logo`}
        width={size}
        height={size}
        className={`relative size-full ${radiusClass} bg-black object-cover ring-1 ring-brand-300/25 shadow-[0_8px_28px_-8px_rgb(var(--brand-400)/0.55)] transition-transform duration-500 ease-smooth group-hover:scale-[1.04]`}
      />
    </span>
  );
}

export function Wordmark({
  leadClassName = "text-white",
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
