import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        "ohanashi-orange": {
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C"
        },
        "ohanashi-yellow": {
          50: "#FEFCE8",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FACC15",
          400: "#EAB308",
          500: "#CA8A04"
        }
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        pulseSoft: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" }
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        }
      },
      animation: {
        "float-slow": "float 4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 1.8s ease-in-out infinite",
        "bounce-soft": "bounceSoft 1.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

