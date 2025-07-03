/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9f7',
          100: '#d6ede9',
          200: '#b4d6d2',
          300: '#8fb1a8',
          400: '#6f9084',
          500: '#476457',
          600: '#20342b',
          700: '#1a2c25',
          800: '#15231e',
          900: '#111c18',
          950: '#0a100e',
        },
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        sage: {
          50: '#f3f7f6',
          100: '#dce7e4',
          200: '#b4d6d2',
          300: '#8fb1a8',
          400: '#6f9084',
          500: '#476457',
          600: '#3a5348',
          700: '#2e423a',
          800: '#20342b',
          900: '#192821',
          950: '#0f1a16',
        },
        secondary: {
          50: '#f0f6fb',
          100: '#dbe8f5',
          200: '#bdd4eb',
          300: '#9bbcde',
          400: '#7993ae',
          500: '#65809b',
          600: '#4f6883',
          700: '#3e526a',
          800: '#324256',
          900: '#293647',
          950: '#1a2330',
        },
        healthcare: {
          trust: '#16a34a',
          security: '#22c55e',
          warning: '#ea580c',
          error: '#dc2626',
        },
        orange: {
          500: '#dc6014',
          600: '#c45512',
          700: '#a94810',
        },
        gray: {
          300: '#a9a8ae',
          400: '#8d8c93',
          500: '#6f6e74',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        medical: ['Source Sans Pro', 'system-ui', 'sans-serif'],
        display: ['Recoleta Bold', 'Cooper Black', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-subtle': 'bounceSubtle 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        }
      }
    },
  },
  plugins: [],
};