import { site, type LogEntry } from "@/lib/site";

type DiscordEmbed = {
  title: string;
  description: string;
  color: number;
  timestamp: string;
  footer?: { text: string };
  fields?: { name: string; value: string; inline?: boolean }[];
};

export async function sendDiscordLogEmbed(embed: DiscordEmbed): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_LOG_WEBHOOK_URL?.trim();
  if (!webhookUrl) return false;

  try {
    const parsed = new URL(webhookUrl);
    if (
      parsed.protocol !== "https:" ||
      !["discord.com", "discordapp.com", "canary.discord.com", "ptb.discord.com"].includes(
        parsed.hostname,
      ) ||
      !parsed.pathname.startsWith("/api/webhooks/")
    ) {
      return false;
    }

    const res = await fetch(parsed.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `${site.name} Logs`,
        embeds: [
          {
            ...embed,
            footer: embed.footer ?? { text: `${site.name} · ${site.tagline}` },
          },
        ],
      }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function forwardLogToWebhook(entry: LogEntry): Promise<boolean> {
  const fields: { name: string; value: string; inline?: boolean }[] = [
    { name: "Type", value: `\`${entry.t}\``, inline: true },
    { name: "Status", value: entry.ok ? "OK" : "Alert", inline: true },
  ];
  if (entry.guild || entry.guildId) {
    fields.push({
      name: "Server",
      value: entry.guild
        ? entry.guildId
          ? `${entry.guild} (\`${entry.guildId}\`)`
          : entry.guild
        : `\`${entry.guildId}\``,
      inline: false,
    });
  }

  return sendDiscordLogEmbed({
    title: `${site.name} · ${entry.t}`,
    description: entry.msg,
    color: entry.ok ? 0x10b981 : 0xef4444,
    timestamp: entry.ts ?? new Date().toISOString(),
    fields,
  });
}
