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
        ink: '#2a2a2a',
        paper: '#faf7f2',
        navy: '#1e2d4e',
        gold: '#c9a84c',
        'gold-light': '#e8d5a3',
        muted: '#7a7068',
      },
    },
  },
  plugins: [],
}
