/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../DSA/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#fbbf24', // Accent Gold
          500: '#f59e0b',
          600: '#d97706',
        },
        teal: {
          400: '#00ffd1', // Neon Teal
          500: '#00e1b9',
        },
        cinema: {
          black: '#08080A',
          card: '#121216',
          border: '#1f1f26',
        }
      }
    },
  },
  plugins: [],
}
