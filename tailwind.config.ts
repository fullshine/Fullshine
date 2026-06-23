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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
