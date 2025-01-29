/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{html,js}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        'earth_yellow': { DEFAULT: '#eeaf61', 100: '#3d2406', 200: '#7a490d', 300: '#b76d13', 400: '#e89025', 500: '#eeaf61', 600: '#f2bf81', 700: '#f5cfa1', 800: '#f8dfc0', 900: '#fcefe0' }, 
        'atomic_tangerine': { DEFAULT: '#fc9062', 100: '#451601', 200: '#8a2b03', 300: '#cf4104', 400: '#fa611f', 500: '#fc9062', 600: '#fca783', 700: '#fdbda2', 800: '#fed3c1', 900: '#fee9e0' }, 
        'bright_pink_(crayola)': { DEFAULT: '#ee5c6c', 100: '#3c060d', 200: '#780d19', 300: '#b41326', 400: '#e82139', 500: '#ee5c6c', 600: '#f17e8b', 700: '#f59ea8', 800: '#f8bec5', 900: '#fcdfe2' },
        'mulberry': { DEFAULT: '#ce4992', 100: '#2c0c1e', 200: '#59183b', 300: '#852359', 400: '#b12f77', 500: '#ce4992', 600: '#d86ea9', 700: '#e292be', 800: '#ecb6d4', 900: '#f5dbe9' },
       'munsell_blue' : '#3891A6',
   },
   animation: {
    "audio-line": "audio-line 1s infinite ease-in-out",
    slideInUp: 'slideInUp 0.3s ease-out forwards',

  },
  keyframes: {
    "audio-line": {
      "0%, 100%": { transform: "scaleY(1)" },
      "50%": { transform: "scaleY(2)" },
    },
    slideInUp: {
      "0%": { transform: "translateY(100%)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" },
    },
  },
    },
  },
  plugins: [],
}
