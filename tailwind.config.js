/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#edf7f2',
          100: '#d0eade',
          200: '#a5d4be',
          300: '#72b89a',
          400: '#4d9e7a',
          500: '#2d7a5a',
          600: '#1a5c45',
          700: '#124030',
          800: '#0d3024',
          900: '#081f18',
        },
      },
    },
  },
  plugins: [],
}
