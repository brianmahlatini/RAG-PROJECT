/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        body: ["IBM Plex Sans", "system-ui", "sans-serif"],
      },
      colors: {
        obsidian: "#0B0D10",
        carbon: "#111418",
        graphite: "#1A1F24",
        ember: "#E31937",
        ion: "#E8EEF5",
        fog: "#9AA4B2",
      },
      boxShadow: {
        glow: "0 0 35px rgba(227, 25, 55, 0.25)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.35 },
          "50%": { opacity: 0.7 },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        pulseSoft: "pulseSoft 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
