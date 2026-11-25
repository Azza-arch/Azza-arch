// DEMO MODE ONLY (?demo=1). Builds a SAMPLE learner as ordinary learning events
// so demo screens go through exactly the same code as real ones. The sample
// lives in memory (store.useDemo) — it is never written to, or mixed with, the
// real record in localStorage. Every demo screen shows a "Mod demo" banner.
import { HUB } from './core/keys.js';
import { store } from './core/store.js';
import { EVENT_VERSION } from './core/events.js';
import { loadChapter, questionPool } from './data.js';

export const PERSONAS = { baharu: 'Pelajar Baharu', kembali: 'Pelajar Kembali' };

export function getPersona() {
  try { const v = localStorage.getItem(HUB.demoPersona); return v in PERSONAS ? v : 'baharu'; } catch { return 'baharu'; }
}
export function setPersona(v) {
  try { localStorage.setItem(HUB.demoPersona, v in PERSONAS ? v : 'baharu'); } catch { /* storage blocked */ }
}

const ago = (days, minutes = 0) => { const d = new Date(); d.setDate(d.getDate() - days); d.setHours(17, 0, 0, 0); d.setMinutes(d.getMinutes() + minutes); return d.toISOString(); };
const ORDER = { mudah: 0, sederhana: 1, mencabar: 2 };

async function practice(ch, sub, days, pattern, set) {
  const c = await loadChapter(ch);
  const pool = questionPool(c, sub).slice().sort((a, b) => ORDER[a.difficulty] - ORDER[b.difficulty]);
  const qs = pool.slice(0, pattern.length), out = [];
  qs.forEach((q, i) => {
    const base = { v: EVENT_VERSION, t: 'attempt', ch, sub, q: q.id, set, sp: q.sp || [], diff: q.difficulty, type: q.type };
    const kind = pattern[i];
    out.push({ ...base, at: ago(days, i * 2), try: 1, ok: kind === 'first' });
    if (kind !== 'first') out.push({ ...base, at: ago(days, i * 2 + 1), try: 2, ok: kind === 'second' });
  });
  const first = pattern.slice(0, qs.length).filter((k) => k === 'first').length, right = pattern.slice(0, qs.length).filter((k) => k !== 'miss').length;
  out.push({ v: EVENT_VERSION, t: 'set-done', at: ago(days, 12), ch, sub, set, total: qs.length, first, right });
  return out;
}
const note = (t, ch, sub, days, m = 0) => ({ v: EVENT_VERSION, t, ch, sub, at: ago(days, m) });

async function returningEvents() {
  const ok5 = ['first', 'first', 'first', 'first', 'second'];
  return [
    note('note-open', 't4-1', '1.1', 6), note('note-done', 't4-1', '1.1', 6, 20), ...await practice('t4-1', '1.1', 6, ok5, 'demo-s1'),
    note('note-open', 't4-1', '1.2', 5), note('note-done', 't4-1', '1.2', 5, 25), ...await practice('t4-1', '1.2', 5, ['first', 'first', 'first', 'second', 'first'], 'demo-s2'),
    note('note-open', 't4-1', '1.3', 3), note('note-done', 't4-1', '1.3', 3, 25), ...await practice('t4-1', '1.3', 3, ['first', 'first', 'first', 'miss', 'first'], 'demo-s3'),
    note('note-open', 't4-2', '2.1', 1), note('note-done', 't4-2', '2.1', 1, 30), ...await practice('t4-2', '2.1', 1, ['first', 'miss', 'second', 'miss', 'miss'], 'demo-s4'),
    note('note-open', 't4-2', '2.2', 1, 60),
  ];
}

/** Seed the in-memory demo record for the chosen persona. */
export async function seedDemo() {
  store.useDemo(getPersona() === 'kembali' ? await returningEvents() : []);
}
