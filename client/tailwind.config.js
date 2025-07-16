/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Maven Pro', 'sans-serif'],
      },
      colors: {
        primary: "#001269",
        secondary: "#fed70e",
        accent: "#f5deb3",
        black: "#000000",
        white: "#ffffff",
        "blue-bg": "#f2f3f8",
      },
      screens: {
        xl1100: '1100px',
      },
    },
  },
  plugins: [],
}

