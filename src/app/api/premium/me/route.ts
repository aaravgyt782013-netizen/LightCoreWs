import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";
import {
  getUserSubscription,
  listPremiumInvoices,
  updateSubscriptionGuild,
} from "@/lib/premium-store";
import { fetchManageableGuilds } from "@/lib/discord-guilds";
import { isOwnerId } from "@/lib/admin";
import { ensureSessionUserRecorded } from "@/lib/auth-store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json(
      {
        authenticated: false,
        subscription: null,
        invoices: [],
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }

  const [subscription, allInvoices] = await Promise.all([
    getUserSubscription(session.user.id),
    listPremiumInvoices(150),
    ensureSessionUserRecorded(session),
  ]);

  const invoices = allInvoices
    .filter((i) => i.userId === session.user.id)
    .slice(0, 12);

  return NextResponse.json(
    {
      authenticated: true,
      isOwner: isOwnerId(session.user.id),
      subscription,
      invoices,
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function PATCH(req: NextRequest) {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  let body: { guildId?: string | null };
  try {
    body = (await req.json()) as { guildId?: string | null };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const rawGuildId = (body.guildId || "").trim();
  if (!rawGuildId) {
    const updated = await updateSubscriptionGuild({
      userId: session.user.id,
      guildId: null,
      guildName: null,
    });
    if (!updated) {
      return NextResponse.json(
        { error: "No active Premium subscription on your account." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, subscription: updated });
  }

  if (!/^\d{15,22}$/.test(rawGuildId)) {
    return NextResponse.json({ error: "Invalid server ID" }, { status: 400 });
  }

  const manageable = await fetchManageableGuilds(session.accessToken);
  const match = manageable?.find((g) => g.id === rawGuildId);
  if (!match) {
    return NextResponse.json(
      { error: "You can only bind Premium to a server you manage." },
      { status: 403 },
    );
  }

  const updated = await updateSubscriptionGuild({
    userId: session.user.id,
    guildId: match.id,
    guildName: match.name,
  });
  if (!updated) {
    return NextResponse.json(
      { error: "No active Premium subscription on your account." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, subscription: updated });
}
