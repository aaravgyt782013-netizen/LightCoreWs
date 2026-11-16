import Link from "next/link";
import { DiscordIcon, ArrowRight } from "@/components/ui/Icons";
import { site } from "@/lib/site";

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
  if (variant === "ghost") {
    return (
      <Link
        href={site.dashboard}
        className={`group inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.03] font-medium text-zinc-200 transition-colors duration-300 hover:border-white/25 hover:bg-white/[0.07] hover:text-white ${sizes[size]} ${className}`}
      >
        Open Dashboard
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
      </Link>
    );
  }

  return (
    <a
      href={site.invite}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-glow group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-brand-600 font-semibold text-white shadow-[0_10px_40px_-12px_rgba(239,16,16,0.9)] transition-all duration-300 hover:bg-brand-500 hover:shadow-[0_16px_50px_-12px_rgba(255,43,43,0.95)] ${sizes[size]} ${className}`}
    >
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-60" />
      <DiscordIcon className="relative size-[18px]" />
      <span className="relative">Add to Discord</span>
    </a>
  );
}
