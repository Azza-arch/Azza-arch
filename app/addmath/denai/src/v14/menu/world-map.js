// World Map page (main menu → PETA DUNIA). A full page over the game frame,
// not a small modal: pixel-art map + level panel on desktop; world cards +
// full-screen level panel on phones. Reads progress via ./progress.js only;
// launching is delegated to the existing launchers in game.js.
import {WORLDS,STATUS,worldOneLevels} from './progress.js';

const $ = (id) => document.getElementById(id);
const LABEL = {
  [STATUS.COMPLETED]: 'Selesai', [STATUS.IN_PROGRESS]: 'Dalam perjalanan', [STATUS.AVAILABLE]: 'Tersedia',
  [STATUS.LOCKED]: 'Dikunci', [STATUS.COMING_SOON]: 'Akan datang',
};
const fmt = (ms) => { const s = Math.round(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };

export function installWorldMap({ launch, localPreview = false, onOpen, onClose }) {
  const page = $('world-map-page'), canvas = $('wm-canvas'), cards = $('wm-worlds'), panel = $('wm-panel');
  let selected = 'w1', levels = [];

  function worldSummary(w) {
    if (w.state !== 'playable') return w.state === 'development' ? 'Dalam pembangunan' : 'Akan datang';
    const done = levels.filter((l) => l.completions > 0).length, open = levels.filter((l) => l.unlocked).length;
    return `Selesai ${done}/${levels.length} · Tersedia ${open}/${levels.length}`;
  }
  function levelRow(l) {
    const li = el('li', `wm-level st-${l.status}`);
    li.append(el('span', 'wm-num', l.num));
    const info = el('div', 'wm-info'); info.append(el('b', 'wm-title', l.title));
    const chip = el('span', `wm-chip st-${l.status}`, LABEL[l.status]); info.append(chip);
    const notes = [];
    if (l.completions > 0) notes.push(`Selesai ×${l.completions}`);
    if (l.best) notes.push(`Rekod ${fmt(l.best)}`);
    if (l.status === STATUS.LOCKED && l.requires) notes.push(`Selesaikan Level ${l.requires} dahulu`);
    if (notes.length) info.append(el('small', 'wm-note', notes.join(' · ')));
    li.append(info);
    const acts = el('div', 'wm-actions');
    const btn = (text, mode, primary) => { const b = el('button', primary ? 'primary' : 'secondary', text); b.type = 'button'; b.dataset.level = l.id; b.dataset.mode = mode; acts.append(b); return b; };
    if (l.status === STATUS.IN_PROGRESS) { btn('Sambung', 'continue', true); if (l.completions > 0) btn('Main semula', 'replay'); }
    else if (l.status === STATUS.COMPLETED) btn('Main semula', 'replay', true);
    else if (l.status === STATUS.AVAILABLE) btn('Main', 'play', true);
    else { const b = btn('Dikunci', 'none'); b.disabled = true; }
    li.append(acts); return li;
  }
  function renderPanel() {
    const w = WORLDS.find((q) => q.id === selected);
    panel.replaceChildren();
    const back = el('button', 'wm-panel-back', '← Semua dunia'); back.type = 'button'; back.addEventListener('click', () => page.classList.remove('show-panel'));
    panel.append(back, el('p', 'wm-kicker', `Dunia ${w.num} · ${w.topic}`), el('h3', 'wm-world-name', w.name), el('p', 'wm-world-sum', worldSummary(w)));
    const list = el('ol', 'wm-levels');
    if (w.state === 'playable') levels.forEach((l) => list.append(levelRow(l)));
    else if (w.levels) w.levels.forEach(([id, num, title]) => list.append(levelRow({ id, num, title, status: STATUS.COMING_SOON, completions: 0 })));
    else list.append(el('li', 'wm-empty', 'Level untuk dunia ini belum dibina.'));
    if (w.state === 'development') panel.append(el('p', 'wm-dev', 'Dunia 2 sedang dibina. Level belum boleh dimain.'));
    panel.append(list);
  }
  function renderNodes() {
    canvas.querySelectorAll('.wm-node').forEach((n) => n.remove());
    for (const w of WORLDS) {
      const b = el('button', `wm-node wm-${w.state}${w.id === selected ? ' is-selected' : ''}`); b.type = 'button'; b.dataset.world = w.id;
      b.style.left = `${w.node[0]}%`; b.style.top = `${w.node[1]}%`;
      b.setAttribute('aria-label', `Dunia ${w.num}: ${w.name}. ${worldSummary(w)}`);
      b.append(el('span', 'wm-badge', w.num), el('span', 'wm-tag', w.name), el('small', 'wm-tag-sub', worldSummary(w)));
      canvas.append(b);
    }
    cards.replaceChildren();
    for (const w of WORLDS) {
      const c = el('button', `wm-card wm-${w.state}${w.id === selected ? ' is-selected' : ''}`); c.type = 'button'; c.dataset.world = w.id;
      c.append(el('span', 'wm-badge', w.num), el('b', null, w.name), el('small', null, `${w.topic} · ${worldSummary(w)}`));
      cards.append(c);
    }
  }
  function render() { levels = worldOneLevels({ localPreview }); renderNodes(); renderPanel(); }
  function select(id, showPanel) { selected = id; render(); if (showPanel) page.classList.add('show-panel'); }

  page.addEventListener('click', (e) => {
    const w = e.target.closest('[data-world]'); if (w) { select(w.dataset.world, true); return; }
    const b = e.target.closest('button[data-level]'); if (b && !b.disabled && b.dataset.mode !== 'none') { close(); launch(b.dataset.level, b.dataset.mode); }
  });
  $('wm-back').addEventListener('click', () => close(true));
  function open() { selected = 'w1'; render(); page.classList.remove('show-panel'); page.hidden = false; document.body.classList.add('world-map-open'); onOpen?.(); requestAnimationFrame(() => $('wm-back').focus({ preventScroll: true })); }
  function close(toMenu) { if (page.hidden) return; page.hidden = true; document.body.classList.remove('world-map-open'); onClose?.(toMenu); }
  return { open, close, isOpen: () => !page.hidden, render };
}
