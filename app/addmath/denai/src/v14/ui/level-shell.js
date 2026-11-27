// The World 1 level shell for the level pages of World 2 and 3 (w2-l*.html, w3-l*.html): the same
// HUD plaque (level · coins), station pin + board (World 1's quest pin + journal), pause menu and
// victory card as main.html, driven by the page's own scene (window.__w2 / window.__w3).
// Looks come from World 1's ui-system.css + ui/v4.css; this file only wires behaviour.
const $ = (id) => document.getElementById(id);
const scene = () => (window.__w3 ?? window.__w2)?.scene;
const body = document.body;
body.dataset.mode = 'playing';

// ── pause (button, Esc, P) ──
function pause() {
  const s = scene(), d = $('paused');
  if (!s || s.mode !== 'playing' || d.open || $('complete')?.open) return;
  s.scene.pause(); body.dataset.mode = 'paused'; d.showModal(); $('resume').focus();
}
$('pause')?.addEventListener('click', pause);
$('resume')?.addEventListener('click', () => $('paused').close());
$('paused')?.addEventListener('close', () => {
  const s = scene(); if (s?.scene.isPaused()) s.scene.resume();
  if (body.dataset.mode === 'paused') body.dataset.mode = 'playing';
  $('w2-game')?.focus();
});
$('restart-checkpoint')?.addEventListener('click', () => { $('paused').close(); scene()?.respawn(); });
$('restart')?.addEventListener('click', () => {
  if (confirm('Mula semula level ini dari awal? Larian ini dibuang; rekod terbaik, syiling dan rahsia yang pernah ditemui kekal.')) location.href = `${location.pathname}?baru=1`;
});
$('fullscreen')?.addEventListener('click', () => {
  const d = document;
  if (d.fullscreenElement) d.exitFullscreen?.(); else d.documentElement.requestFullscreen?.().catch(() => {});
});
addEventListener('keydown', (e) => {
  if (e.target.closest?.('input,textarea')) return;
  if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && !$('paused')?.open && !$('complete')?.open) { e.preventDefault(); pause(); }
  if ((e.key === 'j' || e.key === 'J') && !$('paused')?.open) toggleBoard();
});
for (const b of document.querySelectorAll('[data-href]')) b.addEventListener('click', () => { location.href = b.dataset.href; });

// ── station pin + board (World 1's quest pin and journal) ──
function toggleBoard(force) {
  const on = force ?? !body.classList.contains('lv-board');
  body.classList.toggle('lv-board', on); $('journal-btn')?.setAttribute('aria-pressed', String(on));
}
$('journal-btn')?.addEventListener('click', () => toggleBoard());
$('quest-pin')?.addEventListener('click', () => toggleBoard(true));
const station = $('w2-station'), pinText = $('quest-pin-text');
if (station && pinText) new MutationObserver(() => {
  pinText.textContent = station.textContent;
  $('quest-pin').classList.toggle('done', /✓\s*$/.test(station.textContent));
}).observe(station, { childList: true, characterData: true, subtree: true });

// ── victory card (World 1's #complete) ──
const mmss = (ms) => { const t = Math.round(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
/** Fill and open the victory card. record = { newBest, bestMs } */
export function showVictory({ coins, coinsTotal, secrets, secretsTotal, ms, newBest, bestMs }) {
  $('completion-coins').textContent = `${coins}/${coinsTotal}`;
  $('completion-secrets').textContent = `${secrets}/${secretsTotal}`;
  $('completion-time').textContent = mmss(ms);
  $('completion-pb').textContent = newBest ? 'Rekod baharu!' : Number.isFinite(bestMs) ? `Masa terbaik: ${mmss(bestMs)}` : '';
  $('completion-pb').classList.toggle('is-record', !!newBest);
  toggleBoard(false); body.dataset.mode = 'complete';
  const d = $('complete'); d.showModal(); d.querySelector('.teaser .primary')?.focus();
  d.addEventListener('close', () => { body.dataset.mode = 'playing'; }, { once: true });
}
