import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getPaymentSettings,
  matchAndAutoVerifyFamPayPayment,
} from "@/lib/premium-store";
import { appendLogs } from "@/lib/log-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Automatic FamPay UPI payment webhook.
 * Triggered by MacroDroid / Tasker on the owner's phone whenever a FamPay
 * "Received ₹..." notification arrives — automatically activates Premium
 * exclusively on the exact buyer's Discord account.
 */
export async function POST(req: NextRequest) {
  const settings = await getPaymentSettings();
  const authHeader = req.headers.get("authorization") || "";
  const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
  const headerSecret = req.headers.get("x-webhook-secret")?.trim() || "";

  let body: {
    secret?: string;
    text?: string;
    notification?: string;
    title?: string;
    amount?: string | number;
    orderId?: string;
    utr?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const provided = bearerToken || headerSecret || (body.secret || "").trim();
  if (!provided || !safeEqual(provided, settings.webhookSecret)) {
    return NextResponse.json({ error: "Unauthorized webhook" }, { status: 401 });
  }

  const combinedText = [body.title, body.text, body.notification]
    .filter((s): s is string => typeof s === "string" && Boolean(s.trim()))
    .join(" ");

  const outcome = await matchAndAutoVerifyFamPayPayment({
    text: combinedText,
    amount: body.amount,
    orderId: body.orderId,
    utr: body.utr,
  });

  if (!outcome.matched) {
    return NextResponse.json(
      { ok: false, matched: false, reason: outcome.reason },
      { status: 202 },
    );
  }

  const { order, subscription } = outcome;

  await appendLogs([
    {
      id: crypto.randomUUID(),
      t: "PREMIUM",
      ok: true,
      msg: `${order.tierName} auto-activated for @${order.username} via FamPay (₹${order.exactAmount})`,
      guild: order.guildName || undefined,
      guildId: order.guildId || undefined,
      guildOnly: true,
      ts: new Date().toISOString(),
    },
  ]);

  await sendDiscordLogEmbed({
    title: `${site.name} · Premium Auto-Activated (FamPay)`,
    description: `Received **₹${order.exactAmount}** on FamPay — **${subscription.tierName}** automatically unlocked for **@${subscription.username}** (\`${subscription.userId}\`) only.`,
    color: 0x10b981,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Order ID", value: `\`${order.orderId}\``, inline: true },
      { name: "Plan", value: `${subscription.tierName} (${order.periodLabel})`, inline: true },
      {
        name: "Expires",
        value: new Date(subscription.expiresAt).toISOString().slice(0, 10),
        inline: true,
      },
      ...(subscription.guildId
        ? [
            {
              name: "Server Slot",
              value: subscription.guildName
                ? `${subscription.guildName} (\`${subscription.guildId}\`)`
                : `\`${subscription.guildId}\``,
              inline: false,
            },
          ]
        : []),
    ],
  });

  return NextResponse.json({
    ok: true,
    matched: true,
    orderId: order.orderId,
    userId: subscription.userId,
    tier: subscription.tier,
    expiresAt: subscription.expiresAt,
  });
}
