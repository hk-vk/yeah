/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        malayalam: ['Manjari', 'sans-serif'],
        display: ['Righteous', 'cursive'],
      },
      animation: {
        'gradient': 'gradient 8s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 20s linear infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradient: {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        glow: {
          'from': {
            'box-shadow': '0 0 20px theme(colors.blue.400 / 20%)',
          },
          'to': {
            'box-shadow': '0 0 30px theme(colors.blue.400 / 40%)',
          }
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
            'animation-timing-function': 'ease-in-out',
          },
          '50%': {
            transform: 'translateY(-20px)',
            'animation-timing-function': 'ease-in-out',
          }
        },
        'pulse-glow': {
          '0%': {
            opacity: 0.4,
            filter: 'brightness(1) blur(8px)',
          },
          '100%': {
            opacity: 0.8,
            filter: 'brightness(1.2) blur(12px)',
          }
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
