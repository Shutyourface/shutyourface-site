import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        tabloid: ["Impact", "Haettenschweiler", "Arial Narrow Bold", "sans-serif"],
        news: ["Georgia", "Times New Roman", "serif"],
      },
      boxShadow: {
        slash: "8px 8px 0 0 rgb(185 28 28)",
      },
    },
  },
  plugins: [],
};

export default config;
