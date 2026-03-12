import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f9fafb',
        surface: '#ffffff',
        outline: '#d1d5db',
        ink: '#0f172a',
        muted: '#6b7280',
        accent: '#4f46e5',
        accentMuted: '#ede9fe'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'sans-serif']
      },
      boxShadow: {
        panel: '0 2px 8px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;
