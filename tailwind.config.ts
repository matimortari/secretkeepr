import type { Config } from "tailwindcss"

export default <Partial<Config>>{
  darkMode: "class",
  theme: {
    fontFamily: {
      sans: ["Lato", "sans-serif"],
      goldman: ["Goldman", "sans-serif"],
      silkscreen: ["Silkscreen", "sans-serif"],
      mono: ["JetBrains Mono", "monospace"],
    },
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        overlay: {
          DEFAULT: "var(--overlay)",
          foreground: "var(--overlay-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          foreground: "var(--danger-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
        },
        accent: "var(--accent)",
        border: "var(--border)",
        input: "var(--input)",
      },
    },
  },
}
