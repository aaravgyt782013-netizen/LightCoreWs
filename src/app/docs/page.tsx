import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { BOT_COMMANDS, COMMAND_CATEGORIES } from "@/lib/commands";
import { site } from "@/lib/site";
import { DocsClient } from "./DocsClient";

export const metadata: Metadata = {
  title: "Commands & Documentation",
  description: `Searchable ${BOT_COMMANDS.length}+ command reference across ${COMMAND_CATEGORIES.length} modules, role hierarchy setup, rate-gate predicates, and template variables for ${site.name}.`,
};

export default function DocsPage() {
  return (
    <PageShell
      eyebrow="command reference"
      title="Commands & Documentation"
      intro={`Explore all ${BOT_COMMANDS.length} ${site.name} commands across ${COMMAND_CATEGORIES.length} modules, preview with your own custom server prefix, copy commands in one click, or hit ⌘K anywhere on the site.`}
    >
      <DocsClient />
    </PageShell>
  );
}
