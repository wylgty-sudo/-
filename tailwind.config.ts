import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        warm: '#FAF8F5',
        accent: '#F97316',
        'today-tag': '#FCA5A5',
        'backlog-tag': '#93C5FD',
        'inspiration-tag': '#C4B5FD',
        'material-tag': '#6EE7B7',
        'habit-tag': '#FCD34D',
        'text-main': '#1C1917',
        'text-muted': '#78716C',
      },
      borderRadius: {
        card: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
export default config
