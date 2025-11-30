import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lavender: "#C9BBFF",
        sky: "#A9D8FF",
        peach: "#FFD4C2",
        mint: "#CFFFE3",
        charcoal: "#2A2A2A",
        offwhite: "#FAFAFA",
        warning: "#FFE57F",
        success: "#7CFFC4",
        error: "#FF8E94",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
        heading: ["var(--font-sora)", "Sora", "sans-serif"],
      },
      borderRadius: {
        brand: "16px",
      },
      boxShadow: {
        brand: "0 8px 24px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
        soft: "0 4px 12px rgba(0,0,0,0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
