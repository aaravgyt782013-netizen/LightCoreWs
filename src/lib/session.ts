import crypto from "node:crypto";
import { site } from "@/lib/site";

export const SESSION_COOKIE = "lc_session";
export const OAUTH_STATE_COOKIE = "lc_oauth_state";
export const OAUTH_NEXT_COOKIE = "lc_oauth_next";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type SessionUser = {
  id: string;
  username: string;
  globalName: string | null;
  avatar: string | null;
  email?: string | null;
  scopes?: string[];
};

export type SessionPayload = {
  user: SessionUser;
  accessToken: string;
  exp: number;
};

function deriveKey(secret: string): Buffer {
  return crypto.scryptSync(secret, "lightcore-session-v1", 32);
}

export function sealSession(payload: SessionPayload): string | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) return null;

  const key = deriveKey(secret);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function unsealSession(token: string | undefined): SessionPayload | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16 || !token) return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const [ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64, "base64url");
    const tag = Buffer.from(tagB64, "base64url");
    const encrypted = Buffer.from(dataB64, "base64url");
    if (iv.length !== 12 || tag.length !== 16) return null;

    const key = deriveKey(secret);
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);
    const parsed = JSON.parse(decrypted.toString("utf8")) as SessionPayload;
    if (
      !parsed ||
      typeof parsed.exp !== "number" ||
      parsed.exp < Math.floor(Date.now() / 1000) ||
      !parsed.user?.id ||
      typeof parsed.accessToken !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

import { NextResponse } from "next/server";

export function relativeRedirect(path: `/${string}`): NextResponse {
  return new NextResponse(null, {
    status: 302,
    headers: { Location: path },
  });
}

const TRUSTED_OAUTH_HOSTS = new Set<string>([
  "lightcorews.netlify.app",
  "lightcorews.wasmer.app",
  ...(() => {
    try {
      return [new URL(site.url).host.toLowerCase()];
    } catch {
      return [];
    }
  })(),
]);

export function getRedirectUri(requestUrl: string, headers?: Headers): string {
  if (process.env.DISCORD_REDIRECT_URI) {
    return process.env.DISCORD_REDIRECT_URI.trim();
  }
  const reqHost = (
    headers?.get("x-forwarded-host")?.split(",")[0]?.trim() ||
    headers?.get("host")?.trim() ||
    ""
  ).toLowerCase();
  if (TRUSTED_OAUTH_HOSTS.has(reqHost)) {
    return `https://${reqHost}/api/auth/callback/discord`;
  }
  if (process.env.NODE_ENV === "production" && site.url) {
    return `${site.url}/api/auth/callback/discord`;
  }
  return `${new URL(requestUrl).origin}/api/auth/callback/discord`;
}
