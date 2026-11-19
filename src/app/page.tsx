import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { ModuleMarquee } from "@/components/site/ModuleMarquee";
import { Features } from "@/components/site/Features";
import { DashboardShowcase } from "@/components/site/DashboardShowcase";
import { VoiceMaster } from "@/components/site/VoiceMaster";
import { Setup } from "@/components/site/Setup";
import { Faq } from "@/components/site/Faq";
import { CtaSection } from "@/components/site/CtaSection";
import { Footer } from "@/components/site/Footer";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  slogan: site.tagline,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Discord",
  description: site.description,
  url: site.url,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <PageBackground />
      <Navbar />
      <main>
        <Hero />
        <ModuleMarquee />
        <Features />
        <div className="container-x">
          <div className="hairline" />
        </div>
        <DashboardShowcase />
        <div className="container-x">
          <div className="hairline" />
        </div>
        <VoiceMaster />
        <Setup />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
