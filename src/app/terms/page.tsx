import type { Metadata } from "next";
import { PageShell, Prose } from "@/components/site/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern use of the LIGHTCORE Discord security bot and dashboard.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="terms"
      title="Terms of Service"
      intro="By inviting LIGHTCORE to a guild you agree to the terms below. They exist to keep the guard engine predictable."
    >
      <Prose>
        <p>
          <strong>Last updated:</strong> November 2026
        </p>
        <h2>Acceptable use</h2>
        <p>
          LIGHTCORE is provided for the protection of Discord communities. You may
          not use it to harass members, to bypass Discord&apos;s Terms of
          Service, or to target guilds you do not own or moderate.
        </p>
        <h2>Permissions and hierarchy</h2>
        <p>
          The bot requires the scopes needed to enforce your configuration.
          Misconfigured hierarchies can cause it to miss or over-apply actions;
          you are responsible for verifying role order after setup.
        </p>
        <h2>Availability</h2>
        <p>
          We target 99.99% uptime and publish latency in the status panel, but
          the service is provided &quot;as is&quot; without warranty. Scheduled
          maintenance is announced in the support server.
        </p>
        <h2>Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, LightCore Security is not liable
          for indirect damages arising from moderation actions, rollbacks or
          downtime.
        </p>
        <h2>Termination</h2>
        <p>
          We may suspend access for abuse, attempts to reverse-model our
          infrastructure, or violations of these terms.
        </p>
      </Prose>
    </PageShell>
  );
}
