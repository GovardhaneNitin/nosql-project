/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nexus-purple': '#8B5CF6',
        'nexus-pink': '#EC4899',
      },
    },
  },
  plugins: [],
};