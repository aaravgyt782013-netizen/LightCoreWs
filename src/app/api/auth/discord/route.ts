import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  cleanEnvString,
  resolveDiscordClientId,
  resolveOAuthScopes,
  sanitizeOriginUrl,
} from "@/lib/discord-oauth";
import {
  getRedirectUri,
  getSessionSecret,
  OAUTH_NEXT_COOKIE,
  OAUTH_REDIRECT_COOKIE,
  OAUTH_STATE_COOKIE,
  relativeRedirect,
} from "@/lib/session";

export const dynamic = "force-dynamic";

function resolveSafeNextPath(raw: string | null): string {
  if (!raw) return "/dashboard";
  const trimmed = raw.trim();
  if (
    trimmed === "/dashboard" ||
    trimmed === "/admin" ||
    trimmed === "/premium" ||
    /^\/dashboard\/\d{15,22}$/.test(trimmed)
  ) {
    return trimmed;
  }
  return "/dashboard";
}

export async function GET(req: NextRequest) {
  const clientSecret = cleanEnvString(process.env.DISCORD_CLIENT_SECRET);
  const sessionSecret = getSessionSecret();

  if (!clientSecret || !sessionSecret || sessionSecret.length < 16) {
    return relativeRedirect("/login?error=oauth_not_configured");
  }

  const reqUrl = new URL(req.url);
  const nextPath = resolveSafeNextPath(reqUrl.searchParams.get("next"));

  // If the user opened a Netlify commit-permalink/branch subdomain
  // (e.g. `67ab12--sitename.netlify.app`), hop to the primary Netlify URL first
  // so the OAuth state cookie and redirect_uri match the registered domain.
  const reqHost = (
    req.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    req.headers.get("host")?.trim() ||
    reqUrl.host
  )
    .toLowerCase()
    .replace(/:(443|80)$/, "");
  const primaryNetlifyOrigin = sanitizeOriginUrl(process.env.URL);
  if (
    primaryNetlifyOrigin &&
    reqHost.endsWith(".netlify.app") &&
    reqHost.includes("--")
  ) {
    const primaryHost = new URL(primaryNetlifyOrigin).host.toLowerCase();
    if (primaryHost !== reqHost && !primaryHost.includes("--")) {
      const canonicalStart = new URL("/api/auth/discord", primaryNetlifyOrigin);
      canonicalStart.searchParams.set("next", nextPath);
      return NextResponse.redirect(canonicalStart.toString());
    }
  }

  const clientId = resolveDiscordClientId();
  const redirectUri = getRedirectUri(req.url, req.headers);
  const scopes = resolveOAuthScopes(
    process.env.DISCORD_OAUTH_SCOPES ||
      process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES,
  );

  const state = crypto.randomBytes(24).toString("base64url");
  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", scopes);
  authorize.searchParams.set("state", state);

  const isHttps = redirectUri.startsWith("https://");
  const res = NextResponse.redirect(authorize.toString());
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isHttps,
    path: "/",
    maxAge: 600,
  };
  res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  res.cookies.set(OAUTH_NEXT_COOKIE, nextPath, cookieOpts);
  res.cookies.set(OAUTH_REDIRECT_COOKIE, redirectUri, cookieOpts);
  return res;
}
