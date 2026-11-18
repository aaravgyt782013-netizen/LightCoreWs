import { NextRequest, NextResponse } from "next/server";
import {
  appendLogs,
  getLogs,
  sanitizeLogInput,
  verifyBearerSecret,
} from "@/lib/log-store";
import { forwardLogToWebhook } from "@/lib/discord-webhook";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";
import { fetchManageableGuilds } from "@/lib/discord-guilds";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guildId = searchParams.get("guildId")?.trim() || undefined;
  const rawLimit = Number(searchParams.get("limit") || "25");
  const limit = Number.isFinite(rawLimit) ? rawLimit : 25;

  let includePrivate = false;

  if (guildId) {
    if (!/^\d{15,22}$/.test(guildId)) {
      return NextResponse.json({ error: "Invalid guildId" }, { status: 400 });
    }
    const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const manageable = await fetchManageableGuilds(session.accessToken);
    if (!manageable || !manageable.some((g) => g.id === guildId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    includePrivate = true;
  }

  const data = await getLogs({ guildId, includePrivate, limit });

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(req: NextRequest) {
  const secret = process.env.LOG_INGEST_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "LOG_INGEST_SECRET is not configured on the server" },
      { status: 503 },
    );
  }

  if (!verifyBearerSecret(req.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rawItems =
    body &&
    typeof body === "object" &&
    Array.isArray((body as { logs?: unknown[] }).logs)
      ? (body as { logs: unknown[] }).logs.slice(0, 25)
      : [body];

  const entries = rawItems
    .map(sanitizeLogInput)
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (entries.length === 0) {
    return NextResponse.json(
      {
        error:
          'Provide at least one log with a "msg" string, e.g. { "t": "GUARD", "ok": true, "msg": "action blocked" }',
      },
      { status: 400 },
    );
  }

  await appendLogs(entries);

  const shouldForward =
    !(
      body &&
      typeof body === "object" &&
      (body as { forwardWebhook?: boolean }).forwardWebhook === false
    );

  if (shouldForward && process.env.DISCORD_LOG_WEBHOOK_URL) {
    await Promise.allSettled(
      entries.slice(0, 5).map((entry) => forwardLogToWebhook(entry)),
    );
  }

  return NextResponse.json(
    { ok: true, count: entries.length, logs: entries },
    { status: 201 },
  );
}
