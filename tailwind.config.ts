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
          950: "#03070c",
          900: "#060d16",
          850: "#091320",
          800: "#0d1b2b",
          700: "#13253a",
          600: "#1b334e",
          500: "#284869",
        },
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#062836",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgba(103,232,249,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(103,232,249,0.045) 1px, transparent 1px)",
        "brand-fade":
          "radial-gradient(60% 60% at 50% 0%, rgba(6,182,212,0.22) 0%, rgba(6,182,212,0) 72%)",
      },
      backgroundSize: {
        grid: "64px 64px",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
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
        spinReverse: {
          "0%": { transform: "rotate(360deg)" },
          "100%": { transform: "rotate(0deg)" },
        },
        loaderSlide: {
          "0%": { transform: "translateX(-110%)" },
          "100%": { transform: "translateX(260%)" },
        },
        popIn: {
          "0%": { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        sheetUp: {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
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
        "spin-orbit": "spin 1.8s linear infinite",
        "spin-slow": "spin 4.4s linear infinite",
        "spin-reverse": "spinReverse 2.7s linear infinite",
        "loader-slide": "loaderSlide 1.5s cubic-bezier(0.4,0,0.2,1) infinite",
        "pop-in": "popIn 0.2s cubic-bezier(0.22,1,0.36,1) both",
        "sheet-up": "sheetUp 0.28s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fadeIn 0.2s ease-out both",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(34,211,238,0.28), 0 18px 60px -18px rgba(6,182,212,0.5)",
        "glow-lg":
          "0 0 0 1px rgba(34,211,238,0.38), 0 26px 80px -20px rgba(6,182,212,0.55)",
        panel:
          "inset 0 1px 0 0 rgba(165,243,252,0.07), 0 28px 75px -38px rgba(0,0,0,0.92)",
      },
    },
  },
  plugins: [],
} satisfies Config;
