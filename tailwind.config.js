/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'navy': '#0f0f23',
        'navy-light': '#1e1e2e',
        'glass': 'rgba(255,255,255,0.1)',
        'accent': '#3b82f6',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};
