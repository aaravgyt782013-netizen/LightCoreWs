import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { site } from "@/lib/site";
import { DocsClient } from "./DocsClient";

export const metadata: Metadata = {
  title: "Documentation",
  description: `Interactive command explorer and security module reference for ${site.name}.`,
};

export default function DocsPage() {
  return (
    <PageShell
      eyebrow="documentation"
      title="Command Reference"
      intro={`Tap any command to copy it straight to your clipboard. All modules operate under prefix "${site.prefix}" and sync seamlessly with the web dashboard.`}
    >
      <DocsClient />
    </PageShell>
  );
}
