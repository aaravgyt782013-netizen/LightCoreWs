import type { Metadata } from "next";
import { PageShell, Prose } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How LIGHTCORE collects, processes and retains Discord guild data while protecting your server.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="privacy"
      title="Privacy Policy"
      intro="LIGHTCORE processes the minimum amount of Discord data required to keep your server safe. This page explains exactly what that means."
    >
      <Prose>
        <p>
          <strong>Last updated:</strong> November 2026
        </p>
        <h2>Data we process</h2>
        <p>
          Guild identifiers, channel and role identifiers, member identifiers
          involved in moderation events, and the audit actions required to
          evaluate rate gates. Message content is inspected transiently for
          AutoMod signals and is not stored unless a confirmed incident demands
          a transcript.
        </p>
        <h2>Why we process it</h2>
        <p>
          To detect raids, nukes and abusive behaviour in real time, to apply
          sanctions and rollbacks, and to keep an audit trail that guild owners
          can review in the dashboard.
        </p>
        <h2>Retention</h2>
        <p>
          Incident records are retained for 90 days by default and can be
          purged on request. Aggregate counters used for uptime and latency
          reporting are irreversible and contain no member data.
        </p>
        <h2>Your controls</h2>
        <ul>
          <li>Remove the bot at any time to stop all processing.</li>
          <li>Request export or deletion of incident records via a ticket.</li>
          <li>Disable individual modules without losing the audit stream.</li>
        </ul>
        <h2>Third parties</h2>
        <p>
          We do not sell data. Infrastructure providers process data solely to
          operate the service, under contractual confidentiality.
        </p>
      </Prose>
    </PageShell>
  );
}
