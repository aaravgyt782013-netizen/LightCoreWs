import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { site } from "@/lib/site";
import { DashboardClient } from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: `Manage your Discord servers and monitor real-time ${site.name} logs.`,
};

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="dashboard"
      title={`${site.name} Control`}
      intro={`${site.tagline} — manage connected Discord servers and inspect incoming audit logs in real time.`}
    >
      <DashboardClient />
    </PageShell>
  );
}
