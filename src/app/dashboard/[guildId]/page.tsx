import type { Metadata } from "next";
import { site } from "@/lib/site";
import { GuildDashboardClient } from "./GuildDashboardClient";

export const metadata: Metadata = {
  title: "Manage Server",
  description: `Configure ${site.name} Anti-Nuke, Whitelists, AutoMod, Night Mode, Welcomer, VoiceMaster, Tickets, and Logging for your Discord server.`,
  robots: { index: false, follow: false },
};

export default async function GuildDashboardPage({
  params,
}: {
  params: Promise<{ guildId: string }>;
}) {
  const { guildId } = await params;
  return <GuildDashboardClient guildId={guildId} />;
}
