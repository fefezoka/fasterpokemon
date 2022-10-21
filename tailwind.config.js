/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{tsx,jsx}'],
  theme: {
    extend: {
      keyframes: {
        fade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
      animation: {
        fade: 'fade .66s ease',
      },
      colors: {
        white: 'var(--white)',
        green: 'var(--green)',
        red: 'var(--red)',
      },
    },
  },
  plugins: [],
};
