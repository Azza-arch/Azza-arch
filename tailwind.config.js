const fastGlob = require('fast-glob');

module.exports = {
  content: fastGlob.sync([
    'source/**/*.{blade.php,blade.md,md,html,vue}',
    '!source/**/_tmp/*', // exclude temporary files
  ], { dot: true }),
  theme: {
    extend: {
      mask: 'mask 1.5s ease-in-out forwards',
    },
    keyframes: {
      mask: {
        '0%': { clipPath: 'circle(0% at 50% 50%)' },
        '100%': { clipPath: 'circle(150% at 50% 50%)' },
      },
    },
  },
  plugins: [
    require('taos/plugin'),
  ],
  safelist: [
    '!duration-[0ms]',
    '!delay-[0ms]',
    'html.js :where([class*="taos:"]:not(.taos-init))',
  ],
};
