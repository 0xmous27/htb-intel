/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        neon: '#00ff99',
        dark: '#0a0a0a',
        panel: '#111111',
        border: '#1a1a1a',
        red: '#ff3333',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
