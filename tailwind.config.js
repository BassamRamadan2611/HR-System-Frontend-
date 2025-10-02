/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8', // Blue
        secondary: '#059669', // Green
        accent: '#B91C1C', // Red
      },
    },
  },
  plugins: [],
};