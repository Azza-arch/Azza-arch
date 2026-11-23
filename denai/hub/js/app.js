// DENAI Learning Hub — app shell + hash router.
// Hash routes keep refresh/Back working on static hosting with no rewrites.
// Each page module exports `render(route)` → { title, nav, surface, html, mount? }.
import { icon, emptyState } from './ui.js';
import { GAME_URL, NOTES_APP_URL, GAME_LANDING_URL } from './data.js';

const PAGES = {
  '': () => import('./pages/home.js'),
  hub: () => import('./pages/hub.js'),
  bab: () => import('./pages/chapters.js'), // #/bab and #/bab/<id>
  nota: () => import('./pages/note.js'),
  latihan: () => import('./pages/exercise.js'),
  main: () => import('./pages/game.js'),
  kemajuan: () => import('./pages/progress.js'),
};

const NAV = [
  ['home', 'Utama', '#/', 'home'],
  ['hub', 'Hub', '#/hub', 'hub'],
  ['bab', 'Bab', '#/bab', 'book'],
  ['main', 'Main', '#/main', 'play'],
  ['kemajuan', 'Kemajuan', '#/kemajuan', 'chart'],
];

const $view = document.getElementById('view');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

export function parseRoute(hash = location.hash) {
  const raw = hash.replace(/^#\/?/, '');
  const [path, qs = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  return { name: parts[0] || '', params: parts.slice(1), query: new URLSearchParams(qs) };
}

function shell() {
  const links = (cls) => NAV.map(([key, label, href, ico]) => `<li><a class="${cls}" href="${href}" data-nav="${key}">${icon(ico)}<span>${label}</span></a></li>`).join('');
  document.getElementById('topnav').innerHTML = `<div class="wrap topnav-in">
      <a class="brand" href="#/" aria-label="DENAI Learning Hub, laman utama"><span class="brand-mark">DENAI</span><span class="brand-sub">Learning Hub</span></a>
      <nav aria-label="Navigasi utama"><ul class="navlinks">${links('')}</ul></nav>
      <a class="btn btn-primary nav-cta" href="${GAME_URL}">${icon('play')}Main DENAI</a>
    </div>`;
  document.getElementById('tabbar').innerHTML = `<ul>${links('')}</ul>`;
  document.getElementById('foot').innerHTML = `<div class="wrap foot-in">
      <p><b>DENAI Learning Hub</b> · Add Math KSSM Tingkatan 4 &amp; 5 · Prototaip antara muka</p>
      <p><a href="${NOTES_APP_URL}">Aplikasi Nota Add Math</a> · <a href="${GAME_LANDING_URL}">Laman game DENAI</a> · <a href="/">haziqbuilds</a></p>
      <p class="small">Senarai bab daripada DSKP KSSM Matematik Tambahan (KPM, 2018). Watak Chill Boy oleh Segel2D · Aset pixel oleh Kenney.</p>
    </div>`;
}

function setActive(nav) {
  document.querySelectorAll('[data-nav]').forEach((a) => {
    if (a.dataset.nav === nav) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

function animateBars(root) {
  const bars = root.querySelectorAll('.bar.is-pre');
  requestAnimationFrame(() => requestAnimationFrame(() => bars.forEach((b) => b.classList.remove('is-pre'))));
}

let io;
function reveal(root) {
  const els = root.querySelectorAll('[data-reveal]');
  if (reduced.matches || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  io?.disconnect();
  io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((e) => io.observe(e));
}

const notFound = () => ({
  title: 'Halaman tidak dijumpai', nav: '', surface: 'play',
  html: `<div class="wrap" style="padding-top:48px">${emptyState({ ico: 'flag', title: 'Halaman ini tidak wujud', text: 'Pautan mungkin lama atau salah taip.', actions: `<a class="btn btn-primary" href="#/hub">Ke Learning Hub</a><a class="btn btn-secondary" href="#/">Laman utama</a>` })}</div>`,
});

let first = true, seq = 0;
async function render() {
  const route = parseRoute();
  const my = ++seq;
  let page;
  try {
    const load = PAGES[route.name];
    page = load ? await (await load()).render(route) : notFound();
  } catch (err) {
    console.error('DENAI hub: page failed to render', err);
    page = { title: 'Ralat', nav: '', surface: 'play', html: `<div class="wrap" style="padding-top:48px">${emptyState({ ico: 'info', title: 'Halaman tidak dapat dibuka', text: 'Muat semula halaman atau kembali ke Learning Hub.', actions: `<a class="btn btn-primary" href="#/hub">Ke Learning Hub</a>` })}</div>` };
  }
  if (my !== seq) return; // a newer navigation won
  if (page.redirect) { location.replace(page.redirect); return; }
  document.title = `${page.title ? `${page.title} · ` : ''}DENAI Learning Hub`;
  document.body.classList.toggle('surface-read', page.surface === 'read');
  setActive(page.nav);
  $view.classList.remove('is-entering');
  $view.innerHTML = page.html;
  void $view.offsetWidth; // restart the entry animation
  $view.classList.add('is-entering');
  window.scrollTo(0, 0);
  page.mount?.($view, route);
  animateBars($view);
  reveal($view);
  // After an in-app navigation, move focus to the new page's h1 so screen readers announce it.
  if (!first) { const h = $view.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } else $view.focus({ preventScroll: true }); }
  first = false;
}

shell();
window.addEventListener('hashchange', render);
render();
