module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
        gradientMove: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
      },
      animation: {
        ripple: 'ripple 1s ease-out forwards',
        gradientMove: 'gradientMove 6s ease infinite',
      },
      colors: {
        orange: {
          600: '#F98A37',
          500: '#b2b2b2',
        },
        purple: {
          700: '#7E3B92',
          800: '#6E2A82',
        }
      },
      boxShadow: {
        'custom-shadow': '0px 0px 2px 10px #222',
      },
    },
  },
  plugins: [],
}
