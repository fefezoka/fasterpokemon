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
        bg: 'var(--bg)',
        green: 'var(--green)',
        white: 'var(--white)',
        red: 'var(--red)',
      },
    },
  },
  plugins: [],
};
