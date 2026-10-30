/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#07090e',
        surface: {
          DEFAULT: '#0d111a',
          secondary: '#131926',
          tertiary: '#1a2233',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        electric: {
          cyan: '#38bdf8',
          blue: '#3b82f6',
          violet: '#818cf8',
          purple: '#a855f7'
        },
        blocker: {
          DEFAULT: '#ef4444',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.35)'
        },
        ready: {
          DEFAULT: '#10b981',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)'
        },
        progress: {
          DEFAULT: '#38bdf8',
          bg: 'rgba(56, 189, 248, 0.12)',
          border: 'rgba(56, 189, 248, 0.35)'
        },
        critical: {
          DEFAULT: '#f59e0b',
          glow: 'rgba(245, 158, 11, 0.4)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(56, 189, 248, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(129, 140, 248, 0.3)',
        'glow-danger': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
        'glow-critical': '0 0 25px -5px rgba(245, 158, 11, 0.45)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate'
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(56, 189, 248, 0.2)' },
          '100%': { boxShadow: '0 0 25px rgba(56, 189, 248, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
