"use client";

import { useEffect, useState } from "react";

export function ScrollTopButton() {
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const y = window.scrollY;
        const doc = document.documentElement;
        const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
        setShow(y > 380);
        setPct(Math.min(1, Math.max(0, y / max)));
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  return (
    <button
      type="button"
      aria-label="Scroll back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center rounded-full bg-ink-900/90 text-zinc-200 shadow-[0_14px_38px_-10px_rgba(0,0,0,0.95),0_0_26px_-8px_rgb(var(--brand-500)/0.65)] backdrop-blur-xl transition-all duration-300 ease-smooth hover:-translate-y-1 hover:text-white active:scale-95 sm:bottom-7 sm:right-7 ${
        show
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <svg
        aria-hidden
        viewBox="0 0 44 44"
        className="pointer-events-none absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgb(255 255 255 / 0.1)"
          strokeWidth="1.5"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="rgb(var(--brand-500))"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        className="relative size-4"
      >
        <path
          d="M8 12.5V3.5M8 3.5L4 7.5M8 3.5L12 7.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
