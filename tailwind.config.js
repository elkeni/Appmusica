/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        // Echo Music Design System
        echo: {
          bg: {
            primary: '#1a1d2e',
            secondary: '#0f1117',
            sidebar: 'rgba(13, 15, 26, 0.95)',
            card: '#1e2139',
          },
          accent: {
            DEFAULT: '#4f9cf9',
            primary: '#4f9cf9',
            secondary: '#667085',
            hover: 'rgba(79, 156, 249, 0.1)',
          },
          text: {
            primary: '#ffffff',
            secondary: '#b4b8c5',
          },
          border: {
            subtle: 'rgba(255, 255, 255, 0.05)',
          }
        },
        // Keep some legacy colors for compatibility
        green: {
          400: '#4f9cf9',
          500: '#4f9cf9',
          600: '#3d8ae6',
        },
        primary: {
          DEFAULT: '#4f9cf9',
          600: '#3d8ae6'
        },
        accent: {
          DEFAULT: '#4f9cf9',
          600: '#3d8ae6'
        },
        panel: {
          DEFAULT: '#0f1117'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      spacing: {
        'sidebar': '240px',
        'player': '90px',
        'header': '80px',
      }
    },
  },
  plugins: [],
};