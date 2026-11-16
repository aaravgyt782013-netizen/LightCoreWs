import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/lib/site";

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "LIGHTCORE | Advanced Discord Security & Anti-Nuke Bot",
    template: "%s | LIGHTCORE",
  },
  description: site.description,
  applicationName: "LIGHTCORE",
  keywords: [
    "LightCore",
    "Discord security bot",
    "anti-nuke",
    "anti-raid",
    "automod",
    "Voicemaster",
    "Discord moderation",
    "server protection",
  ],
  authors: [{ name: "LightCore Security" }],
  creator: "LightCore Security",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    siteName: "LIGHTCORE",
    title: "LIGHTCORE | Advanced Discord Security & Anti-Nuke Bot",
    description: site.description,
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "LIGHTCORE — Advanced Discord Security",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "LIGHTCORE | Advanced Discord Security & Anti-Nuke Bot",
    description: site.description,
    images: ["/brand/og.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: "/brand/lightcore-512.png", type: "image/png" }],
    apple: [{ url: "/brand/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
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
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('js')}}catch(e){}`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-ink-950 font-sans text-zinc-100 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
