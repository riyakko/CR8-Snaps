/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        velvet: {
          50: '#fdf2f2',
          400: '#c0392b',
          500: '#a52a2a',
          600: '#8b1a1a',
          700: '#6e1212',
          800: '#4f0b0b',
          900: '#2e0505',
          950: '#1a0303',
        },
        gold: {
          300: '#f7de9a',
          400: '#f0c75e',
          500: '#d9a93a',
          600: '#b08621',
        },
        cream: '#fbf3e0',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        marquee: ['"Abril Fatface"', '"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        marquee: '0 0 24px rgba(240,199,94,.55), 0 0 60px rgba(240,199,94,.25)',
        ticket: '0 10px 30px rgba(0,0,0,.45)',
      },
      keyframes: {
        flash: {
          '0%': { opacity: '0' },
          '10%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        pop: {
          '0%': { transform: 'scale(.5)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        sway: {
          '0%,100%': { transform: 'skewX(0deg)' },
          '50%': { transform: 'skewX(.6deg)' },
        },
        rise: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bulb: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '.35' },
        },
        spot: {
          '0%,100%': { opacity: '.55', transform: 'translateX(-50%) scale(1)' },
          '50%': { opacity: '.8', transform: 'translateX(-50%) scale(1.06)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        flash: 'flash .55s ease-out forwards',
        pop: 'pop .45s cubic-bezier(.2,.9,.3,1.3) both',
        sway: 'sway 7s ease-in-out infinite',
        rise: 'rise .6s ease-out both',
        bulb: 'bulb 1.6s ease-in-out infinite',
        spot: 'spot 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
