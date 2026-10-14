/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Cormorant Garamond'", 'Georgia', 'serif'],
        sans: ["'Jost'", '-apple-system', 'system-ui', 'sans-serif'],
        hebrew: ["'Frank Ruhl Libre'", 'serif'],
      },
      colors: {
        ink: '#14181d',
        paper: {
          DEFAULT: '#ecede8',
          hi: '#f6f6f2',
        },
        navy: '#161d25',
        'navy-2': '#202a34',
        gold: '#b08d4b',
        'gold-light': '#d4bc8a',
        muted: '#6e7a85',
        border: '#cdd0cb',
      },
    },
  },
  plugins: [],
}
