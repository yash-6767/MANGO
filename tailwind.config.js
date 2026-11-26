/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'warm-beige': 'var(--bg-primary)',
        'light-cream': 'var(--bg-secondary)',
        'card-white': 'var(--bg-card)',
        'muted-beige': 'var(--bg-muted)',
        'sage': 'var(--sage)',
        'sage-soft': 'var(--sage-soft)',
        'sage-dark': 'var(--sage-dark)',
        'emerald-primary': 'var(--emerald-primary)',
        'emerald-deep': 'var(--emerald-deep)',
        'text-main': 'var(--text-main)',
        'text-secondary': 'var(--text-muted)',
        'border-beige': 'var(--border-color)',
        'status-success': 'var(--status-success)',
        'status-warning': 'var(--status-warning)',
        'status-danger': 'var(--status-danger)',
      },
    },
  },
  plugins: [],
};
