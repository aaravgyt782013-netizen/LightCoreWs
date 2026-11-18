"use client";

import Image from "next/image";
import { site } from "@/lib/site";

export function Logo({
  size = 36,
  className = "",
  glow = true,
}: {
  size?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {glow && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-brand-600/40 blur-xl"
        />
      )}
      <Image
        src={site.logo}
        alt={`${site.name} logo`}
        width={size}
        height={size}
        priority
        unoptimized
        className="relative size-full rounded-[24%] object-cover ring-1 ring-white/10 drop-shadow-[0_0_12px_rgba(239,16,16,0.55)]"
      />
    </span>
  );
}

export function Wordmark({
  leadClassName = "",
  accentClassName = "text-brand-500",
}: {
  leadClassName?: string;
  accentClassName?: string;
}) {
  return (
    <>
      <span className={leadClassName}>{site.wordmark.lead}</span>
      <span className={accentClassName}>{site.wordmark.accent}</span>
    </>
  );
}
