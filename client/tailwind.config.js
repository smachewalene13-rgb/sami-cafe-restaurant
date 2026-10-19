/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf5ef',
          100: '#f1e4d3',
          200: '#e3cbb0',
          300: '#d0ad87',
          400: '#ad7c58',
          500: '#8b5a3c',
          600: '#7a4a2e',
          700: '#6b3e26',
          800: '#4f2b1a',
          900: '#3b2315',
          950: '#26160c',
        },
        leaf: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          500: '#2f6b4f',
          600: '#285a42',
          700: '#1e4633',
          800: '#173627',
          900: '#0e2319',
        },
        gold: {
          100: '#fef3c7',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        cream: '#f7efe5',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -1px rgba(107, 62, 38, 0.08), 0 1px 4px -1px rgba(107, 62, 38, 0.04)',
        'warm': '0 10px 25px -5px rgba(107, 62, 38, 0.12), 0 8px 10px -6px rgba(107, 62, 38, 0.06)',
        'warm-lg': '0 20px 35px -10px rgba(107, 62, 38, 0.18), 0 10px 15px -5px rgba(107, 62, 38, 0.08)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.3)',
        'glow-leaf': '0 0 25px -5px rgba(47, 107, 79, 0.35)',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
