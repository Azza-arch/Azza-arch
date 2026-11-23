// Learner view model: everything the pages show about the student, derived
// from the store's events (real record, or the in-memory sample in demo mode).
import { store } from './store.js';
import { outcomes, evidence, poolOf, rank } from './mastery.js';
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
  const notesDone = new Map(), opened = new Map(), attemptsBy = new Map(), hintsBy = new Map();
  let last = null;
  for (const e of events) {
    const k = key(e.ch, e.sub);
    if (e.t === 'note-done') notesDone.set(k, e.at);
    if (e.t === 'note-open') opened.set(k, e.at);
    if (e.t === 'hint') hintsBy.set(k, (hintsBy.get(k) || 0) + 1);
    if (e.t === 'attempt') { if (!attemptsBy.has(k)) attemptsBy.set(k, []); attemptsBy.get(k).push(e); }
    if (e.t === 'note-open' || e.t === 'attempt' || e.t === 'note-done') last = { ch: e.ch, sub: e.sub, kind: e.t === 'attempt' ? 'ex' : 'note', at: e.at };
  }
  const sets = events.filter((e) => e.t === 'set-done').reverse();

  // Mastery needs each subtopic's pool → load only chapters that have attempts.
  const touched = [...new Set([...attemptsBy.keys()].map((k) => k.split('/')[0]))];
  const loaded = new Map();
  await Promise.all(touched.map(async (id) => { const ch = await loadChapter(id); if (ch) loaded.set(id, ch); }));
  const levels = new Map(), results = new Map(), evid = new Map(), lastAttempt = new Map();
  for (const [k, list] of attemptsBy) {
    const [chId, sub] = k.split('/'); const ch = loaded.get(chId); if (!ch) continue;
    const res = outcomes(list); results.set(k, res);
    const ev = evidence(res, poolOf(questionPool(ch, sub)));
    evid.set(k, ev); levels.set(k, ev.level); lastAttempt.set(k, list[list.length - 1].at);
  }

  const level = (ch, sub) => levels.get(key(ch, sub)) || 'belum';
  /** Evidence for one subtopic, or null when it has no attempts yet. */
  const evidenceOf = (ch, sub) => evid.get(key(ch, sub)) || null;
  const noteDone = (ch, sub) => notesDone.has(key(ch, sub));
  const touchedChapter = (id) => [...opened.keys(), ...notesDone.keys(), ...attemptsBy.keys()].some((k) => k.startsWith(`${id}/`));

  function chapterSummary(c) {
    const subs = c.standards.map((s) => s.code);
    const mastered = subs.filter((s) => rank(level(c.id, s)) >= rank('faham')).length;
    const notes = subs.filter((s) => noteDone(c.id, s)).length;
    const state = !c.available ? 'soon' : mastered === subs.length ? 'done' : touchedChapter(c.id) ? 'progress' : 'ready';
    return { state, mastered, notes, total: subs.length, pct: subs.length ? Math.round((mastered / subs.length) * 100) : 0 };
  }

  const activeList = Object.entries(active).map(([k, a]) => { const [ch, sub] = k.split('/'); return { ch, sub, ...a }; })
    .filter((a) => chapter(a.ch)?.available && (a.results.length > 0 || a.cur?.try === 2)).sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)));

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

  /** The recommended step inside one chapter (same order as nextAction). */
  function chapterNext(c) {
    const subs = c.standards.map((x) => x.code);
    const resume = activeList.find((a) => a.ch === c.id);
    if (resume) return { kind: 'resume', ch: c.id, sub: resume.sub, why: `Anda berhenti di soalan ${resume.results.length + 1} daripada ${resume.qids.length}.` };
    const unread = subs.find((x) => !noteDone(c.id, x));
    const weak = subs.find((x) => rank(level(c.id, x)) < rank('faham'));
    if (unread && (!weak || subs.indexOf(unread) <= subs.indexOf(weak))) return { kind: 'note', ch: c.id, sub: unread, why: touchedChapter(c.id) ? 'Nota seterusnya yang belum selesai.' : 'Mulakan dengan subtopik pertama.' };
    if (weak) return { kind: 'ex', ch: c.id, sub: weak, why: `Kukuhkan ${weak} dengan latihan sehingga tahap Faham.` };
    return { kind: 'ex', ch: c.id, sub: subs[0], why: 'Bab ini dikuasai. Ulang latihan untuk kekal mahir.' };
  }

  /**
   * Revision list from real activity (no streaks, no timers): unfinished sets,
   * subtopics still at Mencuba (with the evidence behind it), and notes opened
   * but not finished. Newest first.
   */
  function reviewList(limit = 6) {
    const out = [];
    for (const a of activeList) out.push({ kind: 'resume', ch: a.ch, sub: a.sub, at: a.startedAt || '', why: `Latihan belum habis: soalan ${a.results.length + 1} daripada ${a.qids.length}.` });
    for (const [k, lv] of levels) {
      if (lv !== 'mencuba') continue;
      const [ch, sub] = k.split('/');
      if (out.some((x) => x.ch === ch && x.sub === sub)) continue;
      const ev = evid.get(k), res = results.get(k) || [];
      const latest = new Map(); for (const r of res) latest.set(r.q, r.kind);
      const missed = [...latest.values()].filter((v) => v !== 'first').length;
      const why = ev.insufficient === 'faham' ? 'Bank soalan subtopik ini terlalu kecil untuk mengesahkan tahap Faham.'
        : `${ev.distinctFirst} daripada ${ev.need} soalan berbeza yang diperlukan betul pada cubaan pertama${missed ? ` · ${missed} soalan perlu dicuba semula` : ''}.`;
      out.push({ kind: 'ex', ch, sub, at: lastAttempt.get(k) || '', why });
    }
    for (const [k, at] of opened) {
      const [ch, sub] = k.split('/');
      if (notesDone.has(k) || attemptsBy.has(k) || out.some((x) => x.ch === ch && x.sub === sub)) continue;
      out.push({ kind: 'note', ch, sub, at, why: 'Nota dibuka tetapi belum selesai.' });
    }
    return out.filter((x) => chapter(x.ch)?.available).sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, limit);
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
    last, sets, recent, totals, level, evidenceOf, noteDone, chapterSummary, chapterNext, reviewList, nextAction,
    hints: (ch, sub) => hintsBy.get(key(ch, sub)) || 0, results: (ch, sub) => results.get(key(ch, sub)) || [],
    active: (ch, sub) => { const a = active[key(ch, sub)]; return a && (a.results.length > 0 || a.cur?.try === 2) ? a : null; },
  };
}
