// ULANG KAJI mode (V3): one compact cheat sheet per chapter, grouped by
// subtopic: formulas with their conditions, when to use, short steps, common
// mistakes (wrong → right in one line each) and a link to the full note.
// Quick search filters the groups; anchor chips jump between subtopics.
import { navigate } from '../utils/router.js';
import { chapterById } from '../content/curriculum.js';
import { loadChapterNotes } from '../content/notes/index.js';
import { renderMath, ensureKatexCss } from '../notes/math.js';
import { visibleStatus, previewBanner } from '../notes/preview.js';
import { esc, v3Of, itemsOf, modeTabs, formulaList } from '../notes/v3.js';

const plain = (h) => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\\[a-zA-Z]+/g, ' ').toLowerCase();

export async function renderRevisionScreen(root, chapterId) {
  ensureKatexCss();
  const meta = chapterById(chapterId);
  const ch = await loadChapterNotes(chapterId);
  const subs = (ch?.subtopics || []).filter((s) => visibleStatus(s.status));
  if (!meta || !subs.length) { navigate(meta ? `bab/${chapterId}` : 'start'); return; }
  root.innerHTML = `
    <div class="v3-screen v3-revision">
      ${ch.status !== 'published' ? previewBanner(ch.status) : ''}
      <a class="v3-back" href="#/bab/${chapterId}">&larr; Bab ${meta.number}</a>
      <header class="v3-head"><p class="note-eyebrow">Ulang kaji · Tingkatan ${meta.form} · Bab ${meta.number}</p><h1 class="v3-title">${esc(meta.title)}</h1></header>
      ${modeTabs(chapterId, 'ulangkaji')}
      <div class="v3-rev-tools">
        <label class="v3-search"><span class="sr-only">Cari rumus atau istilah</span><input id="rev-q" type="search" placeholder="Cari rumus atau istilah…" autocomplete="off"></label>
        <nav class="v3-chips" aria-label="Lompat ke subtopik">${subs.map((s) => `<a href="#rev-${s.id}" data-anchor="rev-${s.id}">${s.id}</a>`).join('')}</nav>
      </div>
      ${subs.map((s) => { const v = v3Of(s); const f = itemsOf(s, 'formula'), m = itemsOf(s, 'mistakes'); return `
      <section class="v3-rev" id="rev-${s.id}" data-text="${esc(plain(s.title + ' ' + v.when + ' ' + v.steps.join(' ') + ' ' + f.map((x) => x.tex + ' ' + x.html).join(' ') + ' ' + m.map((x) => x.wrong + ' ' + x.fix).join(' ')))}">
        <h2><span>${s.id}</span> ${esc(s.title)}</h2>
        ${f.length ? formulaList(f) : ''}
        ${v.when ? `<p class="v3-rev-line"><strong>Bila guna:</strong> ${renderMath(v.when)}</p>` : ''}
        ${v.steps.length ? `<p class="v3-rev-line"><strong>Langkah:</strong></p><ol class="v3-rev-steps">${v.steps.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ol>` : ''}
        ${m.length ? `<p class="v3-rev-line"><strong>Kesilapan biasa:</strong></p><ul class="v3-rev-mistakes">${m.map((x) => `<li><span class="v3-x">✗</span> ${renderMath(x.wrong)} <span class="v3-arrow">→</span> <span class="v3-ok">✓</span> ${renderMath(x.fix)}</li>`).join('')}</ul>` : ''}
        <p class="v3-rev-links"><a href="#/nota/${chapterId}/${s.id}">Nota penuh ${s.id} &rarr;</a> <a href="#/latihan/${chapterId}/${s.id}">Latihan ${s.id} &rarr;</a></p>
      </section>`; }).join('')}
      <p class="v3-empty" hidden>Tiada padanan. Cuba perkataan lain.</p>
    </div>`;
  const q = root.querySelector('#rev-q'), groups = [...root.querySelectorAll('.v3-rev')], empty = root.querySelector('.v3-empty');
  q.addEventListener('input', () => { const t = q.value.trim().toLowerCase(); let n = 0; groups.forEach((g) => { const hit = !t || g.dataset.text.includes(t); g.hidden = !hit; if (hit) n++; }); empty.hidden = n > 0; });
  root.querySelectorAll('[data-anchor]').forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); document.getElementById(a.dataset.anchor)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }));
}
