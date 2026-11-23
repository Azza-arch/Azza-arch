// DEMO DATA — for UI demonstration only. Not connected to any account, server
// or to the game's own saves. Every screen that shows it carries a
// "Data contoh" label. Replace getProfile() with a real source later; the page
// code only depends on the shape returned here.
import { chapter } from './data.js';

const KEY = 'denai-hub-demo-v1';
export const STATES = { baharu: 'Pelajar Baharu', kembali: 'Pelajar Kembali' };

export function getDemoState() {
  try { const v = localStorage.getItem(KEY); return v in STATES ? v : 'baharu'; } catch { return 'baharu'; }
}
export function setDemoState(v) {
  try { localStorage.setItem(KEY, v in STATES ? v : 'baharu'); } catch { /* storage blocked: state lasts for this view only */ }
}

const NEW = {
  state: 'baharu',
  current: null,
  notesRead: {},
  chaptersDone: [],
  exercises: [],
  game: {},
  activity: [],
};

const RETURNING = {
  state: 'kembali',
  current: { chapter: 't4-2', sub: '2.2' },
  notesRead: { 't4-1': ['1.1', '1.2', '1.3'], 't4-2': ['2.1'] },
  chaptersDone: ['t4-1'],
  exercises: [
    { chapter: 't4-2', sub: '2.1', score: 2, total: 5, when: 'Semalam' },
    { chapter: 't4-1', sub: '1.3', score: 3, total: 5, when: '3 hari lalu' },
    { chapter: 't4-1', sub: '1.2', score: 5, total: 5, when: '4 hari lalu' },
    { chapter: 't4-1', sub: '1.1', score: 4, total: 5, when: '5 hari lalu' },
  ],
  game: { '1-1': 'done', '1-2': 'done', '1-3': 'todo' },
  activity: [
    { type: 'ex', chapter: 't4-2', sub: '2.1', text: 'Latihan · skor 2/5', when: 'Semalam' },
    { type: 'note', chapter: 't4-2', sub: '2.1', text: 'Nota dibaca', when: 'Semalam' },
    { type: 'game', level: '1-2', text: 'Level 1-2 selesai', when: '3 hari lalu' },
    { type: 'ex', chapter: 't4-1', sub: '1.3', text: 'Latihan · skor 3/5', when: '3 hari lalu' },
  ],
};

export const getProfile = () => (getDemoState() === 'kembali' ? RETURNING : NEW);

/** Learner state of a chapter: soon | done | progress | ready. */
export function chapterState(p, id) {
  const c = chapter(id);
  if (!c?.available) return 'soon';
  if (p.chaptersDone.includes(id)) return 'done';
  if (p.current?.chapter === id || p.notesRead[id]?.length) return 'progress';
  return 'ready';
}
export function chapterPct(p, id) {
  const c = chapter(id); if (!c) return 0;
  const read = p.notesRead[id]?.length || 0;
  return c.standards.length ? Math.round((read / c.standards.length) * 100) : 0;
}
export const noteRead = (p, id, sub) => !!p.notesRead[id]?.includes(sub);
export const lastExercise = (p, id, sub) => p.exercises.find((e) => e.chapter === id && e.sub === sub) || null;

/** The single next action the hub recommends. */
export function nextAction(p) {
  if (p.state === 'baharu') return { kind: 'note', chapter: 't4-1', sub: '1.1', why: 'Mulakan dengan konsep paling asas: apa itu fungsi, objek dan imej.' };
  const weak = p.exercises.find((e) => e.score / e.total < 0.6);
  if (weak) return { kind: 'ex', chapter: weak.chapter, sub: weak.sub, why: `Skor latihan ${weak.sub} ialah ${weak.score}/${weak.total}. Cuba sekali lagi sebelum meneruskan.` };
  return { kind: 'note', chapter: p.current.chapter, sub: p.current.sub, why: 'Sambung dari tempat anda berhenti.' };
}
