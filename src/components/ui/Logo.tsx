"use client";

import Image from "next/image";

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
        src="/brand/xieron-512.png"
        alt="Xieron logo"
        width={size}
        height={size}
        priority
        className="relative size-full object-contain drop-shadow-[0_0_12px_rgba(239,16,16,0.55)]"
      />
    </span>
  );
}
