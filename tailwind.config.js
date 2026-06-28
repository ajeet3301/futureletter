/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#11162B",
        surface: "#1B2142",
        paper: "#F4F1E8",
        mist: "#9AA3C4",
        seal: "#E8B958",
        sealdark: "#C9943F",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      keyframes: {
        twinkle: {
          "0%, 100%": { opacity: "0.15" },
          "50%": { opacity: "0.8" },
        },
        seal: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        twinkle: "twinkle 4s ease-in-out infinite",
        seal: "seal 0.4s ease-in-out",
      },
    },
  },
  plugins: [],
};
