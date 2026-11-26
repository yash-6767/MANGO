/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'warm-beige': '#F4F0E6',
        'light-cream': '#FAF8F2',
        'card-white': '#FFFFFF',
        'muted-beige': '#E6DDC8',
        'sage': '#A8B5A0',
        'sage-soft': '#DCE6D8',
        'sage-dark': '#5F7563',
        'emerald-primary': '#176B50',
        'emerald-deep': '#104C3A',
        'text-main': '#24332B',
        'text-secondary': '#68766C',
        'border-beige': '#DDDCCF',
      },
    },
  },
  plugins: [],
};
