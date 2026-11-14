// Chapter overview (V3): mode tabs + a clean list of subtopics. Each row:
// number, title, one sentence on what the student will learn, and direct
// links to Fahami / Latihan. Ulang Kaji covers the whole chapter.
import { navigate } from '../utils/router.js';
import { chapterById } from '../content/curriculum.js';
import { loadChapterNotes } from '../content/notes/index.js';
import { renderMath, ensureKatexCss } from '../notes/math.js';
import { visibleStatus, previewBanner } from '../notes/preview.js';
import { findChapter } from '../data/chapters.js';
import { esc, v3Of, modeTabs } from '../notes/v3.js';

export async function renderChapterScreen(root, chapterId) {
  ensureKatexCss();
  const meta = chapterById(chapterId);
  if (!meta) { navigate('start'); return; }
  const ch = await loadChapterNotes(chapterId);
  const subs = (ch?.subtopics || []).filter((s) => visibleStatus(s.status));
  const legacy = findChapter(chapterId)?.ready;
  if (!subs.length && !legacy) { navigate(`soon/${chapterId}`); return; }
  const qCount = (id) => (ch.questions || []).filter((q) => q.subtopic === id && visibleStatus(q.status)).length;
  root.innerHTML = `
    <div class="v3-screen">
      ${subs.length && ch.status !== 'published' ? previewBanner(ch.status) : ''}
      <a class="v3-back" href="#/map/${meta.form}">&larr; Tingkatan ${meta.form}</a>
      <header class="v3-head">
        <p class="note-eyebrow">Tingkatan ${meta.form} · Bab ${meta.number}${meta.package === 'elektif' ? ' · Elektif' : ''}</p>
        <h1 class="v3-title">${esc(meta.title)}</h1>
      </header>
      ${subs.length ? modeTabs(chapterId, 'fahami') : ''}
      ${subs.length ? `<ol class="v3-sublist">${subs.map((s) => { const v = v3Of(s); return `<li class="v3-subrow">
        <a class="v3-subrow-main" href="#/nota/${chapterId}/${s.id}"><span class="v3-subnum">${s.id}</span><span class="v3-subtitle">${esc(s.title)}</span>${v.lead ? `<span class="v3-sublead">${renderMath(v.lead)}</span>` : ''}</a>
        <span class="v3-subrow-actions"><a href="#/nota/${chapterId}/${s.id}">Fahami</a><a href="#/latihan/${chapterId}/${s.id}">Latihan (${qCount(s.id)})</a></span>
      </li>`; }).join('')}</ol>` : ''}
      ${subs.length ? `<p class="v3-chapter-links"><a class="btn-ghost" href="#/ulangkaji/${chapterId}">Ulang kaji seluruh bab</a><a class="btn-ghost" href="#/latihan/${chapterId}">Latihan seluruh bab</a></p>` : ''}
      <div class="chapter-extra">
        ${legacy ? `<button type="button" class="btn-ghost" id="ch-legacy">Nota ringkas (versi asal)</button><button type="button" class="btn-ghost" id="ch-practice">Latihan ringkas (versi asal)</button>` : ''}
        ${ch?.denai ? `<a class="game-link" href="${ch.denai.href}"><span class="game-link-kicker">Pilihan · Permainan berkaitan</span><span class="game-link-title">${ch.denai.label}</span><span class="game-link-cta">Main &rarr;</span></a>` : ''}
      </div>
    </div>`;
  root.querySelector('#ch-legacy')?.addEventListener('click', () => navigate(`lesson/${chapterId}/1`));
  root.querySelector('#ch-practice')?.addEventListener('click', () => navigate(`practice/${chapterId}`));
}
