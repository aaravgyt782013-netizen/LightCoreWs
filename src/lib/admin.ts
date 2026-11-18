import { NextRequest, NextResponse } from "next/server";
import { site } from "@/lib/site";
import {
  SESSION_COOKIE,
  unsealSession,
  type SessionPayload,
} from "@/lib/session";

export function getOwnerIds(): string[] {
  const raw = process.env.DISCORD_OWNER_ID || site.ownerId;
  return raw
    .split(",")
    .map((id) => id.trim())
    .filter((id) => /^\d{15,22}$/.test(id));
}

export function isOwnerId(userId: string | undefined | null): boolean {
  if (!userId) return false;
  return getOwnerIds().includes(userId);
}

export function requireOwner(
  req: NextRequest,
):
  | { ok: true; session: SessionPayload }
  | { ok: false; response: NextResponse } {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Authentication required", code: "unauthenticated" },
        { status: 401 },
      ),
    };
  }

  if (!isOwnerId(session.user.id)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Access restricted to bot owner",
          code: "forbidden",
          userId: session.user.id,
        },
        { status: 403 },
      ),
    };
  }

  return { ok: true, session };
}
