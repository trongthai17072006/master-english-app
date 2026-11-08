/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#E9DCC2',
          secondary: '#F1E7D3',
          aged: '#DCC9A8',
          dark: '#C9B38E',
        },
        ink: {
          DEFAULT: '#181614',
          secondary: '#51483D',
          muted: '#796B59',
          border: '#493B2D',
        },
        editorial: {
          red: '#C92532',
          dark: '#991D27',
          light: '#E8B7AC',
        },
      },
      fontFamily: {
        headline: ['"Anton"', '"Bebas Neue"', '"Oswald"', 'sans-serif'],
        bebas: ['"Bebas Neue"', '"Anton"', '"Oswald"', 'sans-serif'],
        oswald: ['"Oswald"', '"DM Sans"', 'sans-serif'],
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        editorial: ['"Playfair Display"', 'Georgia', 'serif'],
        heading: ['"Oswald"', '"Playfair Display"', 'sans-serif'],
        sans: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        body: ['"DM Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        ui: ['"DM Sans"', '"Oswald"', 'sans-serif'],
        handwriting: ['"Caveat"', 'cursive', 'serif'],
      },
    },
  },
  plugins: [],
};
