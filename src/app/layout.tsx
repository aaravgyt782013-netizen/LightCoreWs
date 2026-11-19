import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";
import { RouteLoader } from "@/components/ui/RouteLoader";
import { CommandPalette } from "@/components/ui/CommandPalette";
import { SiteConfigProvider } from "@/components/site/SiteConfigProvider";

const geistSans = localFont({
  src: [
    { path: "../fonts/Geist-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Geist-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/Geist-SemiBold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = localFont({
  src: [
    {
      path: "../fonts/space-grotesk-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/space-grotesk-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/space-grotesk-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/space-grotesk-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "../fonts/jetbrains-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/jetbrains-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

const fullTitle = `${site.name} | ${site.tagline}`;

const prePaintInitScript = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js')}var raw=localStorage.getItem('lightcore_site_config_vars_v3');if(raw){var v=JSON.parse(raw);if(v&&typeof v==='object'){for(var k in v){if(Object.prototype.hasOwnProperty.call(v,k)&&k.indexOf('--')===0){d.style.setProperty(k,String(v[k]))}}}}}catch(e){}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: fullTitle,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    site.name,
    "Discord all in one bot",
    "Discord security bot",
    "anti-nuke",
    "anti-raid",
    "automod",
    "VoiceMaster",
    "Discord tickets",
    "Discord moderation dashboard",
    "server protection",
  ],
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: site.name,
    title: fullTitle,
    description: site.description,
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: `${site.name} — ${site.tagline}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: fullTitle,
    description: site.description,
    images: ["/brand/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ||
      "P-gEx1bD3snWJ2oWRbix2osmDSkfowduJykdC40fxpI",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/brand/lightcore-mark.png", type: "image/png", sizes: "256x256" },
    ],
    apple: [{ url: "/brand/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#060504",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintInitScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-ink-950 font-sans text-zinc-100 antialiased`}
      >
        <SiteConfigProvider>
          <RouteLoader />
          <CommandPalette />
          {children}
        </SiteConfigProvider>
      </body>
    </html>
  );
}
