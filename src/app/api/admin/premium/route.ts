import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import {
  completeOrderPayment,
  getCycleSpec,
  getPlanSpec,
  grantSubscription,
  isValidUpiId,
  rejectOrder,
  revokeSubscription,
  updatePaymentSettings,
} from "@/lib/premium-store";
import { appendLogs } from "@/lib/log-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  let body: {
    action?: string;
    // settings
    fampayUpiId?: string;
    payeeName?: string;
    premiumRoleId?: string;
    regenerateSecret?: boolean;
    // order review
    orderId?: string;
    // manual grant / revoke
    userId?: string;
    username?: string;
    tier?: string;
    cycle?: string;
    guildId?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const actor = `@${auth.session.user.username}`;

  if (body.action === "settings") {
    const rawUpi = (body.fampayUpiId ?? "").trim();
    if (rawUpi && !isValidUpiId(rawUpi)) {
      return NextResponse.json(
        { error: "Enter a valid FamPay / UPI ID (for example: yourname@fam)." },
        { status: 400 },
      );
    }
    const settings = await updatePaymentSettings({
      fampayUpiId: body.fampayUpiId,
      payeeName: body.payeeName,
      premiumRoleId: body.premiumRoleId,
      regenerateSecret: Boolean(body.regenerateSecret),
    });
    return NextResponse.json({ ok: true, settings });
  }

  if (body.action === "approve") {
    const orderId = (body.orderId || "").trim().toUpperCase();
    const res = await completeOrderPayment({
      orderId,
      verifiedBy: actor,
      source: "utr-approved",
    });
    if (!res) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    await appendLogs([
      {
        id: crypto.randomUUID(),
        t: "PREMIUM",
        ok: true,
        msg: `${res.subscription.tierName} approved for @${res.subscription.username} (${res.order.orderId})`,
        guildOnly: true,
        ts: new Date().toISOString(),
      },
    ]);

    await sendDiscordLogEmbed({
      title: `${site.name} · Premium Activated`,
      description: `**${res.subscription.tierName}** activated for **@${res.subscription.username}** (\`${res.subscription.userId}\`) by ${actor}.`,
      color: 0x10b981,
      timestamp: new Date().toISOString(),
      fields: [
        { name: "Order", value: `\`${res.order.orderId}\``, inline: true },
        { name: "Amount", value: `\`₹${res.order.exactAmount}\``, inline: true },
        {
          name: "Expires",
          value: new Date(res.subscription.expiresAt).toISOString().slice(0, 10),
          inline: true,
        },
      ],
    });

    return NextResponse.json({ ok: true, ...res });
  }

  if (body.action === "reject") {
    const orderId = (body.orderId || "").trim().toUpperCase();
    const order = await rejectOrder(orderId, actor);
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or already paid." },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, order });
  }

  if (body.action === "grant") {
    const userId = (body.userId || "").replace(/[^\d]/g, "");
    if (!/^\d{15,22}$/.test(userId)) {
      return NextResponse.json(
        { error: "Enter a valid 17–20 digit Discord User ID." },
        { status: 400 },
      );
    }
    const plan = getPlanSpec(body.tier || "pro");
    const cycle = getCycleSpec(body.cycle || "1m");
    if (!plan || !cycle) {
      return NextResponse.json(
        { error: "Invalid plan or duration." },
        { status: 400 },
      );
    }
    const cleanGuild = (body.guildId || "").replace(/[^\d]/g, "");
    const sub = await grantSubscription({
      userId,
      username: (body.username || "").trim().replace(/^@/, "") || `user_${userId.slice(-4)}`,
      globalName: null,
      avatarUrl: null,
      tier: plan.id,
      cycle: cycle.id,
      guildId: /^\d{15,22}$/.test(cleanGuild) ? cleanGuild : null,
      guildName: null,
      orderId: `GRANT-${Date.now().toString(36).toUpperCase()}`,
      utr: null,
      source: "owner-grant",
    });
    return NextResponse.json({ ok: true, subscription: sub });
  }

  if (body.action === "revoke") {
    const userId = (body.userId || "").replace(/[^\d]/g, "");
    if (!/^\d{15,22}$/.test(userId)) {
      return NextResponse.json({ error: "Invalid User ID." }, { status: 400 });
    }
    await revokeSubscription(userId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
