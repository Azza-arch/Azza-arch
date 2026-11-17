// DENAI V4 · shared "Hybrid RPG Platformer" interface (design/v4-ui/V4-KONSEP.md, Konsep 3).
// One module for Levels 1-1, 1-2 and 1-3:
//   • HUD plaque (level · coins) + journal button + pause; coin pulse "+1"
//   • area ribbon when entering a new area (2 s)
//   • quest pin (one-line objective) + Journal (objective, status, hints, cara kira, collection)
//   • portrait dialogue for story beats (typewriter, ▼, E/Space/Enter/tap, movement locked)
//   • gold "mission complete" stamp, short reward toast
//   • UI locks: while a dialogue / journal / panel is open the player does not move
// Gameplay, maths, saves and physics are untouched: levels keep their own quest state and
// keep writing the journal's #qt-* fields; #quest-tracker[hidden] now means "no active quest".
const $ = (id) => document.getElementById(id);
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const frame = () => document.querySelector('.game-frame');

// ── UI locks ──
export function lock(s, key) { (s.uiLocks ||= new Set()).add(key); }
export function unlock(s, key) { s.uiLocks?.delete(key); }
export const locked = (s) => !!s?.uiLocks?.size;

// ── HUD ──
// level: '1–3'; coins: collected this run; zone: current area name (ribbon on change);
// coll: collection line for the journal ("Syiling 6/22 · Rahsia 1/3").
export function hud(s, { level, coins, zone, coll }) {
  const area = $('hud-area'), c = $('hud-collection');
  if (area && area.textContent !== level) area.textContent = level;
  if (c) {
    const t = String(coins);
    if (c.textContent !== t) {
      const prev = s.__hudCoins;
      c.textContent = t; c.setAttribute('aria-label', `Syiling ${t}`);
      if (prev !== undefined && coins > prev) coinPop(c);
    }
    s.__hudCoins = coins;
  }
  if (zone && zone !== s.__hudZone) { const first = s.__hudZone === undefined; s.__hudZone = zone; areaRibbon(s, zone, first); }
  if (coll !== undefined) s.__coll = coll;
}
function coinPop(chip) {
  chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump');
  if (reduced()) return;
  const plus = document.createElement('span'); plus.className = 'v4-plus'; plus.textContent = '+1';
  chip.parentElement?.append(plus); setTimeout(() => plus.remove(), 700);
}
// Ribbon banner; re-entering the same area within 6 s does not replay it.
export function areaRibbon(s, name, force = false) {
  const t = $('zone-toast'); if (!t) return;
  const now = performance.now(); s.__ribbonAt ||= {};
  if (!force && now - (s.__ribbonAt[name] ?? -1e9) < 6000) return;
  s.__ribbonAt[name] = now;
  t.innerHTML = ''; const b = document.createElement('b'); b.textContent = name; t.append(b);
  clearTimeout(s.__ribbonTimer);
  t.classList.remove('show', 'play'); t.classList.add('area-banner'); void t.offsetWidth; t.classList.add('show', 'play');
  s.__ribbonTimer = setTimeout(() => t.classList.remove('show', 'play'), 2000);
  s.events?.once?.('shutdown', () => { clearTimeout(s.__ribbonTimer); t.classList.remove('show', 'play'); });
}

// ── Journal + quest pin ──
// Called by each level's tracker installer with the freshly built #quest-tracker.
export function decorateJournal(tr, s, { level }) {
  tr.setAttribute('role', 'dialog'); tr.setAttribute('aria-label', 'Jurnal misi');
  const top = document.createElement('div'); top.className = 'qt-top';
  top.innerHTML = `<b class="qt-title">Jurnal · Level ${level}</b><button type="button" id="qt-close" aria-label="Tutup jurnal">×</button>`;
  tr.prepend(top);
  const coll = document.createElement('p'); coll.id = 'qt-coll'; coll.className = 'qt-coll'; tr.append(coll);
  // Pin (one line) and the HUD journal button are created once per page.
  if (!$('quest-pin')) { const pin = document.createElement('button'); pin.type = 'button'; pin.id = 'quest-pin'; pin.hidden = true; pin.setAttribute('aria-label', 'Objektif semasa — buka Jurnal'); pin.innerHTML = '<span class="qp-mark">◆</span><span id="quest-pin-text"></span>'; frame()?.append(pin); }
  if (!$('journal-btn')) { const b = document.createElement('button'); b.type = 'button'; b.id = 'journal-btn'; b.className = 'hud-journal'; b.hidden = true; b.setAttribute('aria-label', 'Jurnal misi (J)'); b.innerHTML = '<span class="jb-icon" aria-hidden="true"></span><span class="jb-badge" hidden>!</span>'; $('pause')?.before(b); }
  const abort = new AbortController(), signal = abort.signal;
  s.events.once('shutdown', () => { abort.abort(); closeJournal(s); const p = $('quest-pin'); if (p) p.hidden = true; const j = $('journal-btn'); if (j) j.hidden = true; s.__pinText = undefined; });
  $('qt-close').addEventListener('click', () => closeJournal(s), { signal });
  $('quest-pin').addEventListener('click', () => openJournal(s), { signal });
  $('journal-btn').addEventListener('click', () => (document.body.classList.contains('journal-open') ? closeJournal(s) : openJournal(s)), { signal });
  // J toggles; Esc closes the journal before the pause menu sees it.
  window.addEventListener('keydown', (e) => {
    if (s.mode !== 'playing' || e.target.matches?.('input,select,textarea') || $('v4-dialog')?.classList.contains('open')) return;
    const open = document.body.classList.contains('journal-open');
    if (e.code === 'KeyJ' && !e.repeat) { e.preventDefault(); open ? closeJournal(s) : openJournal(s); }
    else if (e.code === 'Escape' && open) { e.preventDefault(); e.stopImmediatePropagation(); closeJournal(s); }
  }, { signal, capture: true });
}
export function openJournal(s) {
  if (s.mode !== 'playing') return;
  const tr = $('quest-tracker'); if (!tr) return;
  document.body.classList.add('journal-open'); lock(s, 'journal');
  const empty = tr.hidden; tr.classList.toggle('qt-empty', empty);
  $('qt-coll').textContent = s.__coll || '';
  $('journal-btn')?.querySelector('.jb-badge')?.setAttribute('hidden', '');
  $('qt-close')?.focus({ preventScroll: true });
}
export function closeJournal(s) {
  if (!document.body.classList.contains('journal-open')) return;
  document.body.classList.remove('journal-open'); unlock(s, 'journal');
  $('game')?.focus({ preventScroll: true });
}
// Per frame: pin = current objective; a changed objective flashes the pin and badges the journal.
export function syncJournal(s) {
  const tr = $('quest-tracker'), pin = $('quest-pin'), jb = $('journal-btn'); if (!tr || !pin) return;
  const playing = s.mode === 'playing';
  if (jb) jb.hidden = !playing;
  const active = playing && !tr.hidden;
  const text = active ? ($('qt-text')?.textContent || '') : '';
  const show = active && !!text && !document.body.classList.contains('journal-open') && !$('v4-dialog')?.classList.contains('open');
  if (pin.hidden === show) pin.hidden = !show;
  if (text !== s.__pinText) {
    const had = s.__pinText !== undefined && s.__pinText !== '';
    s.__pinText = text; $('quest-pin-text').textContent = text;
    pin.classList.toggle('done', /✓/.test(text));
    if (had && text) { pin.classList.remove('flash'); void pin.offsetWidth; pin.classList.add('flash'); jb?.querySelector('.jb-badge')?.removeAttribute('hidden'); }
  }
}

// ── Portrait dialogue ──
// pages: array of short strings (≤ 2–3 lines each). portrait: 'player' (Chill Boy),
// {npc: url} (an NPC's own portrait), or 'none' (sign icon fallback). Returns a Promise.
const queue = [];
export function dialogue(s, pages, { portrait = 'player' } = {}) {
  return new Promise((resolve) => { queue.push({ s, pages: pages.filter(Boolean), portrait, resolve }); if (queue.length === 1) runDialogue(); });
}
export const dialogueOpen = () => !!$('v4-dialog')?.classList.contains('open');
function ensureDialogDom() {
  let d = $('v4-dialog'); if (d) return d;
  d = document.createElement('div'); d.id = 'v4-dialog'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-live', 'polite'); d.hidden = true;
  d.innerHTML = '<div class="dlg-portrait" aria-hidden="true"></div><div class="dlg-box"><p class="dlg-text"></p><span class="dlg-cue" aria-hidden="true">▼</span><span class="dlg-help">E / Space / ketik untuk teruskan</span></div>';
  frame()?.append(d); return d;
}
function runDialogue() {
  const job = queue[0]; if (!job) return;
  const { s, pages, portrait, resolve } = job;
  if (!s.sys?.isActive?.() || !pages.length) { queue.shift(); resolve(); runDialogue(); return; }
  const d = ensureDialogDom(), text = d.querySelector('.dlg-text'), pt = d.querySelector('.dlg-portrait');
  pt.className = 'dlg-portrait ' + (portrait === 'player' ? 'pt-player' : portrait === 'none' ? 'pt-none' : 'pt-npc');
  pt.style.backgroundImage = portrait?.npc ? `url(${portrait.npc})` : '';
  lock(s, 'dialog'); document.body.classList.add('dialogue-open');
  d.hidden = false; d.classList.remove('open'); void d.offsetWidth; d.classList.add('open');
  let page = 0, typing = null, done = false;
  const show = () => {
    const full = pages[page]; clearInterval(typing); d.classList.remove('ready');
    if (reduced()) { text.textContent = full; d.classList.add('ready'); return; }
    let n = 0; text.textContent = '';
    typing = setInterval(() => { n += 2; text.textContent = full.slice(0, n); if (n >= full.length) { clearInterval(typing); typing = null; d.classList.add('ready'); } }, 22);
  };
  const finish = () => {
    if (done) return; done = true; clearInterval(typing); window.removeEventListener('keydown', onKey, true); d.removeEventListener('pointerdown', onTap);
    d.classList.remove('open'); document.body.classList.remove('dialogue-open');
    setTimeout(() => { d.hidden = !d.classList.contains('open') ? true : d.hidden; }, reduced() ? 0 : 160);
    // A short grace period so the key that closed the dialogue does not also jump or interact.
    setTimeout(() => { unlock(s, 'dialog'); queue.shift(); resolve(); runDialogue(); }, 140);
  };
  const advance = () => {
    if (typing) { clearInterval(typing); typing = null; text.textContent = pages[page]; d.classList.add('ready'); return; }
    if (++page < pages.length) show(); else finish();
  };
  const onKey = (e) => {
    if (!['KeyE', 'Space', 'Enter', 'NumpadEnter'].includes(e.code)) return;
    e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) advance();
  };
  const onTap = (e) => { e.preventDefault(); advance(); };
  window.addEventListener('keydown', onKey, true); d.addEventListener('pointerdown', onTap);
  s.events.once('shutdown', finish);
  show();
}

// ── Mission stamp & reward toast ──
export function stamp(text) {
  const f = frame(); if (!f) return;
  const el = document.createElement('div'); el.className = 'v4-stamp'; el.textContent = text; f.append(el);
  setTimeout(() => el.classList.add('fly'), reduced() ? 1200 : 1500);
  setTimeout(() => { el.remove(); $('journal-btn')?.querySelector('.jb-badge')?.removeAttribute('hidden'); }, reduced() ? 1400 : 2300);
}
export function reward(text) {
  const f = frame(); if (!f) return;
  f.querySelector('.v4-reward')?.remove();
  const el = document.createElement('div'); el.className = 'v4-reward'; el.textContent = text; f.append(el);
  setTimeout(() => el.remove(), 1900);
}
// Split a long note into dialogue pages at sentence ends (~110 characters per page).
export function pagesOf(text, max = 110) {
  const parts = text.match(/[^.!?]+[.!?]+["»”]?\s*|[^.!?]+$/g) || [text], pages = [];
  for (const p of parts.map((x) => x.trim()).filter(Boolean)) { if (pages.length && (pages.at(-1) + ' ' + p).length <= max) pages[pages.length - 1] += ' ' + p; else pages.push(p); }
  return pages;
}
