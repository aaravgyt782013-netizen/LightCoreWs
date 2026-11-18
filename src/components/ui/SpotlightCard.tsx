"use client";

import type { CSSProperties, PointerEvent, ReactNode } from "react";

export function SpotlightCard({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${(e.clientX - rect.left).toFixed(1)}px`);
    el.style.setProperty("--my", `${(e.clientY - rect.top).toFixed(1)}px`);
  };

  return (
    <div
      onPointerMove={handlePointerMove}
      style={style}
      className={`spotlight-card ${className}`}
    >
      {children}
    </div>
  );
}
