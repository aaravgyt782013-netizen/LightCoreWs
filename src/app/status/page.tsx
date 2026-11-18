import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { site } from "@/lib/site";
import { StatusClient } from "./StatusClient";

export const metadata: Metadata = {
  title: "System Status",
  description: `Live health and heartbeat signals for ${site.name} (${site.tagline}).`,
};

export default function StatusPage() {
  return (
    <PageShell
      eyebrow="status"
      title="System Status"
      intro={`Live health checks for ${site.name} when a monitoring endpoint is configured. Historical metrics are shown only when reported by that endpoint.`}
    >
      <StatusClient />
    </PageShell>
  );
}
