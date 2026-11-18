import { PageBackground } from "@/components/site/Background";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Features } from "@/components/site/Features";
import { Setup } from "@/components/site/Setup";
import { Protocol } from "@/components/site/Protocol";
import { VoiceMaster } from "@/components/site/VoiceMaster";
import { Faq } from "@/components/site/Faq";
import { CtaSection } from "@/components/site/CtaSection";
import { Footer } from "@/components/site/Footer";
import { site } from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: site.name,
  slogan: site.tagline,
  applicationCategory: "SecurityApplication",
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageBackground />
      <Navbar />
      <main>
        <Hero />
          <Features />
        <Setup />
        <Protocol />
        <VoiceMaster />
        <Faq />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
