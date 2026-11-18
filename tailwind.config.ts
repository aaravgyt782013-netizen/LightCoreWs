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
          950: "rgb(var(--ink-950) / <alpha-value>)",
          900: "rgb(var(--ink-900) / <alpha-value>)",
          850: "rgb(var(--ink-850) / <alpha-value>)",
          800: "rgb(var(--ink-800) / <alpha-value>)",
          700: "rgb(var(--ink-700) / <alpha-value>)",
          600: "rgb(var(--ink-600) / <alpha-value>)",
          500: "rgb(var(--ink-500) / <alpha-value>)",
        },
        brand: {
          50: "rgb(var(--brand-50) / <alpha-value>)",
          100: "rgb(var(--brand-100) / <alpha-value>)",
          200: "rgb(var(--brand-200) / <alpha-value>)",
          300: "rgb(var(--brand-300) / <alpha-value>)",
          400: "rgb(var(--brand-400) / <alpha-value>)",
          500: "rgb(var(--brand-500) / <alpha-value>)",
          600: "rgb(var(--brand-600) / <alpha-value>)",
          700: "rgb(var(--brand-700) / <alpha-value>)",
          800: "rgb(var(--brand-800) / <alpha-value>)",
          900: "rgb(var(--brand-900) / <alpha-value>)",
          950: "rgb(var(--brand-950) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to right, rgb(var(--brand-300) / var(--grid-opacity, 0.048)) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--brand-300) / var(--grid-opacity, 0.048)) 1px, transparent 1px)",
        "brand-fade":
          "radial-gradient(60% 60% at 50% 0%, rgb(var(--brand-500) / 0.22) 0%, rgb(var(--brand-500) / 0) 72%)",
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
        glow: "0 0 0 1px rgb(var(--brand-400) / 0.28), 0 18px 60px -18px rgb(var(--brand-500) / 0.5)",
        "glow-lg":
          "0 0 0 1px rgb(var(--brand-400) / 0.38), 0 26px 80px -20px rgb(var(--brand-500) / 0.55)",
        panel:
          "inset 0 1px 0 0 rgb(var(--brand-200) / 0.07), 0 28px 75px -38px rgba(0,0,0,0.92)",
      },
    },
  },
  plugins: [],
} satisfies Config;
