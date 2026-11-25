// FAHAMI mode (V3): one compact subtopic page.
// Order: idea utama (+ bila guna) → rumus → satu visual → cara menyelesaikan →
// satu contoh lengkap → satu kesilapan penting → bahagian pilihan yang boleh
// dibuka (penerangan mendalam, contoh tambahan, visual lain, kesilapan lain).
// Practice lives in the separate Latihan mode; nothing here forces "Next".
import { navigate } from '../utils/router.js';
import { chapterById } from '../content/curriculum.js';
import { loadChapterNotes } from '../content/notes/index.js';
import { renderMath, ensureKatexCss } from '../notes/math.js';
import { mountVisual } from '../notes/visuals.js';
import { visibleStatus, previewBanner } from '../notes/preview.js';
import { esc, v3Of, sectionsOf, itemsOf, modeTabs, formulaList, exampleHtml, mistakeHtml, more } from '../notes/v3.js';

const visualFig = (s, key) => `${s.html ? `<div class="v3-visual-note">${renderMath(s.html)}</div>` : ''}<figure class="visual-fig"><div class="visual-host" data-visual="${key}"></div><figcaption><details><summary>Penerangan teks bagi visual ini</summary>${renderMath(s.alt)}</details></figcaption></figure>`;

export async function renderNoteScreen(root, chapterId, subId) {
  ensureKatexCss();
  root.innerHTML = '<div class="v3-screen"><p class="note-loading">Memuatkan nota…</p></div>';
  const ch = await loadChapterNotes(chapterId);
  const meta = chapterById(chapterId);
  const subs = (ch?.subtopics || []).filter((s) => visibleStatus(s.status));
  const sub = subs.find((s) => s.id === subId);
  if (!ch || !sub) { navigate(meta ? `bab/${chapterId}` : 'start'); return; }
  const v = v3Of(sub);
  const idx = subs.indexOf(sub), prev = subs[idx - 1], next = subs[idx + 1];
  const visuals = sectionsOf(sub, 'visual'), examples = itemsOf(sub, 'examples'), mistakes = itemsOf(sub, 'mistakes');
  const formulas = itemsOf(sub, 'formula');
  const mainVis = visuals[v.visual], mainEx = examples[v.example], mainMis = mistakes[v.mistake];
  const otherVis = visuals.filter((_, k) => k !== v.visual), otherEx = examples.filter((_, k) => k !== v.example), otherMis = mistakes.filter((_, k) => k !== v.mistake);
  const deeper = [...sectionsOf(sub, 'prereq'), ...sectionsOf(sub, 'intro'), ...sectionsOf(sub, 'concept')]
    .map((s) => `<section class="v3-deep"><h3>${renderMath(s.title || '')}</h3>${renderMath(s.html)}</section>`).join('');
  const summary = sectionsOf(sub, 'summary')[0];
  const nqs = (ch.questions || []).filter((q) => q.subtopic === sub.id && visibleStatus(q.status)).length;

  root.innerHTML = `
    <div class="v3-screen v3-with-side">
      ${previewBanner(sub.status)}
      <aside class="v3-side" aria-label="Subtopik">
        <p class="v3-side-head">Bab ${meta.number}: ${esc(meta.title)}</p>
        <ol>${subs.map((s) => `<li><a href="#/nota/${chapterId}/${s.id}"${s === sub ? ' aria-current="page"' : ''}><span>${s.id}</span> ${esc(s.title)}</a></li>`).join('')}</ol>
      </aside>
      <div class="v3-main">
        <nav class="v3-top" aria-label="Navigasi nota">
          <a class="v3-back" href="#/bab/${chapterId}">&larr; Bab ${meta.number}</a>
          <label class="v3-picker"><span class="sr-only">Pilih subtopik</span><select id="v3-sub">${subs.map((s) => `<option value="${s.id}"${s === sub ? ' selected' : ''}>${s.id} ${esc(s.title)}</option>`).join('')}</select></label>
        </nav>
        ${modeTabs(chapterId, 'fahami', sub.id)}
        <header class="v3-head">
          <p class="note-eyebrow">Tingkatan ${meta.form} · Bab ${meta.number} · ${esc(sub.id)}</p>
          <h1 class="v3-title">${esc(sub.title)}</h1>
        </header>

        <section class="v3-block v3-idea" id="idea">
          <h2>Idea utama</h2>
          ${v.idea ? renderMath(v.idea) : summary ? `<ul>${summary.points.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ul>` : ''}
          ${v.when ? `<p class="v3-when"><strong>Bila guna:</strong> ${renderMath(v.when)}</p>` : ''}
        </section>

        ${formulas.length ? `<section class="v3-block" id="rumus"><h2>Rumus dan syarat</h2>${formulaList(formulas)}</section>` : ''}

        ${mainVis ? `<section class="v3-block v3-visual" id="visual"><h2>${esc(mainVis.title || 'Lihat')}</h2>${visualFig(mainVis, 'main')}</section>` : ''}

        ${v.steps.length ? `<section class="v3-block" id="cara"><h2>Cara menyelesaikan</h2><ol class="v3-howto">${v.steps.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol></section>` : ''}

        ${mainEx ? `<section class="v3-block" id="contoh"><h2>Contoh</h2>${exampleHtml(mainEx)}</section>` : ''}

        ${mainMis ? `<section class="v3-block" id="kesilapan"><h2>Elakkan kesilapan ini</h2>${mistakeHtml(mainMis)}</section>` : ''}

        <section class="v3-block v3-optional" id="lanjut">
          ${more('Fahami dengan lebih mendalam', deeper)}
          ${more(`Lihat contoh tambahan (${otherEx.length})`, otherEx.map((e, k) => exampleHtml(e, `Contoh tambahan ${k + 1}`)).join(''))}
          ${more(`Visual lain (${otherVis.length})`, otherVis.map((s, k) => `<h3>${esc(s.title || '')}</h3>${visualFig(s, `o${k}`)}`).join(''))}
          ${more(`Kesilapan lain (${otherMis.length})`, otherMis.map(mistakeHtml).join(''))}
          ${summary ? more('Ringkasan', `<ul>${summary.points.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ul>`) : ''}
        </section>

        <nav class="v3-end" aria-label="Langkah seterusnya">
          <a class="btn-primary" href="#/latihan/${chapterId}/${sub.id}">Cuba latihan ${esc(sub.id)} (${nqs} soalan)</a>
          <p class="v3-end-links">${prev ? `<a href="#/nota/${chapterId}/${prev.id}">&larr; ${prev.id} ${esc(prev.title)}</a>` : '<span></span>'}${next ? `<a href="#/nota/${chapterId}/${next.id}">${next.id} ${esc(next.title)} &rarr;</a>` : `<a href="#/ulangkaji/${chapterId}">Ulang kaji Bab ${meta.number} &rarr;</a>`}</p>
        </nav>
      </div>
    </div>`;

  if (mainVis) mountVisual(root.querySelector('[data-visual="main"]'), mainVis.spec);
  // optional visuals mount only when their section is first opened (lighter page)
  const opt = [...root.querySelectorAll('.v3-more')].find((d) => d.querySelector('[data-visual^="o"]'));
  opt?.addEventListener('toggle', () => { if (!opt.open) return; otherVis.forEach((s, k) => { const host = root.querySelector(`[data-visual="o${k}"]`); if (host && !host.dataset.mounted) { host.dataset.mounted = '1'; mountVisual(host, s.spec); } }); });
  root.querySelector('#v3-sub').addEventListener('change', (e) => navigate(`nota/${chapterId}/${e.target.value}`));
}
