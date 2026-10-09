/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'theme-primary': '#F99C44',
        'theme-secondary': '#255D77',
        'theme-danger': '#DB492D',
        'theme-light': '#F4F0ED',
        'theme-muted': '#939EA2',
        
        // POS Page vibrant palette (matching the uploaded image)
        'theme-orange': '#FE9F43',
        'theme-navy': '#092C4C',
        'theme-teal': '#0E9384',
        'theme-blue': '#155EEF',
        'theme-orange-light': '#FFF6EE',
        'theme-white': '#FFFFFF',
        'theme-gray-light': '#F8F9FA',
        'theme-gray-border': '#E5E7EB',
        'theme-gray-text': '#667085',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Arial', 'Open Sans', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
