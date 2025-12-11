/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#783C91',
          light: '#EBBCFE',
          dark: '#3F214C',
        },
        gold: {
          DEFAULT: '#DB9400',
          light: '#F0C469',
          dark: '#755002',
        },
        secondary: {
          DEFAULT: '#90789B',
          light: '#F0E2F6',
          dark: '#4D3857',
        },
        yellow: {
          DEFAULT: '#D9CF00',
          light: '#F0EA69',
          dark: '#464530',
        },
        red: {
          DEFAULT: '#B3261E',
          light: '#FFAEAA',
          dark: '#780E08',
        },
        purple: {
          hover: '#AA86B9',
        },
        grey: {
          light: '#CFCFCF',
          disabled: '#DFDFDF',
        },
        text: {
          primary: '#1E002B',
          secondary: '#676767',
          disabled: '#676767',
        },
      },
    },
  },
  plugins: [],
}

