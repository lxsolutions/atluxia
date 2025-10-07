






/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'tablet': '640px',
        // Custom breakpoint for 7-10" tablets
        'large-tablet': '832px', // iPad Pro landscape
      },
      fontSize: {
        'xxl': ['2rem', { lineHeight: '2.5rem' }],
      }
    },
  },
  plugins: [],
};





