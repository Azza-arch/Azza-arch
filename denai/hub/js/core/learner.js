// Learner view model: everything the pages show about the student, derived
// from the store's events (real record, or the in-memory sample in demo mode).
import { store } from './store.js';
import { outcomes, levelFor, poolOf, rank } from './mastery.js';
import { CHAPTERS, chapter, loadChapter, questionPool } from '../data.js';

const key = (ch, sub) => `${ch}/${sub}`;

export function whenText(iso) {
  const d = new Date(iso), today = new Date();
  const day = (x) => Date.UTC(x.getFullYear(), x.getMonth(), x.getDate());
  const diff = Math.round((day(today) - day(d)) / 86400000);
  if (diff <= 0) return 'Hari ini';
  if (diff === 1) return 'Semalam';
  if (diff < 7) return `${diff} hari lalu`;
  return d.toLocaleDateString('ms-MY', { day: 'numeric', month: 'short' });
}

export async function getLearner() {
  const { events, active } = store.state();
  const notesDone = new Map(), opened = new Set(), attemptsBy = new Map();
  let last = null;
  for (const e of events) {
    const k = key(e.ch, e.sub);
    if (e.t === 'note-done') notesDone.set(k, e.at);
    if (e.t === 'note-open') opened.add(k);
    if (e.t === 'attempt') { if (!attemptsBy.has(k)) attemptsBy.set(k, []); attemptsBy.get(k).push(e); }
    if (e.t === 'note-open' || e.t === 'attempt' || e.t === 'note-done') last = { ch: e.ch, sub: e.sub, kind: e.t === 'attempt' ? 'ex' : 'note', at: e.at };
  }
  const sets = events.filter((e) => e.t === 'set-done').reverse();

  // Mastery needs each subtopic's pool → load only chapters that have attempts.
  const touched = [...new Set([...attemptsBy.keys()].map((k) => k.split('/')[0]))];
  const loaded = new Map();
  await Promise.all(touched.map(async (id) => { const ch = await loadChapter(id); if (ch) loaded.set(id, ch); }));
  const levels = new Map(), results = new Map();
  for (const [k, list] of attemptsBy) {
    const [chId, sub] = k.split('/'); const ch = loaded.get(chId); if (!ch) continue;
    const res = outcomes(list); results.set(k, res);
    levels.set(k, levelFor(res, poolOf(questionPool(ch, sub))));
  }

  const level = (ch, sub) => levels.get(key(ch, sub)) || 'belum';
  const noteDone = (ch, sub) => notesDone.has(key(ch, sub));
  const touchedChapter = (id) => [...opened, ...notesDone.keys(), ...attemptsBy.keys()].some((k) => k.startsWith(`${id}/`));

  function chapterSummary(c) {
    const subs = c.standards.map((s) => s.code);
    const mastered = subs.filter((s) => rank(level(c.id, s)) >= rank('faham')).length;
    const notes = subs.filter((s) => noteDone(c.id, s)).length;
    const state = !c.available ? 'soon' : mastered === subs.length ? 'done' : touchedChapter(c.id) ? 'progress' : 'ready';
    return { state, mastered, notes, total: subs.length, pct: subs.length ? Math.round((mastered / subs.length) * 100) : 0 };
  }

  const activeList = Object.entries(active).map(([k, a]) => { const [ch, sub] = k.split('/'); return { ch, sub, ...a }; })
    .filter((a) => chapter(a.ch)?.available).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));

  function nextAction() {
    if (activeList.length) { const a = activeList[0]; return { kind: 'resume', ch: a.ch, sub: a.sub, why: `Anda berhenti di soalan ${a.results.length + 1} daripada ${a.qids.length}. Sambung dari situ.` }; }
    if (!last) return { kind: 'note', ch: 't4-1', sub: '1.1', why: 'Mulakan dengan konsep paling asas: apa itu fungsi, objek dan imej.' };
    const c = chapter(last.ch);
    if (!noteDone(last.ch, last.sub)) return { kind: 'note', ch: last.ch, sub: last.sub, why: 'Sambung nota yang anda buka kali terakhir.' };
    if (rank(level(last.ch, last.sub)) < rank('faham')) return { kind: 'ex', ch: last.ch, sub: last.sub, why: `Kukuhkan ${last.sub} dengan latihan sehingga tahap Faham.` };
    const nextSub = c.standards.find((s) => !noteDone(c.id, s.code) || rank(level(c.id, s.code)) < rank('faham'));
    if (nextSub) return { kind: noteDone(c.id, nextSub.code) ? 'ex' : 'note', ch: c.id, sub: nextSub.code, why: `Langkah seterusnya dalam Bab ${c.number}.` };
    const nextCh = CHAPTERS.find((x) => x.available && chapterSummary(x).state !== 'done');
    return nextCh ? { kind: 'note', ch: nextCh.id, sub: nextCh.standards[0].code, why: `Bab ${c.number} dikuasai. Teruskan ke Bab ${nextCh.number}.` } : { kind: 'ex', ch: last.ch, sub: last.sub, why: 'Semua bab yang tersedia dikuasai. Ulang latihan untuk kekal mahir.' };
  }

  const recent = events.filter((e) => e.t === 'note-done' || e.t === 'set-done').slice(-6).reverse();
  const available = CHAPTERS.filter((c) => c.available);
  const totals = {
    notesDone: [...notesDone.keys()].filter((k) => chapter(k.split('/')[0])?.available).length,
    notesTotal: available.reduce((n, c) => n + c.standards.length, 0),
    faham: [...levels.values()].filter((l) => rank(l) >= rank('faham')).length,
    chaptersDone: available.filter((c) => chapterSummary(c).state === 'done').length,
    chaptersAvailable: available.length,
    sets: sets.length,
  };

  return {
    demo: store.demo, persistent: store.persistent, hasActivity: events.length > 0,
    last, sets, recent, totals, level, noteDone, chapterSummary, nextAction, results: (ch, sub) => results.get(key(ch, sub)) || [],
    active: (ch, sub) => active[key(ch, sub)] || null,
  };
}
