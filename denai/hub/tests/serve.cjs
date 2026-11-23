// Test helper: serves the repository from disk inside Playwright (request
// interception), so browser checks need no separate HTTP server process.
// Mimics Cloudflare Pages "pretty URLs": /path/main → /path/main.html, /dir/ → /dir/index.html.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const ORIGIN = 'https://denai.test'; // https: the page CSP has upgrade-insecure-requests
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg', '.wav': 'audio/wav' };

function resolve(urlPath) {
  let p = path.join(ROOT, decodeURIComponent(urlPath));
  if (!p.startsWith(ROOT)) return null;
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  else if (!fs.existsSync(p) && fs.existsSync(`${p}.html`)) p = `${p}.html`;
  return fs.existsSync(p) ? p : null;
}

async function attach(context) {
  await context.route(`${ORIGIN}/**`, (route) => {
    const file = resolve(new URL(route.request().url()).pathname);
    if (!file) return route.fulfill({ status: 404, body: 'not found' });
    route.fulfill({ status: 200, body: fs.readFileSync(file), contentType: TYPES[path.extname(file)] || 'application/octet-stream' });
  });
  // Allow Google Fonts (real typography in screenshots); block every other
  // third-party request (e.g. PlayFab) so tests never send data anywhere.
  const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;
  await context.route((u) => !u.href.startsWith(ORIGIN), (route) => (FONTS.test(route.request().url()) ? route.continue() : route.abort()));
}

module.exports = { ORIGIN, attach };
