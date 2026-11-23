// Shared view helpers for the DENAI Learning Hub. Pure string builders, so every
// page stays plain HTML + ES modules (no framework, no build step).

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Small inline icon set (24px grid, stroke = currentColor).
const P = {
  home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/>',
  hub: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/>',
  book: '<path d="M4 5.5A2 2 0 0 1 6 3.5h13v15H6a2 2 0 0 0-2 2z"/><path d="M4 20.5v-15"/><path d="M8.5 8h6.5"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  chart: '<path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="6" rx=".8"/><rect x="10.5" y="7" width="3" height="10" rx=".8"/><rect x="15.5" y="4" width="3" height="13" rx=".8"/>',
  left: '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  right: '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  arrow: '<path d="M4.5 12h14"/><path d="m13 6 6 6-6 6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3z"/>',
  pencil: '<path d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5z"/><path d="M13.5 7l3 3"/>',
  list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="4.75" cy="6.5" r="1"/><circle cx="4.75" cy="12" r="1"/><circle cx="4.75" cy="17.5" r="1"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r=".8"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5.5"/><path d="M12 7.6v.1"/>',
  flag: '<path d="M5 21V4"/><path d="M5 4.5h11l-2 4 2 4H5"/>',
  gamepad: '<rect x="2.5" y="7" width="19" height="11" rx="5"/><path d="M7.5 10.5v4M5.5 12.5h4"/><circle cx="15.5" cy="11.5" r=".9"/><circle cx="17.8" cy="13.8" r=".9"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14.5-4.5L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 14.5 4.5L20 16"/><path d="M20 20v-4h-4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4.5 20.5a7.5 7.5 0 0 1 15 0"/>',
};
export const icon = (name, label = '') =>
  `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${label ? ` role="img" aria-label="${esc(label)}"` : ' aria-hidden="true"'}>${P[name] || ''}</svg>`;

/** Breadcrumbs: items = [[label, href], …, [label]] (last item is the current page). */
export function crumbs(items) {
  return `<nav aria-label="Laluan"><ol class="crumbs">${items.map(([label, href], i) =>
    i === items.length - 1 || !href ? `<li><span aria-current="page">${esc(label)}</span></li>` : `<li><a href="${href}">${esc(label)}</a></li>`).join('')}</ol></nav>`;
}

export const tag = (text, kind = '', ico = '') => `<span class="tag${kind ? ` tag-${kind}` : ''}">${ico ? icon(ico) : ''}${esc(text)}</span>`;

/** Availability + learner state → tag. */
export function stateTag(state) {
  switch (state) {
    case 'done': return tag('Dikuasai', 'done', 'check');
    case 'progress': return tag('Sedang belajar', 'progress', 'clock');
    case 'soon': return tag('Dalam penyediaan', 'soon', 'lock');
    default: return tag('Tersedia', 'ready');
  }
}

/** Progress bar; animates from 0 on first paint (see app.js#animateBars). */
export const bar = (pct, { gold = false, small = false, label = '' } = {}) =>
  `<div class="bar is-pre${gold ? ' is-gold' : ''}${small ? ' bar-sm' : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(pct)}"${label ? ` aria-label="${esc(label)}"` : ''} style="--v:${Math.max(0, Math.min(100, pct))}"><i></i></div>`;

/** Mastery level badge (levels from core/mastery.js). */
const MASTERY = { belum: 'Belum mula', mencuba: 'Mencuba', faham: 'Faham', mahir: 'Mahir' };
export const masteryTag = (lv) => `<span class="mastery mastery-${lv in MASTERY ? lv : 'belum'}"><i aria-hidden="true"></i>${MASTERY[lv] || MASTERY.belum}</span>`;
export const masteryKey = () => `<p class="mastery-key"><span>Tahap penguasaan:</span>${Object.keys(MASTERY).map(masteryTag).join('')}</p>`;

/** Where the learner's record lives — shown on progress screens. */
export const storageNote = (l) => (l.demo ? '' : l.persistent
  ? '<p class="small muted">Kemajuan disimpan dalam pelayar ini sahaja. Jika data pelayar dipadam atau anda bertukar peranti, kemajuan bermula semula.</p>'
  : '<p class="small muted">Pelayar ini menyekat storan: kemajuan tidak disimpan selepas halaman ditutup.</p>');

export const emptyState = ({ ico = 'info', title, text = '', actions = '' }) =>
  `<div class="empty">${icon(ico)}<h3>${esc(title)}</h3>${text ? `<p>${text}</p>` : ''}${actions ? `<div class="btn-row">${actions}</div>` : ''}</div>`;

export const journeyCompact = (here) => {
  const steps = [['fahami', 'Fahami'], ['ulang', 'Ulang kaji'], ['latih', 'Latih'], ['main', 'Main'], ['jejak', 'Jejak']];
  return `<ol class="journey-compact" aria-label="Perjalanan pembelajaran">${steps.map(([k, l]) => `<li${k === here ? ' class="is-here" aria-current="step"' : ''}>${l}</li>`).join('')}</ol>`;
};

export const LEVEL = { mudah: 'Asas', sederhana: 'Sederhana', mencabar: 'Cabaran' };
