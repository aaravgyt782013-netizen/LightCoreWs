import type { Metadata } from "next";
import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { site } from "@/lib/site";
import { PremiumClient } from "./PremiumClient";

export const metadata: Metadata = {
  title: "Premium Plans",
  description: `Upgrade your Discord server with ${site.name} Premium — Plus (₹299/mo), Pro (₹499/mo), and Ultra Pro (₹749/mo) with Vanity Guard, Anti-Betray, No-Prefix & Custom Branded Bot.`,
};

export default function PremiumPage() {
  return (
    <>
      <PageBackground />
      <Navbar />
      <main className="relative pb-24 pt-28 sm:pt-36">
        <div className="container-x">
          <PremiumClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
