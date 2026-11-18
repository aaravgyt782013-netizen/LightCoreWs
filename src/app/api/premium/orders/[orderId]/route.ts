import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";
import {
  getOrder,
  getUserSubscription,
  submitOrderUtr,
} from "@/lib/premium-store";
import { isOwnerId } from "@/lib/admin";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ orderId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await context.params;
  const order = await getOrder(orderId.toUpperCase());
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Strictly lock order inspection to the exact buyer account (or bot owner)
  if (order.userId !== session.user.id && !isOwnerId(session.user.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const subscription =
    order.status === "paid" ? await getUserSubscription(order.userId) : null;

  return NextResponse.json(
    { order, subscription },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}

export async function POST(req: NextRequest, context: RouteContext) {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId } = await context.params;
  let body: { utr?: string };
  try {
    body = (await req.json()) as { utr?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const res = await submitOrderUtr({
    orderId: orderId.toUpperCase(),
    userId: session.user.id,
    utr: body.utr || "",
  });

  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  await sendDiscordLogEmbed({
    title: `${site.name} · FamPay UTR Submitted`,
    description: `**${res.order.globalName || res.order.username}** (\`@${res.order.username}\`) submitted UTR \`${res.order.utr}\` for **${res.order.tierName}** — awaiting auto-match or 1-click approve in \`/admin\`.`,
    color: 0x22d3ee,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Order", value: `\`${res.order.orderId}\``, inline: true },
      { name: "Amount", value: `\`₹${res.order.exactAmount}\``, inline: true },
      { name: "UTR", value: `\`${res.order.utr}\``, inline: true },
      { name: "Account", value: `\`${res.order.userId}\``, inline: true },
    ],
  });

  return NextResponse.json({ ok: true, order: res.order });
}
