import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import { appendLogs, clearLogs, sanitizeLogInput } from "@/lib/log-store";
import { forwardLogToWebhook } from "@/lib/discord-webhook";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const entry = sanitizeLogInput(body);
  if (!entry) {
    return NextResponse.json(
      { error: "Log message is required." },
      { status: 400 },
    );
  }

  await appendLogs([entry]);
  const webhookSent = await forwardLogToWebhook(entry);

  return NextResponse.json(
    { ok: true, entry, webhookSent },
    { status: 201 },
  );
}

export async function DELETE(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  await clearLogs();
  return NextResponse.json({ ok: true });
}
