"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, Wordmark } from "@/components/ui/Logo";
import { InviteButton } from "@/components/ui/InviteButton";
import { nav, site } from "@/lib/site";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-b border-white/[0.07] bg-ink-950/80 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="container-x flex h-[68px] items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-3"
            aria-label={`${site.name} home`}
          >
            <Logo size={34} />
            <span className="flex flex-col leading-none">
              <span className="font-display text-[16px] font-semibold tracking-[0.16em] text-white">
                <Wordmark />
              </span>
              <span className="mt-1 font-mono text-[8px] uppercase tracking-[0.36em] text-brand-400/80">
                All-in-One
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-4 py-2 text-[13.5px] font-medium text-zinc-400 transition-colors duration-200 hover:bg-white/[0.05] hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={site.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13.5px] font-medium text-zinc-400 transition-colors hover:text-white"
            >
              Support
            </a>
            <Link
              href={site.dashboard}
              className="text-[13.5px] font-medium text-zinc-300 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <InviteButton size="sm" />
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="relative z-50 flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] md:hidden"
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 h-[1.5px] w-4 rounded bg-white transition-all duration-300 ${
                  open ? "top-1/2 rotate-45" : "top-0"
                }`}
              />
              <span
                className={`absolute left-0 top-1/2 h-[1.5px] w-4 -translate-y-1/2 rounded bg-white transition-all duration-200 ${
                  open ? "opacity-0" : "opacity-100"
                }`}
              />
              <span
                className={`absolute left-0 h-[1.5px] w-4 rounded bg-white transition-all duration-300 ${
                  open ? "top-1/2 -rotate-45" : "top-full"
                }`}
              />
            </span>
          </button>
        </div>
      </header>

      {/* mobile sheet */}
      <div
        className={`fixed inset-0 z-40 md:hidden ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        <div
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-ink-950/80 backdrop-blur-md transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-x-0 top-0 border-b border-white/10 bg-ink-900/95 px-5 pb-8 pt-24 shadow-panel transition-transform duration-400 ${
            open ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex flex-col gap-1">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
              >
                {item.label}
                <span className="font-mono text-[10px] text-zinc-600">
                  {item.href.replace(/^\//, "")}
                </span>
              </a>
            ))}
            <a
              href={site.discord}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between rounded-xl px-3 py-3.5 text-[15px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-white"
            >
              Support Server
              <span className="font-mono text-[10px] text-zinc-600">
                discord
              </span>
            </a>
          </div>
          <div className="mt-5 grid gap-3">
            <InviteButton size="lg" className="w-full" />
            <Link
              href={site.dashboard}
              onClick={() => setOpen(false)}
              className="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[15px] font-medium text-zinc-200"
            >
              Open Dashboard
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
