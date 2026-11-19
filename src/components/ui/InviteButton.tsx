"use client";

import { ArrowRight } from "@/components/ui/Icons";
import { useSiteConfig } from "@/components/site/SiteConfigProvider";
import { sanitizeDiscordInviteUrl } from "@/lib/discord-oauth";
import { site } from "@/lib/site";

type Props = {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

const sizes = {
  sm: "h-9 px-4 text-[12.5px] gap-1.5",
  md: "h-11 px-5 text-[14px] gap-2",
  lg: "h-[52px] px-7 text-[14.5px] gap-2.5",
};

export function InviteButton({
  size = "md",
  label,
  className = "",
}: Props) {
  const { config } = useSiteConfig();
  const finalLabel = label ?? (config.inviteButtonLabel || "Add to Discord");
  const href = sanitizeDiscordInviteUrl(
    config.inviteUrl || site.invite,
    site.clientId,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-primary btn-glow group relative inline-flex items-center justify-center overflow-hidden rounded-full font-semibold tracking-tight text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] ${sizes[size]} ${className}`}
    >
      <span className="relative z-10">{finalLabel}</span>
      <ArrowRight className="relative z-10 size-4 transition-transform duration-300 ease-smooth group-hover:translate-x-0.5" />
    </a>
  );
}
