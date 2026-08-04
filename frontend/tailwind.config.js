/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1b4332',
        'primary-light': '#2d6a4f',
        'accent': '#40916c',
        'fresh': '#52b788',
        'sage': '#d8f3dc',
        'mint-light': '#f0faf4',
        'pale': '#f7faf8',
        'dark': '#1c2420',
        'muted': '#55625b',
        'gold': '#ffb703',
        'glass': 'rgba(240, 250, 244, 0.88)',
        'glass-border': 'rgba(82, 183, 136, 0.15)',
        'border': 'rgba(45, 106, 79, 0.09)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 4px 12px rgba(27, 67, 50, 0.04)',
        'md': '0 12px 32px rgba(27, 67, 50, 0.08)',
        'lg': '0 24px 64px rgba(27, 67, 50, 0.14)',
      },
      borderRadius: {
        'lg': '28px',
        'md': '16px',
        'sm': '8px',
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'slide-down': 'slideDown 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
