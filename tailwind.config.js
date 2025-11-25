/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Premium Dark Mode Color System
        green: {
          400: '#22c55e',
          500: '#1DB954', // Spotify Green
          600: '#1aa34a',
        },
        // Re-map 'pink' to a more vivid, unified primary palette
        pink: {
          50: '#fff0f6',
          100: '#ffd6e8',
          200: '#ffadd0',
          300: '#ff85b7',
          400: '#ff4d98',
          500: '#ff2d8f',
          600: '#e61f79',
          700: '#b5175f',
          800: '#871245',
          900: '#5a0b2b'
        },
        // Accent cyan for highlights
        cyan: {
          50: '#f0feff',
          100: '#cffafe',
          200: '#99f6ff',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#075985',
          800: '#05364f',
          900: '#02202b'
        },
        // Provide friendly named tokens used in CSS variables
        primary: {
          DEFAULT: '#1DB954',
          600: '#1aa34a'
        },
        accent: {
          DEFAULT: '#06b6d4',
          600: '#0891b2'
        },
        panel: {
          DEFAULT: '#121212'
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
};