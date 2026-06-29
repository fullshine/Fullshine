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
        brand: {
          50:  '#fef9ec',
          100: '#fdf0ca',
          200: '#fbde90',
          300: '#f8c64d',
          400: '#f5af1b',
          500: '#e9960d',
          600: '#ce7208',
          700: '#ab520a',
          800: '#8c4010',
          900: '#743511',
        },
        // Negro profundo — base del sitio
        midnight: {
          50:  '#f2f2f2',
          100: '#d9d9d9',
          200: '#b3b3b3',
          300: '#808080',
          400: '#4d4d4d',
          500: '#1a1a1a',
          600: '#141414',
          700: '#0e0e0e',
          800: '#080808',
          900: '#030303',
        },
        // Plata/cromo — para detalles metálicos
        chrome: {
          50:  '#ffffff',
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#d4d4d4',
          400: '#b8b8b8',
          500: '#9a9a9a',
          600: '#787878',
          700: '#585858',
          800: '#383838',
          900: '#1e1e1e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
