// Path: tailwind.config.ts
import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      backgroundColor: {
        background: "var(--background)",
        card: "var(--card)",
        primary: "var(--primary)",
        "primary-hover": "var(--primary-hover)",
        success: "var(--success)",
        "success-hover": "var(--success-hover)",
        danger: "var(--danger)",
        "danger-hover": "var(--danger-hover)",
      },
      textColor: {
        foreground: "var(--foreground)",
        muted: "var(--muted)",
      },
      borderColor: {
        border: "var(--border)",
      },
    },
  },
  plugins: [],
} satisfies Config;
