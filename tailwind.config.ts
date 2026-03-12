import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--bg-base))',
        surface: 'rgb(var(--surface))',
        outline: 'rgb(var(--border))',
        ink: 'rgb(var(--ink))',
        muted: 'rgb(var(--ink-muted))',
        accent: 'rgb(var(--accent))',
        'accent-hover': 'rgb(var(--accent-hover))',
        accentMuted: 'rgb(var(--accent-muted))',
        'accent-soft': 'rgb(var(--accent-soft))',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        display: ['Syne', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)',
        'panel-lg': '0 1px 0 rgba(255,255,255,0.06), 0 8px 40px rgba(0,0,0,0.5)',
        glow: '0 0 60px rgba(34, 211, 238, 0.15)',
        'glow-amber': '0 0 40px rgba(251, 191, 36, 0.2)',
        'inner-soft': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
      borderRadius: {
        card: '12px',
        pill: '9999px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
