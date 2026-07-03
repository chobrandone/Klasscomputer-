import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#CC0000',
          dark: '#990000',
          light: '#FF3333',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F5F5F5',
          dark: '#0A0A0A',
          'dark-secondary': '#141414',
          'dark-card': '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        sm: '4px',
        DEFAULT: '8px',
        lg: '16px',
      },
      boxShadow: {
        sm: '0 1px 4px rgba(0,0,0,0.08)',
        DEFAULT: '0 2px 12px rgba(0,0,0,0.12)',
        lg: '0 8px 32px rgba(0,0,0,0.18)',
        'dark-glow': '0 2px 16px rgba(204,0,0,0.15)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease both',
        'slide-in-right': 'slide-in-right 0.3s ease both',
        marquee: 'marquee 30s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
