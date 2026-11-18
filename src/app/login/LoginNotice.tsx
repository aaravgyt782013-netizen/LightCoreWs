"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { DiscordIcon } from "@/components/ui/Icons";

export function DiscordLoginButton() {
  const params = useSearchParams();
  const [connecting, setConnecting] = useState(false);

  const rawNext = params.get("next");
  const safeNext =
    rawNext === "/admin" ||
    rawNext === "/premium" ||
    rawNext === "/dashboard" ||
    (rawNext && /^\/dashboard\/\d{15,22}$/.test(rawNext))
      ? rawNext
      : null;

  const href = safeNext
    ? `/api/auth/discord?next=${encodeURIComponent(safeNext)}`
    : "/api/auth/discord";

  return (
    <a
      href={href}
      onClick={() => setConnecting(true)}
      className="btn-primary btn-glow group relative mt-7 flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-[14.5px] font-semibold tracking-tight text-white transition-all duration-300 ease-smooth hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.985]"
    >
      {connecting ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span>Connecting to Discord…</span>
        </>
      ) : (
        <>
          <DiscordIcon className="size-[19px] transition-transform duration-300 ease-smooth group-hover:scale-110" />
          <span>Login with Discord</span>
        </>
      )}
    </a>
  );
}

export function LoginNotice() {
  const params = useSearchParams();
  const code = params.get("error");
  const reason = params.get("reason");

  if (!code) return null;

  const messages: Record<string, string> = {
    oauth_not_configured:
      "Discord sign-in is not configured yet. Add DISCORD_CLIENT_SECRET in server settings.",
    access_denied: "Authorization was cancelled.",
    invalid_scope: "Invalid OAuth2 scope configuration.",
    invalid_state: "Session timed out — tap Login with Discord again.",
    token_exchange_failed:
      reason === "invalid_client"
        ? "Client secret mismatch — update DISCORD_CLIENT_SECRET and try again."
        : reason === "rate_limited"
          ? "Discord is busy — wait a few seconds and try again."
          : "Could not complete Discord sign-in. Check your OAuth2 Redirect URI and try again.",
    user_fetch_failed: "Could not load your Discord profile. Please try again.",
    oauth_failed: "Connection interrupted. Please try again.",
  };

  const text = messages[code] ?? "Sign-in was interrupted. Please try again.";

  return (
    <div
      role="alert"
      className="animate-fade-in mt-5 w-full rounded-xl border border-brand-500/35 bg-brand-950/50 px-3.5 py-2.5 text-center text-[12px] leading-relaxed text-brand-200"
    >
      {text}
    </div>
  );
}
