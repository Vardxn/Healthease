/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f7f5',
          100: '#c4ebe6',
          200: '#96d8cf',
          300: '#64c4b7',
          400: '#36af9f',
          500: '#0f9d8b',
          600: '#0b7a75',
          700: '#0a605d',
          800: '#084d4c',
          900: '#063b3b',
        },
        accent: {
          50: '#fff4ed',
          100: '#ffe6d8',
          200: '#ffc8a8',
          300: '#ffad80',
          400: '#ff8f57',
          500: '#ff7043',
          600: '#ed5a2d',
          700: '#d9491c',
          800: '#b83b17',
          900: '#8c2b10',
        }
      }
    },
  },
  plugins: [],
}
