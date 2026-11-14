// Chapter overview: subtopics (from the notes file), their learning
// standards, and optional links (legacy short lessons, DENAI level).
import { navigate } from '../utils/router.js';
import { chapterById } from '../content/curriculum.js';
import { loadChapterNotes } from '../content/notes/index.js';
import { renderMath, ensureKatexCss } from '../notes/math.js';
import { visibleStatus, previewBanner } from '../notes/preview.js';
import { findChapter } from '../data/chapters.js';

export async function renderChapterScreen(root, chapterId) {
  ensureKatexCss();
  const meta = chapterById(chapterId);
  if (!meta) { navigate('start'); return; }
  const ch = await loadChapterNotes(chapterId);
  const subs = (ch?.subtopics || []).filter((s) => visibleStatus(s.status));
  const legacy = findChapter(chapterId)?.ready;
  if (!subs.length && !legacy) { navigate(`soon/${chapterId}`); return; }
  root.innerHTML = `
    <div class="chapter-screen">
      ${subs.length && ch.status !== 'published' ? previewBanner(ch.status) : ''}
      <button type="button" class="btn-back" id="ch-back">&larr; Tingkatan ${meta.form}</button>
      <header class="chapter-header">
        <p class="note-eyebrow">Tingkatan ${meta.form} · Bab ${meta.number}${meta.package === 'elektif' ? ' · Elektif' : ''}</p>
        <h1 class="note-title">${meta.title}</h1>
        ${ch?.intro && subs.length ? `<div class="chapter-intro">${renderMath(ch.intro)}</div>` : ''}
      </header>
      ${subs.length ? `<ol class="sub-list">${subs.map((s) => `<li><button type="button" class="sub-card" data-sub="${s.id}"><span class="sub-num">${s.id}</span><span class="sub-title">${renderMath(s.title)}</span><span class="sub-sp">${s.sp.map((c) => `SP ${c}`).join(' · ')}</span>${s.minutes ? `<span class="sub-time">${s.minutes} minit</span>` : ''}</button></li>`).join('')}</ol>` : ''}
      <div class="chapter-extra">
        ${legacy ? `<button type="button" class="btn-ghost" id="ch-legacy">Nota ringkas (versi asal)</button><button type="button" class="btn-ghost" id="ch-practice">Latihan ringkas</button>` : ''}
        ${ch?.denai ? `<a class="game-link" href="${ch.denai.href}"><span class="game-link-kicker">Pilihan · Permainan berkaitan</span><span class="game-link-title">${ch.denai.label}</span><span class="game-link-cta">Main &rarr;</span></a>` : ''}
      </div>
    </div>`;
  root.querySelector('#ch-back').addEventListener('click', () => navigate(`map/${meta.form}`));
  root.querySelectorAll('[data-sub]').forEach((b) => b.addEventListener('click', () => navigate(`nota/${chapterId}/${b.dataset.sub}`)));
  root.querySelector('#ch-legacy')?.addEventListener('click', () => navigate(`lesson/${chapterId}/1`));
  root.querySelector('#ch-practice')?.addEventListener('click', () => navigate(`practice/${chapterId}`));
}
