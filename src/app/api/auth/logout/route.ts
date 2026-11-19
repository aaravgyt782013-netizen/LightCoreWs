import { NextRequest, NextResponse } from "next/server";
import {
  OAUTH_NEXT_COOKIE,
  OAUTH_STATE_COOKIE,
  SESSION_COOKIE,
} from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const isHttps =
    req.headers.get("x-forwarded-proto") === "https" ||
    req.url.startsWith("https://");
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isHttps,
    path: "/",
    maxAge: 0,
  };
  const res = NextResponse.json(
    { ok: true },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } },
  );
  res.cookies.set(SESSION_COOKIE, "", cookieOpts);
  res.cookies.set(OAUTH_STATE_COOKIE, "", cookieOpts);
  res.cookies.set(OAUTH_NEXT_COOKIE, "", cookieOpts);
  return res;
}
