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
      intro={`Every surface of ${site.name}, sampled continuously. Rolling 45-day window.`}
    >
      <StatusClient />
    </PageShell>
  );
}
