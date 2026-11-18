"use client";

import { useSearchParams } from "next/navigation";
import { site } from "@/lib/site";

const errorMessages: Record<string, { title: string; detail: string }> = {
  oauth_not_configured: {
    title: "Discord OAuth2 secret not set yet",
    detail: `Add DISCORD_CLIENT_SECRET and SESSION_SECRET in your server environment variables and register ${site.url}/api/auth/callback/discord in the Discord Developer Portal.`,
  },
  invalid_state: {
    title: "Login session expired",
    detail: "Your OAuth2 verification timed out. Click Continue with Discord to try again.",
  },
  token_exchange_failed: {
    title: "Discord authorization failed",
    detail: `Check that DISCORD_CLIENT_SECRET matches client ID ${site.clientId} and the callback URL matches your Discord app settings.`,
  },
  user_fetch_failed: {
    title: "Could not load Discord profile",
    detail: "Discord did not return your profile information. Please try again.",
  },
  oauth_failed: {
    title: "Connection error",
    detail: "Unable to reach Discord OAuth2 right now. Please try again in a moment.",
  },
};

export function LoginNotice() {
  const params = useSearchParams();
  const code = params.get("error");
  if (!code) return null;

  const info = errorMessages[code] ?? {
    title: "Sign-in interrupted",
    detail: "Please try authenticating with Discord again.",
  };

  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-brand-500/30 bg-brand-950/40 px-3.5 py-3 text-left"
    >
      <p className="text-[12px] font-medium text-brand-300">{info.title}</p>
      <p className="mt-1 break-words text-[11px] leading-relaxed text-zinc-400">
        {info.detail}
      </p>
    </div>
  );
}
