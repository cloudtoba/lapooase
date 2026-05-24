import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        paper: "#fbfaf7",
        fog: "#ece8df",
        ink: "#211f1a",
        muted: "#6b665d",
        tomato: "#d84b35",
        basil: "#3d6f45",
        saffron: "#f2b441",
        ocean: "#176b87"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 50px -32px rgba(33, 31, 26, 0.45)"
      }
    }
  },
  plugins: []
} satisfies Config;
