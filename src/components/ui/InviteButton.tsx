"use client";

import Link from "next/link";
import { DiscordIcon, ArrowRight } from "@/components/ui/Icons";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { site } from "@/lib/site";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "ghost";
};

const sizes = {
  sm: "h-9 px-4 text-[13px] gap-2",
  md: "h-11 px-5 text-sm gap-2.5",
  lg: "h-[52px] px-7 text-[15px] gap-3",
};

export function InviteButton({
  size = "md",
  className = "",
  variant = "primary",
}: Props) {
  const { config } = useSiteConfig();

  if (variant === "ghost") {
    return (
      <Link
        href={site.dashboard}
        className={`group inline-flex items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.03] font-medium text-zinc-100 backdrop-blur-md transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:border-brand-500/50 hover:bg-brand-500/[0.09] hover:text-white hover:shadow-[0_12px_34px_-14px_rgb(var(--brand-600)/0.55)] active:translate-y-0 active:scale-[0.99] ${sizes[size]} ${className}`}
      >
        Open Dashboard
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    );
  }

  const safeInviteUrl = sanitizeDiscordInviteUrl(
    config.inviteUrl || site.invite,
    site.clientId,
  );

  return (
    <a
      href={safeInviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-glow group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-brand-700 via-brand-600 to-brand-500 font-semibold text-white shadow-[0_10px_38px_-10px_rgb(var(--brand-500)/0.85)] transition-all duration-300 ease-smooth hover:-translate-y-0.5 hover:brightness-110 hover:shadow-[0_18px_52px_-10px_rgb(var(--brand-500)/0.95)] active:translate-y-0 active:scale-[0.985] ${sizes[size]} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-65" />
      <DiscordIcon className="relative size-[18px] transition-transform duration-300 group-hover:scale-105" />
      <span className="relative tracking-[-0.01em]">
        {config.inviteButtonLabel || "Add to Discord"}
      </span>
    </a>
  );
}
