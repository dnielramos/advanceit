import { addDynamicIconSelectors } from '@iconify/tailwind'

export const content = [
  "./src/**/*.{html,ts}",
]
export const theme = {
  extend: {
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(3)', opacity: '0' },
        },
      },
      animation: {
        ripple: 'ripple 1s ease-out forwards',
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
}
export const plugins = [
  addDynamicIconSelectors()
]
