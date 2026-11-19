import type { Metadata } from "next";
import { site } from "@/lib/site";
import { GuildDashboardClient } from "../[guildId]/GuildDashboardClient";

export const metadata: Metadata = {
  title: "Interactive Demo Dashboard",
  description: `Test all 12 ${site.name} server protection & management modules live — Anti-Nuke, AutoMod, Verification Gate, VoiceMaster, Tickets & Embed Studio — with zero login required.`,
};

export default function DemoDashboardPage() {
  return <GuildDashboardClient guildId="demo" demoMode />;
}
