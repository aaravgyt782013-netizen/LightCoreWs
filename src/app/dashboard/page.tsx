import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { site } from "@/lib/site";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Select a Server",
  description: `Choose a Discord server to configure ${site.name}'s Anti-Nuke, AutoMod, VoiceMaster, Tickets, Welcomer, and Logging.`,
};

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="dashboard"
      title="Select a Server"
      intro={`Pick any Discord server you manage to configure ${site.name}'s security modules, moderation, voice channels, tickets, and logs.`}
    >
      <DashboardClient />
    </PageShell>
  );
}
