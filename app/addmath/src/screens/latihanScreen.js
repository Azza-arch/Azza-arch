// LATIHAN mode (V3): practice separated from reading. Filter by level
// (Asas / Sederhana / Cabaran) and subtopic, then open any question directly
// from the numbered picker (no forced "Next"). After checking, the correct
// answer and full solution are revealed, with a link back to the concept.
// Questions, answers and solutions come unchanged from the verified banks.
import { navigate } from '../utils/router.js';
import { chapterById } from '../content/curriculum.js';
import { loadChapterNotes } from '../content/notes/index.js';
import { ensureKatexCss } from '../notes/math.js';
import { renderQuestions } from '../notes/practice.js';
import { visibleStatus, previewBanner } from '../notes/preview.js';
import { esc, LEVEL, modeTabs } from '../notes/v3.js';

export async function renderLatihanScreen(root, chapterId, subId) {
  ensureKatexCss();
  const meta = chapterById(chapterId);
  const ch = await loadChapterNotes(chapterId);
  const subs = (ch?.subtopics || []).filter((s) => visibleStatus(s.status));
  if (!meta || !subs.length) { navigate(meta ? `bab/${chapterId}` : 'start'); return; }
  const all = (ch.questions || []).filter((q) => visibleStatus(q.status) && subs.some((s) => s.id === q.subtopic));
  const state = { sub: subs.some((s) => s.id === subId) ? subId : 'semua', level: 'semua', i: 0 };
  const done = new Map(); // this visit only; no stored progress is touched
  root.innerHTML = `
    <div class="v3-screen v3-latihan">
      ${ch.status !== 'published' ? previewBanner(ch.status) : ''}
      <a class="v3-back" href="#/bab/${chapterId}">&larr; Bab ${meta.number}</a>
      <header class="v3-head"><p class="note-eyebrow">Latihan · Tingkatan ${meta.form} · Bab ${meta.number}</p><h1 class="v3-title">${esc(meta.title)}</h1></header>
      ${modeTabs(chapterId, 'latihan', state.sub === 'semua' ? null : state.sub)}
      <div class="v3-filters">
        <label>Subtopik <select id="lt-sub"><option value="semua">Semua subtopik</option>${subs.map((s) => `<option value="${s.id}"${state.sub === s.id ? ' selected' : ''}>${s.id} ${esc(s.title)}</option>`).join('')}</select></label>
        <div class="v3-levels" role="group" aria-label="Tahap">${['semua', 'mudah', 'sederhana', 'mencabar'].map((l) => `<button type="button" data-level="${l}" aria-pressed="${l === 'semua'}">${l === 'semua' ? 'Semua' : LEVEL[l]}</button>`).join('')}</div>
      </div>
      <nav class="v3-qpicker" aria-label="Pilih soalan"></nav>
      <div class="v3-qhost"></div>
    </div>`;
  const picker = root.querySelector('.v3-qpicker'), host = root.querySelector('.v3-qhost');
  const list = () => all.filter((q) => (state.sub === 'semua' || q.subtopic === state.sub) && (state.level === 'semua' || q.difficulty === state.level));
  function show() {
    const qs = list();
    if (state.i >= qs.length) state.i = 0;
    picker.innerHTML = qs.length ? qs.map((q, k) => `<button type="button" data-i="${k}" class="${k === state.i ? 'is-current' : ''} ${done.has(q.id) ? `is-${done.get(q.id)}` : ''}" aria-label="Soalan ${k + 1}${done.has(q.id) ? (done.get(q.id) === 'right' ? ', betul' : ', dicuba') : ''}"${k === state.i ? ' aria-current="true"' : ''}>${k + 1}</button>`).join('') : '';
    if (!qs.length) { host.innerHTML = '<p class="v3-empty">Tiada soalan untuk pilihan ini. Cuba tahap lain.</p>'; return; }
    const q = qs[state.i];
    renderQuestions(host, [q], {
      number: state.i + 1, reveal: true,
      conceptHref: `#/nota/${chapterId}/${q.subtopic}`, conceptLabel: `Ulang konsep ${q.subtopic} ${subs.find((s) => s.id === q.subtopic)?.title || ''}`,
      onResult: (ok) => { if (done.get(q.id) !== 'right') done.set(q.id, ok ? 'right' : 'tried'); const b = picker.querySelector(`[data-i="${state.i}"]`); if (b) { b.classList.remove('is-right', 'is-tried'); b.classList.add(`is-${done.get(q.id)}`); } },
    });
    picker.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { state.i = Number(b.dataset.i); show(); host.scrollIntoView({ block: 'nearest' }); }));
  }
  root.querySelector('#lt-sub').addEventListener('change', (e) => { state.sub = e.target.value; state.i = 0; history.replaceState(null, '', `#/latihan/${chapterId}${state.sub === 'semua' ? '' : `/${state.sub}`}`); root.querySelector('.mode-tabs').outerHTML = modeTabs(chapterId, 'latihan', state.sub === 'semua' ? null : state.sub); show(); });
  root.querySelectorAll('[data-level]').forEach((b) => b.addEventListener('click', () => { state.level = b.dataset.level; state.i = 0; root.querySelectorAll('[data-level]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); show(); }));
  show();
}
