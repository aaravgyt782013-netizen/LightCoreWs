import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#050507",
          900: "#08080c",
          850: "#0b0b11",
          800: "#0f0f16",
          700: "#16161f",
          600: "#1d1d28",
          500: "#2a2a38",
        },
        brand: {
          50: "#fff1f1",
          100: "#ffdede",
          200: "#ffc2c2",
          300: "#ff9797",
          400: "#ff5c5c",
          500: "#ff2b2b",
          600: "#ef1010",
          700: "#c90a0a",
          800: "#a50d0d",
          900: "#881212",
          950: "#4b0404",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)",
        "brand-fade":
          "radial-gradient(60% 60% at 50% 0%, rgba(239,16,16,0.22) 0%, rgba(239,16,16,0) 70%)",
      },
      backgroundSize: {
        grid: "64px 64px",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translate3d(0,0,0)" },
          "100%": { transform: "translate3d(-50%,0,0)" },
        },
        marqueeReverse: {
          "0%": { transform: "translate3d(-50%,0,0)" },
          "100%": { transform: "translate3d(0,0,0)" },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseRing: {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "70%": { transform: "scale(1.6)", opacity: "0" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(400%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ticker: {
          "0%": { opacity: "1" },
          "50%": { opacity: "0.35" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        marquee: "marquee var(--marquee-duration, 45s) linear infinite",
        "marquee-reverse":
          "marqueeReverse var(--marquee-duration, 45s) linear infinite",
        floaty: "floaty 6s ease-in-out infinite",
        "pulse-ring": "pulseRing 2.8s cubic-bezier(0.2,0.6,0.35,1) infinite",
        scan: "scan 4.5s linear infinite",
        shimmer: "shimmer 4s linear infinite",
        ticker: "ticker 2.2s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(255,43,43,0.25), 0 18px 60px -20px rgba(239,16,16,0.55)",
        panel:
          "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 30px 80px -40px rgba(0,0,0,0.9)",
      },
    },
  },
  plugins: [],
} satisfies Config;
