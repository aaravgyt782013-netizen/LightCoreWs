import { NextRequest, NextResponse } from "next/server";
import {
  cleanEnvString,
  resolveDiscordClientId,
  resolveOAuthScopes,
  sanitizeOriginUrl,
} from "@/lib/discord-oauth";
import {
  createSignedOAuthState,
  getRedirectUri,
  getSessionSecret,
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

  if (!clientSecret || !sessionSecret) {
    return relativeRedirect("/login?error=oauth_not_configured", {
      url: req.url,
      headers: req.headers,
    });
  }

  const reqUrl = new URL(req.url);
  const nextPath = resolveSafeNextPath(reqUrl.searchParams.get("next"));

  // Hop Netlify commit-permalink subdomains (`*--site.netlify.app`) to primary site
  // so cookies and registered OAuth2 redirect_uri always match the main domain.
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
      const hop = NextResponse.redirect(canonicalStart.toString(), 302);
      hop.headers.set("Cache-Control", "private, no-store, max-age=0");
      return hop;
    }
  }

  const clientId = resolveDiscordClientId();
  const redirectUri = getRedirectUri(req.url, req.headers);
  const scopes = resolveOAuthScopes(
    process.env.DISCORD_OAUTH_SCOPES ||
      process.env.NEXT_PUBLIC_DISCORD_OAUTH_SCOPES,
  );

  const state = createSignedOAuthState({
    next: nextPath,
    redirectUri,
  });

  if (!state) {
    return relativeRedirect("/login?error=oauth_not_configured", {
      url: req.url,
      headers: req.headers,
    });
  }

  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", scopes);
  authorize.searchParams.set("state", state);

  const isHttps = redirectUri.startsWith("https://");
  const res = NextResponse.redirect(authorize.toString(), 302);
  res.headers.set(
    "Cache-Control",
    "private, no-store, no-cache, max-age=0, must-revalidate",
  );
  res.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 900,
  });
  return res;
}
