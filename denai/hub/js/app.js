// DENAI Learning Hub — app shell + hash router.
// Hash routes keep refresh/Back working on static hosting with no rewrites.
// Each page module exports `render(route)` → { title, nav, surface, html, mount? }.
import { icon, emptyState, esc } from './ui.js';
import { NOTES_APP_URL, GAME_LANDING_URL } from './data.js';
import { store, isDemoMode } from './core/store.js';
import { HUB } from './core/keys.js';

const PAGES = {
  '': () => import('./pages/home.js'),
  hub: () => import('./pages/hub.js'),
  bab: () => import('./pages/chapters.js'), // #/bab and #/bab/<id>
  nota: () => import('./pages/note.js'),
  latihan: () => import('./pages/exercise.js'),
  main: () => import('./pages/game.js'),
  kemajuan: () => import('./pages/progress.js'),
};

// Exactly four primary destinations (owner decision D12). The landing page #/
// is reached from the logo; it is not a tab.
const NAV = [
  ['hub', 'Utama', '#/hub', 'home'],
  ['bab', 'Belajar', '#/bab', 'book'],
  ['main', 'Game', '#/main', 'gamepad'],
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
      <a class="brand" href="#/" aria-label="DENAI Learning Hub, halaman pengenalan"><span class="brand-mark">DENAI</span><span class="brand-sub">Learning Hub</span></a>
      <nav aria-label="Navigasi utama"><ul class="navlinks">${links('')}</ul></nav>
    </div>`;
  document.getElementById('tabbar').innerHTML = `<ul>${links('')}</ul>`;
  document.getElementById('foot').innerHTML = `<div class="wrap foot-in">
      <p><b>DENAI Learning Hub</b> · Matematik Tambahan KSSM Tingkatan 4 &amp; 5</p>
      <p><a href="${NOTES_APP_URL}">Aplikasi Nota Add Math</a> · <a href="${GAME_LANDING_URL}">Laman game DENAI</a> · <a href="/">haziqbuilds</a></p>
      <p class="small">Senarai bab daripada DSKP KSSM Matematik Tambahan (KPM, 2018). Watak Chill Boy oleh Segel2D · Aset pixel oleh Kenney.</p>
    </div>`;
}

// Mode banner: demo mode is impossible to miss; a real learner whose browser
// blocks storage is told progress will not be kept.
async function modeBanner() {
  const el = document.getElementById('modebar');
  if (store.demo) {
    const { PERSONAS, getPersona } = await import('./demo.js');
    const cur = getPersona();
    el.innerHTML = `<div class="wrap modebar-in"><span class="tag tag-demo">Mod demo</span><span class="modebar-text"><strong>Data contoh, bukan rekod pelajar sebenar.</strong> Tiada apa-apa disimpan.</span>
      <span class="seg seg-sm" role="group" aria-label="Pelajar contoh">${Object.entries(PERSONAS).map(([k, l]) => `<button type="button" data-persona="${k}" aria-pressed="${k === cur}">${esc(l)}</button>`).join('')}</span>
      <a class="modebar-exit" href="?demo=0${esc(location.hash)}">Keluar mod demo</a></div>`;
    el.hidden = false;
    el.querySelectorAll('[data-persona]').forEach((b) => b.addEventListener('click', async () => {
      const { setPersona, seedDemo } = await import('./demo.js');
      setPersona(b.dataset.persona); await seedDemo(); await modeBanner(); render();
    }));
  } else if (!store.persistent) {
    el.innerHTML = `<div class="wrap modebar-in"><span class="modebar-text"><strong>Kemajuan tidak dapat disimpan.</strong> Pelayar ini menyekat storan, jadi kemajuan hilang apabila halaman ditutup.</span></div>`;
    el.hidden = false;
  } else el.hidden = true;
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
  html: `<div class="wrap" style="padding-top:48px">${emptyState({ ico: 'flag', title: 'Halaman ini tidak wujud', text: 'Pautan mungkin lama atau salah taip.', actions: `<a class="btn btn-primary" href="#/hub">Ke Utama</a><a class="btn btn-quiet" href="#/bab">Belajar</a>` })}</div>`,
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
    page = { title: 'Ralat', nav: '', surface: 'play', html: `<div class="wrap" style="padding-top:48px">${emptyState({ ico: 'info', title: 'Halaman tidak dapat dibuka', text: 'Muat semula halaman atau kembali ke Learning Hub.', actions: `<a class="btn btn-primary" href="#/hub">Ke Utama</a>` })}</div>` };
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
  // Review content (owner preview, ?semak=1) is always flagged as unpublished.
  if (page.preview) $view.insertAdjacentHTML('afterbegin', `<div class="preview-flag" role="note"><div class="wrap"><b>Pratonton semakan.</b> Kandungan ini sedang disemak dan belum diterbitkan kepada pelajar.</div></div>`);
  page.mount?.($view, route);
  animateBars($view);
  reveal($view);
  // After an in-app navigation, move focus to the new page's h1 so screen readers announce it.
  if (!first) { const h = $view.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); } else $view.focus({ preventScroll: true }); }
  first = false;
}

async function start() {
  shell();
  if (isDemoMode()) { const { seedDemo } = await import('./demo.js'); await seedDemo(); }
  await modeBanner();
  window.addEventListener('hashchange', render);
  // Another tab recorded progress: refresh overview pages (never mid-exercise or mid-note).
  window.addEventListener('storage', (e) => { if (e.key === HUB.progress && !store.demo && ['hub', 'bab', 'kemajuan'].includes(parseRoute().name)) render(); });
  render();
}
start();
