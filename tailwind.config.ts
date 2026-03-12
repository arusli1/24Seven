import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        accent: {
          DEFAULT: '#2563eb',
          soft: '#dbeafe'
        }
      },
      boxShadow: {
        card: '0 20px 40px rgba(15, 23, 42, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
