import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefaf8",
          100: "#d3f2ec",
          200: "#a8e5db",
          300: "#71d1c2",
          400: "#42b6a4",
          500: "#249a89",
          600: "#187b6e",
          700: "#0f766e",
          800: "#125049",
          900: "#0f423d",
        },
        cash: {
          500: "#d97706",
          600: "#b45309",
        },
        card: {
          500: "#4f46e5",
          600: "#4338ca",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 10px 0 rgb(15 118 110 / 0.08)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)",
      },
    },
  },
  plugins: [],
};
export default config;
