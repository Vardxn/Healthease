/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'heading': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          50: '#e6f7f5',
          100: '#c4ebe6',
          200: '#96d8cf',
          300: '#64c4b7',
          400: '#36af9f',
          500: 'var(--primary)',
          600: 'var(--primary-hover)',
          700: '#0a605d',
          800: '#084d4c',
          900: '#063b3b',
        },
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        card: 'var(--card)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        border: 'var(--border)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      borderRadius: {
        'custom': 'var(--radius-custom)',
      },
      boxShadow: {
        'custom': 'var(--shadow-custom)',
        'hover': 'var(--shadow-hover)',
      },
      transitionProperty: {
        'custom': 'var(--transition-custom)',
      }
    },
  },
  plugins: [],
}
