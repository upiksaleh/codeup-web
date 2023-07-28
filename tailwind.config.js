const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#0d9488',
      },
      // container: {
      //   padding: {
      //     DEFAULT: '1rem',
      //     sm: '2rem',
      //     lg: '4rem',
      //     xl: '5rem',
      //     '2xl': '6rem',
      //   },
      // },

      fontFamily: {
        default: ['var(--font-inter)', ...fontFamily.sans],
        heading: ['var(--font-heading)', ...fontFamily.sans],
        cal: ['var(--font-cal)', ...fontFamily.sans],
        title: ['var(--font-title)', ...fontFamily.sans],
        intro: ['var(--font-intro)', ...fontFamily.sans],
        lato: ['var(--font-lato)', ...fontFamily.sans],
        raleway: ['var(--font-raleway)', ...fontFamily.sans],
        mono: ['Consolas', ...fontFamily.mono],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
