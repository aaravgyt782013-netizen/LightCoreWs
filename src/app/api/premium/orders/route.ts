import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, unsealSession } from "@/lib/session";
import {
  createPremiumOrder,
  getCycleSpec,
  getPlanSpec,
} from "@/lib/premium-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = unsealSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    return NextResponse.json(
      {
        error:
          "Sign in with Discord first so Premium locks exclusively to your account.",
        code: "unauthenticated",
      },
      { status: 401 },
    );
  }

  let body: {
    tier?: string;
    cycle?: string;
    guildId?: string;
    guildName?: string;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const plan = getPlanSpec(body.tier || "");
  const cycle = getCycleSpec(body.cycle || "");
  if (!plan || !cycle) {
    return NextResponse.json(
      { error: "Invalid plan or billing duration." },
      { status: 400 },
    );
  }

  const rawGuildId = (body.guildId || "").trim();
  const guildId = /^\d{15,22}$/.test(rawGuildId) ? rawGuildId : null;
  const guildName =
    guildId && typeof body.guildName === "string" && body.guildName.trim()
      ? body.guildName.trim().slice(0, 100)
      : null;

  const avatarUrl = session.user.avatar
    ? `https://cdn.discordapp.com/avatars/${session.user.id}/${session.user.avatar}.png?size=128`
    : null;

  const result = await createPremiumOrder({
    userId: session.user.id,
    username: session.user.username,
    globalName: session.user.globalName,
    avatarUrl,
    tier: plan.id,
    cycle: cycle.id,
    guildId,
    guildName,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: 503 },
    );
  }

  // Generate crisp self-contained SVG QR (zero third-party/Google calls)
  const qrSvg = await QRCode.toString(result.order.upiUri, {
    type: "svg",
    margin: 1,
    width: 240,
    errorCorrectionLevel: "M",
    color: {
      dark: "#04131c",
      light: "#ffffff",
    },
  });

  await sendDiscordLogEmbed({
    title: `${site.name} · Premium Order Initiated`,
    description: `**${session.user.globalName || session.user.username}** (\`@${session.user.username}\`) started a **${result.order.tierName}** order.`,
    color: 0x06b6d4,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Order ID", value: `\`${result.order.orderId}\``, inline: true },
      {
        name: "Exact UPI Amount",
        value: `\`₹${result.order.exactAmount}\` (${result.order.periodLabel})`,
        inline: true,
      },
      { name: "Buyer ID", value: `\`${session.user.id}\``, inline: true },
      ...(guildId
        ? [
            {
              name: "Server",
              value: guildName ? `${guildName} (\`${guildId}\`)` : `\`${guildId}\``,
              inline: false,
            },
          ]
        : []),
    ],
  });

  return NextResponse.json(
    { ok: true, order: result.order, qrSvg },
    { status: 201, headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
