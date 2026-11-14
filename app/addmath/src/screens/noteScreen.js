// One subtopic = one naturally scrolling page, sections A–J:
// intro, prerequisite review, concepts, visuals (+ text alternative),
// formulas, worked examples, common mistakes, practice with full solutions,
// summary, links onward. Content comes from src/content/notes/<chapter>.js.
import { navigate } from '../utils/router.js';
import { chapterById } from '../content/curriculum.js';
import { loadChapterNotes } from '../content/notes/index.js';
import { renderMath, ensureKatexCss, tex } from '../notes/math.js';
import { mountVisual } from '../notes/visuals.js';
import { renderQuestions } from '../notes/practice.js';
import { visibleStatus, previewBanner } from '../notes/preview.js';

const LEVEL = { mudah: 'Mudah', sederhana: 'Sederhana', mencabar: 'Mencabar' };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const spChips = (sp) => (sp || []).map((c) => `<span class="sp-chip">SP ${c}</span>`).join('');

function sectionHtml(s, i) {
  const id = `s${i}`;
  const head = (label, title) => `<h2 class="note-h2"><span class="note-kicker">${label}</span>${renderMath(title)}</h2>`;
  switch (s.kind) {
    case 'intro': return `<section class="note-sec note-intro" id="${id}">${head('Mari mula', s.title || 'Kenapa kita belajar ini?')}${renderMath(s.html)}</section>`;
    case 'prereq': return `<section class="note-sec note-prereq" id="${id}">${head('Ulang kaji ringkas', s.title)}${renderMath(s.html)}</section>`;
    case 'concept': return `<section class="note-sec" id="${id}">${head('Konsep', s.title)}${s.sp ? `<p class="sp-row">${spChips(s.sp)}</p>` : ''}${renderMath(s.html)}</section>`;
    case 'visual': return `<section class="note-sec note-visual" id="${id}">${head('Teroka', s.title)}${s.html ? renderMath(s.html) : ''}<figure class="visual-fig"><div class="visual-host" data-visual="${i}"></div><figcaption><details><summary>Penerangan teks bagi visual ini</summary>${renderMath(s.alt)}</details></figcaption></figure></section>`;
    case 'formula': return `<section class="note-sec note-formula" id="${id}">${head('Rumus dan tatatanda', s.title || 'Rumus penting')}<dl class="formula-list">${s.items.map((f) => `<div class="formula-item"><dt>${tex(f.tex, true)}</dt><dd>${renderMath(f.html)}</dd></div>`).join('')}</dl></section>`;
    case 'examples': return `<section class="note-sec" id="${id}">${head('Contoh penyelesaian', s.title || 'Contoh')}${s.items.map((e, k) => `
      <article class="example">
        <header class="example-head"><span class="example-num">Contoh ${k + 1}</span><span class="q-tag q-${e.level}">${LEVEL[e.level]}</span>${spChips(e.sp)}</header>
        <div class="example-q">${renderMath(e.question)}</div>
        <dl class="example-frame">
          <div><dt>Diberi</dt><dd>${renderMath(e.given)}</dd></div>
          <div><dt>Cari</dt><dd>${renderMath(e.find)}</dd></div>
          <div><dt>Kaedah</dt><dd>${renderMath(e.method)}</dd></div>
        </dl>
        <ol class="example-steps">${e.steps.map((st) => `<li><div class="step-do">${renderMath(st.do)}</div>${st.why ? `<div class="step-why"><span>Kenapa?</span> ${renderMath(st.why)}</div>` : ''}</li>`).join('')}</ol>
        <p class="example-check"><strong>Semak jawapan:</strong> ${renderMath(e.check)}</p>
        <p class="example-conclusion"><strong>Kesimpulan:</strong> ${renderMath(e.conclusion)}</p>
      </article>`).join('')}</section>`;
    case 'mistakes': return `<section class="note-sec note-mistakes" id="${id}">${head('Kesilapan lazim', s.title || 'Elakkan kesilapan ini')}${s.items.map((m) => `
      <div class="mistake"><p class="mistake-wrong"><span aria-hidden="true">✗</span> ${renderMath(m.wrong)}</p><p class="mistake-why"><strong>Kenapa salah:</strong> ${renderMath(m.why)}</p><p class="mistake-fix"><span aria-hidden="true">✓</span> <strong>Cara betul:</strong> ${renderMath(m.fix)}</p></div>`).join('')}</section>`;
    case 'summary': return `<section class="note-sec note-summary" id="${id}">${head('Ringkasan', s.title || 'Perkara penting')}<ul>${s.points.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ul></section>`;
    case 'next': return `<section class="note-sec note-next" id="${id}">${head('Seterusnya', s.title || 'Kaitan dengan topik lain')}${renderMath(s.html)}${(s.links || []).length ? `<p class="next-links">${s.links.map((l) => `<a class="btn-ghost" href="${esc(l.href)}">${esc(l.label)}</a>`).join('')}</p>` : ''}</section>`;
    default: return '';
  }
}
const TOC = { intro: 'Mula', prereq: 'Ulang kaji', concept: null, visual: 'Teroka', formula: 'Rumus', examples: 'Contoh', mistakes: 'Kesilapan', summary: 'Ringkasan', next: 'Seterusnya' };

export async function renderNoteScreen(root, chapterId, subId) {
  ensureKatexCss();
  root.innerHTML = '<div class="note-screen"><p class="note-loading">Memuatkan nota…</p></div>';
  const ch = await loadChapterNotes(chapterId);
  const meta = chapterById(chapterId);
  const sub = ch?.subtopics.find((s) => s.id === subId);
  if (!ch || !sub || !visibleStatus(sub.status)) { navigate(meta ? `bab/${chapterId}` : 'start'); return; }
  const idx = ch.subtopics.indexOf(sub), nextSub = ch.subtopics.slice(idx + 1).find((s) => visibleStatus(s.status));
  const questions = (ch.questions || []).filter((q) => q.subtopic === sub.id && visibleStatus(q.status));
  const tocItems = sub.sections.map((s, i) => [i, TOC[s.kind] ?? s.title]).filter(([, l]) => l);
  root.innerHTML = `
    <div class="note-screen">
      ${previewBanner(sub.status)}
      <nav class="note-crumbs"><button type="button" class="btn-back" id="note-back">&larr; Bab ${meta.number}: ${esc(meta.title)}</button></nav>
      <header class="note-header">
        <p class="note-eyebrow">Tingkatan ${meta.form} · Bab ${meta.number} · ${esc(sub.id)}</p>
        <h1 class="note-title">${renderMath(sub.title)}</h1>
        <p class="sp-row">${spChips(sub.sp)}</p>
        ${sub.minutes ? `<p class="note-time">Anggaran masa: ${sub.minutes} minit</p>` : ''}
      </header>
      <nav class="note-toc" aria-label="Isi kandungan subtopik">${tocItems.map(([i, l]) => `<a href="#s${i}" data-anchor="s${i}">${esc(l)}</a>`).join('')}<a href="#latihan" data-anchor="latihan">Latihan</a></nav>
      ${sub.sections.map(sectionHtml).join('')}
      <section class="note-sec note-practice" id="latihan">
        <h2 class="note-h2"><span class="note-kicker">Latihan</span>Cuba sendiri</h2>
        <p>Soalan disusun daripada mudah ke mencabar. Setiap soalan ada penyelesaian penuh.</p>
        <div class="q-list"></div>
      </section>
      <nav class="note-pager">${nextSub ? `<button type="button" class="btn-primary" id="note-next">Subtopik seterusnya: ${renderMath(nextSub.title)} &rarr;</button>` : `<button type="button" class="btn-primary" id="note-next">Kembali ke Bab ${meta.number} &rarr;</button>`}</nav>
    </div>`;
  sub.sections.forEach((s, i) => { if (s.kind === 'visual') mountVisual(root.querySelector(`[data-visual="${i}"]`), s.spec); });
  renderQuestions(root.querySelector('.q-list'), questions);
  root.querySelector('#note-back').addEventListener('click', () => navigate(`bab/${chapterId}`));
  root.querySelector('#note-next').addEventListener('click', () => navigate(nextSub ? `nota/${chapterId}/${nextSub.id}` : `bab/${chapterId}`));
  // in-page anchors must not trigger the hash router
  root.querySelectorAll('[data-anchor]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); document.getElementById(a.dataset.anchor)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }));
}
