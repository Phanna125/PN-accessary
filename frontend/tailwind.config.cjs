/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        night: '#111128',
        ink: '#2a2b3b',
        blush: '#f6c8d8',
        peach: '#ffd8b5',
        mint: '#c9f4ea',
        lilac: '#dcd5ff',
        sky: '#cfe6ff',
      },
      boxShadow: {
        soft: '0 18px 40px rgba(124, 131, 255, 0.25)',
      },
    },
  },
  plugins: [],
};
