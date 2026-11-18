import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import { addStoredUsersToGuild } from "@/lib/auth-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  const botToken = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!botToken) {
    return NextResponse.json(
      {
        error:
          "DISCORD_BOT_TOKEN is not configured. Set it in your server environment so the bot can add authorized users to servers.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const rec = (body ?? {}) as { guildId?: unknown; userIds?: unknown };
  const guildId = typeof rec.guildId === "string" ? rec.guildId.trim() : "";
  if (!/^\d{15,22}$/.test(guildId)) {
    return NextResponse.json(
      { error: "Provide a valid Discord server (guild) ID." },
      { status: 400 },
    );
  }

  const userIds = Array.isArray(rec.userIds)
    ? rec.userIds
        .filter((x): x is string => typeof x === "string")
        .map((x) => x.trim())
        .filter((x) => /^\d{15,22}$/.test(x))
    : undefined;

  const summary = await addStoredUsersToGuild({
    guildId,
    userIds,
    botToken,
  });

  await sendDiscordLogEmbed({
    title: `${site.name} · Admin Guild Pull`,
    description: `Owner \`@${auth.session.user.username}\` ran server add for guild \`${guildId}\`.`,
    color: 0xef4444,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Added", value: String(summary.added), inline: true },
      { name: "Already In", value: String(summary.alreadyMember), inline: true },
      { name: "Failed", value: String(summary.failed), inline: true },
    ],
  });

  return NextResponse.json({ ok: true, guildId, ...summary });
}
