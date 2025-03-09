/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-color': '#3485FA',
        'point-color': '#03369D',
        'background-color': '#041021',
        'modal-background-color': '#0D192B',
        'btn-primary-active-color': '#4D4D59',
        'btn-primary-inactive-color': '#2C2C35',
        'btn-red-color': '#F23636',
        'btn-green-color': '#00AC4F',
        'btn-yellow-color': '#FFBA2F',
        'btn-blue-color': '#076BFD',
        'text-main-color': '#FFFFFF',
        'text-inactive-color': '#E2E8F1',
        'text-inactive-2-color': '#5E6D84',
        'border-color': '#718096',
      },
    },
  },
  plugins: [],
};
