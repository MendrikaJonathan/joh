/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  { DEFAULT: '#1A3C6E', light: '#2E75B6', dark: '#112848' },
        accent:   { DEFAULT: '#E67820', light: '#F59340' },
        success:  '#1E7A3C',
        danger:   '#C53030',
        warning:  '#D97706',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
