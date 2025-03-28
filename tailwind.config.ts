import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FFF9F5',
          100: '#FFF5ED',
          200: '#FFE5D6',
          300: '#FFD4BC',
          400: '#FFC3A2',
          500: '#FFB288',
          600: '#FFA16E',
          700: '#FF9054',
          800: '#FF7F3A',
          900: '#FF6E20',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [],
}
export default config 