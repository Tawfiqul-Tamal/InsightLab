import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        glass: {
          bg: 'rgba(255, 255, 255, 0.08)',
          border: 'rgba(255, 255, 255, 0.16)',
          hover: 'rgba(255, 255, 255, 0.14)',
        },
      },
      animation: {
        'float-slow': 'floatSlow 14s ease-in-out infinite',
        'float-reverse': 'floatReverse 18s ease-in-out infinite',
        'float-drift': 'floatDrift 16s ease-in-out infinite',
      },
      keyframes: {
        floatSlow: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(35px, -45px) scale(1.08)' },
        },
        floatReverse: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(-40px, 35px) scale(0.94)' },
        },
        floatDrift: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(25px, 40px) scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
