import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { site } from "@/lib/site";
import {
  getRedirectUri,
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  relativeRedirect,
} from "@/lib/session";

export const dynamic = "force-dynamic";

const ALLOWED_NEXT_PATHS = new Set(["/dashboard", "/admin"]);

export async function GET(req: NextRequest) {
  const clientSecret = process.env.DISCORD_CLIENT_SECRET?.trim();
  const sessionSecret = process.env.SESSION_SECRET?.trim();

  if (!clientSecret || !sessionSecret || sessionSecret.length < 16) {
    return relativeRedirect("/login?error=oauth_not_configured");
  }

  const requestedNext = new URL(req.url).searchParams.get("next") || "";
  const nextPath = ALLOWED_NEXT_PATHS.has(requestedNext)
    ? requestedNext
    : "/dashboard";

  const scopes =
    process.env.DISCORD_OAUTH_SCOPES?.trim() || site.oauthScopes;

  const state = crypto.randomBytes(24).toString("base64url");
  const authorize = new URL("https://discord.com/oauth2/authorize");
  authorize.searchParams.set("client_id", site.clientId);
  authorize.searchParams.set("redirect_uri", getRedirectUri(req.url, req.headers));
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", scopes);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("prompt", "consent");

  const res = NextResponse.redirect(authorize.toString());
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  };
  res.cookies.set(OAUTH_STATE_COOKIE, state, cookieOpts);
  res.cookies.set(OAUTH_NEXT_COOKIE, nextPath, cookieOpts);
  return res;
}
