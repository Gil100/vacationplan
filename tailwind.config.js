/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'hebrew': ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
        'sans': ['Assistant', 'Heebo', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        vacation: {
          sunrise: '#fbbf24',
          ocean: '#06b6d4',
          sand: '#f59e0b',
          palm: '#10b981',
          sunset: '#f97316',
        }
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      lineHeight: {
        'hebrew': '1.7',
      },
      letterSpacing: {
        'hebrew': '0.01em',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-rtl'),
  ],
}