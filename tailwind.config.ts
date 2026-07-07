import type { Config } from "tailwindcss";

/**
 * Iron Milestones palette — "Vitruvian Man meets Encarta '96".
 * Saturated-but-muted military greens, gunmetal, parchment, antique gold,
 * and blood-red accents. High contrast against deep green-black grounds.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          950: "#0d130a",
          900: "#141c0f",
          800: "#1b2614",
          700: "#243219",
          600: "#2f4220",
          500: "#3d552a",
          400: "#567243",
        },
        gunmetal: {
          900: "#15181b",
          800: "#1d2125",
          700: "#262b30",
          600: "#32383f",
          500: "#454d56",
          400: "#5f6973",
          300: "#828d98",
        },
        parchment: {
          50: "#f5eeda",
          100: "#eee3c6",
          200: "#e2d2ab",
          300: "#d1bc8d",
          400: "#bda471",
          500: "#a68a58",
          600: "#8a6f44",
          700: "#6b5533",
        },
        gold: {
          bright: "#e0bc4a",
          DEFAULT: "#c9a227",
          dim: "#8a6d1d",
          dark: "#5f4c14",
        },
        blood: {
          bright: "#b04343",
          DEFAULT: "#8d2f2f",
          dark: "#5c1f1f",
        },
        steel: {
          bright: "#8fb0c9",
          DEFAULT: "#6b8aa3",
          dim: "#48607a",
        },
      },
      fontFamily: {
        // System stacks on purpose: zero network fetch, maximum period accuracy.
        serif: ["Georgia", "Palatino Linotype", "Book Antiqua", "Times New Roman", "serif"],
        sans: ["Verdana", "Segoe UI", "Tahoma", "Geneva", "sans-serif"],
      },
      boxShadow: {
        bevel:
          "inset 1px 1px 0 rgba(245,238,218,0.18), inset -1px -1px 0 rgba(0,0,0,0.55), 0 2px 6px rgba(0,0,0,0.45)",
        "bevel-in":
          "inset 1px 1px 3px rgba(0,0,0,0.6), inset -1px -1px 0 rgba(245,238,218,0.08)",
        plate: "0 4px 16px rgba(0,0,0,0.5), 0 1px 0 rgba(245,238,218,0.06)",
      },
      keyframes: {
        "unlock-in": {
          "0%": { transform: "scale(0.9) rotate(-1deg)", opacity: "0" },
          "60%": { transform: "scale(1.03) rotate(0.5deg)", opacity: "1" },
          "100%": { transform: "scale(1) rotate(0deg)", opacity: "1" },
        },
        "page-turn": {
          "0%": { transform: "perspective(900px) rotateY(-12deg)", opacity: "0" },
          "100%": { transform: "perspective(900px) rotateY(0deg)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "unlock-in": "unlock-in 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.2) both",
        "page-turn": "page-turn 0.4s ease-out both",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
