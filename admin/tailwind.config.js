/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/app/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/components/**/*.{js,jsx,ts,tsx,mdx}",
    "./src/modules/**/*.{js,jsx,ts,tsx,mdx}",
  ],

  theme: {
    extend: {
      colors: {
        "admin-primary": "#D4AF37",
        "admin-secondary": "#8B5E3C",
        "admin-bg": "#F8F8F8",
        "admin-card": "#FFFFFF",
        "admin-text": "#111827",
        "admin-secondary-text": "#374151",
        "admin-label": "#1F2937",
        "admin-description": "#4B5563",
        "admin-muted": "#6B7280",
        "admin-border": "#D1D5DB",
        "admin-hover": "#F3F4F6",
        "admin-success": "#16A34A",
        "admin-danger": "#DC2626",
        "admin-warning": "#F59E0B",
        "admin-info": "#3B82F6",
        ivory: "#F8F8F8",
        sand: "#F3F4F6",

        brown: "#111827",
        "brown-light": "#4B5563",
        "brown-dark": "#FFFFFF",

        gold: "#D4AF37",
        "gold-light": "#E8D5A3",
        "gold-dark": "#B8962E",

        maroon: "#7B1E1E",
        "deep-maroon": "#7B1E1E",
        "maroon-dark": "#5C1616",
        "maroon-light": "#A04040",

        "premium-black": "#1A1814",
      },

      fontFamily: {
        inter: ["Inter", "sans-serif"],
        cinzel: ["Cinzel", "serif"],
      },

      boxShadow: {
        gold: "0 12px 40px rgba(201,168,76,.25)",
      },
    },
  },

  plugins: [],
};
