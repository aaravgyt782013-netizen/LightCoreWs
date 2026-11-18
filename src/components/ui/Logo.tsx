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
          className="absolute inset-0 rounded-full bg-brand-400/35 blur-xl"
        />
      )}
      <Image
        src={site.logo}
        alt={`${site.name} logo`}
        width={size}
        height={size}
        priority
        unoptimized
        className="relative size-full rounded-[24%] object-cover ring-1 ring-cyan-200/15 drop-shadow-[0_0_14px_rgba(34,211,238,0.5)]"
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
  return (
    <>
      <span className={leadClassName}>{site.wordmark.lead}</span>
      <span className={accentClassName}>{site.wordmark.accent}</span>
    </>
  );
}
