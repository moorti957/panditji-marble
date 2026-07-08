/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: ["class"],

  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/pages/**/*.{js,jsx,ts,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        // ===========================
        // Custom Brand Colors
        // ===========================
        gold: "#D4AF37",
        "gold-dark": "#B8962E",
        "gold-light": "#E8D5A3",

        maroon: "#7B1E1E",
        "maroon-dark": "#5C1616",
        "deep-maroon": "#4A0F0F",

        ivory: "#FFFCF7",
        sand: "#F5EDDF",

        brown: "#6D4C41",
        "brown-light": "#8D6E63",
        "brown-dark": "#4A3428",

        black: "#1A1814",
        white: "#FFFFFF",

        // ===========================
        // shadcn/ui Compatibility
        // ===========================
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#D4AF37",

        background: "#FFFCF7",
        foreground: "#2D2A24",

        primary: {
          DEFAULT: "#D4AF37",
          foreground: "#FFFFFF",
        },

        secondary: {
          DEFAULT: "#7B1E1E",
          foreground: "#FFFFFF",
        },

        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },

        muted: {
          DEFAULT: "#F5EDDF",
          foreground: "#6D4C41",
        },

        accent: {
          DEFAULT: "#E8D5A3",
          foreground: "#2D2A24",
        },

        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#2D2A24",
        },

        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#2D2A24",
        },
      },

      fontFamily: {
        cinzel: ["var(--font-cinzel)", "serif"],
        inter: ["var(--font-inter)", "sans-serif"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      boxShadow: {
        gold: "0 12px 40px rgba(212,175,55,.25)",
      },

      keyframes: {
        float: {
          "0%,100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-12px)",
          },
        },

        shimmer: {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },

        "pulse-glow": {
          "0%,100%": {
            opacity: "0.5",
          },
          "50%": {
            opacity: "1",
          },
        },
      },

      animation: {
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },

  plugins: [require("tailwindcss-animate")],
};