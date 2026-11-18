import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { requireOwner } from "@/lib/admin";
import {
  getSiteConfig,
  resetSiteConfig,
  saveSiteConfig,
} from "@/lib/site-config-server";
import { appendLogs } from "@/lib/log-store";
import { sendDiscordLogEmbed } from "@/lib/discord-webhook";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;
  const config = await getSiteConfig();
  return NextResponse.json({ ok: true, config });
}

export async function PUT(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const actor = `@${auth.session.user.username}`;
  const config = await saveSiteConfig(body, actor);

  const msg = `website theme & branding updated by ${actor} (theme: ${config.themePreset})`;
  await appendLogs([
    {
      id: crypto.randomUUID(),
      t: "AUDIT",
      ok: true,
      msg,
      ts: new Date().toISOString(),
    },
  ]);
  await sendDiscordLogEmbed({
    title: `${config.brandName} · Website Config Updated`,
    description: `Owner \`${actor}\` updated website theme, branding, or pricing settings.`,
    color: 0xef4444,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Theme", value: `\`${config.themePreset}\``, inline: true },
      { name: "Brand", value: config.brandName, inline: true },
      { name: "Prefix", value: `\`${config.prefix}\``, inline: true },
    ],
  });

  return NextResponse.json({ ok: true, config });
}

export async function DELETE(req: NextRequest) {
  const auth = requireOwner(req);
  if (!auth.ok) return auth.response;

  const actor = `@${auth.session.user.username}`;
  const config = await resetSiteConfig(actor);

  await appendLogs([
    {
      id: crypto.randomUUID(),
      t: "AUDIT",
      ok: true,
      msg: `website customization reset to defaults by ${actor}`,
      ts: new Date().toISOString(),
    },
  ]);

  return NextResponse.json({ ok: true, config });
}
