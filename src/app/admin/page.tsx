import type { Metadata } from "next";
import { PageShell } from "@/components/site/PageShell";
import { site } from "@/lib/site";
import { AdminClient } from "./AdminClient";

export const metadata: Metadata = {
  title: "Owner Admin Panel",
  description: `Owner control panel for ${site.name}.`,
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PageShell
      eyebrow="admin"
      title="Owner Panel"
      intro={`Owner-only control center for ${site.name} — view every logged-in Discord user, configure direct FamPay UPI Premium checkout, manage server joins, and monitor live logs.`}
    >
      <AdminClient />
    </PageShell>
  );
}
