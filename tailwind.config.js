/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#071D34',
          deep: '#051624',
          mid: '#0E2C4A',
          soft: '#16344F',
        },
        lime: {
          DEFAULT: '#7CCB00',
          bright: '#9BE51A',
          light: '#EAF7D6',
          soft: '#F1FAE0',
          dark: '#4C7B00',
        },
        offwhite: '#F5F7F3',
        ink: '#122B44',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(7, 29, 52, 0.05), 0 4px 16px rgba(7, 29, 52, 0.05)',
        lift: '0 10px 30px rgba(7, 29, 52, 0.12)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out both',
        'fade-in': 'fadeIn 0.4s ease-out both',
        'pulse-soft': 'pulseSoft 2.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};