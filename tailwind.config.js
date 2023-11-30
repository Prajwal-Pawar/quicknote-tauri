/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  // for markdown to work/render perfectly
  plugins: [require("@tailwindcss/typography")],
  darkMode: "class",
};
