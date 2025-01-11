const fastGlob = require('fast-glob');

module.exports = {
  content: fastGlob.sync([
    'source/**/*.{blade.php,blade.md,md,html,vue}',
    '!source/**/_tmp/*', // exclude temporary files
  ], { dot: true }),
  theme: {
    extend: {},
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
