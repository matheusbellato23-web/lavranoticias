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
        primary: {
          DEFAULT: '#0038a8',
          dark: '#00287a',
          light: '#eff6ff',
          foreground: '#ffffff',
        },
        'primary-foreground': '#ffffff',
        accent: {
          DEFAULT: '#c8102e',
          dark: '#9b0b23',
          light: '#fef2f2',
          foreground: '#ffffff',
        },
        'accent-foreground': '#ffffff',
        'blue-royal': {
          DEFAULT: '#0038a8',
          dark: '#00297a',
          light: '#eff6ff',
        },
        foreground: '#0f172a',
        background: '#ffffff',
        border: '#e2e8f0',
        card: '#ffffff',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        'navy-footer': '#0f172a',
        'editorial-black': '#0f172a',
      },
      fontFamily: {
        display: ['var(--font-archivo-black)', 'sans-serif'],
        serif: ['var(--font-source-serif)', 'serif'],
        sans: ['var(--font-archivo)', 'sans-serif'],
        archivo: ['var(--font-archivo)', 'sans-serif'],
        'archivo-black': ['var(--font-archivo-black)', 'sans-serif'],
        'source-serif': ['var(--font-source-serif)', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
