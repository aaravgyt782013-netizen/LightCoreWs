import type { Metadata } from "next";
import Link from "next/link";
import { PageShell, Prose } from "@/components/site/PageShell";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing use of the ${site.name} Discord security bot, web dashboard, and optional Premium tiers.`,
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="terms"
      title="Terms of Service"
      intro={`By inviting ${site.name} to a Discord server or signing in to the dashboard, you agree to these straightforward operating terms.`}
    >
      <Prose>
        <p>
          <strong>Last updated:</strong> November 2026
        </p>

        <h2>1. Independent service</h2>
        <p>
          {site.name} is an independent community management and security
          utility built for Discord servers. It is not affiliated with or
          endorsed by Discord Inc. Use of {site.name} must always comply with{" "}
          <a
            href="https://discord.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            Discord&apos;s Terms of Service
          </a>{" "}
          and Community Guidelines.
        </p>

        <h2>2. Acceptable use</h2>
        <p>
          You may use {site.name} only to protect, moderate, and operate Discord
          servers where you hold legitimate owner or administrator permissions.
          You may not use the bot or dashboard to harass users, conduct raids,
          send unsolicited spam, collect sensitive personal data, or attempt to
          disrupt our APIs or infrastructure.
        </p>

        <h2>3. Role hierarchy &amp; permissions</h2>
        <p>
          Automated guard modules (Anti-Nuke, AutoMod, Anti-Raid, Quarantine,
          and Role Recovery) can only act on roles positioned below{" "}
          {site.name}&apos;s highest role in your Discord server settings.
          Server owners are responsible for configuring trusted whitelists,
          extra owners, and role hierarchy accurately.
        </p>

        <h2>4. Optional Premium subscriptions</h2>
        <p>
          Core protection modules are available for free. Optional Premium plans
          (Plus, Pro, Ultra Pro) generate a reference order summary on the
          website — no credit card numbers or banking passwords are ever entered
          on this website. Fulfillment and support are handled transparently in
          our{" "}
          <a
            href={site.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            official support server
          </a>
          .
        </p>

        <h2>5. Availability &amp; liability</h2>
        <p>
          We monitor platform health on our{" "}
          <Link
            href="/status"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            Status page
          </Link>{" "}
          and announce maintenance in our support server, but cannot guarantee
          uninterrupted uptime. To the maximum extent permitted by applicable
          law, {site.name} is provided &ldquo;as is&rdquo; without liability for
          indirect or consequential damages resulting from moderation actions,
          Discord API outages, or misconfigured server permissions.
        </p>

        <h2>6. Termination &amp; privacy</h2>
        <p>
          You may stop using {site.name} at any time by kicking the bot or
          revoking OAuth2 authorization in Discord. We may suspend abusive
          guilds or accounts that violate these terms. Data handling is governed
          by our{" "}
          <Link
            href="/privacy"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/security"
            className="text-brand-400 underline decoration-brand-500/40 underline-offset-4 hover:text-brand-300"
          >
            Security Center
          </Link>
          .
        </p>
      </Prose>
    </PageShell>
  );
}
