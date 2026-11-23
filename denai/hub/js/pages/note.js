// PAGE 05 — Concept notes: FAHAMI → CONTOH → ULANG KAJI → LATIHAN.
// Content is the verified, published note for one subtopic (one learning idea).
// The hub shows its core; the full note (extra examples, deeper explanations)
// stays in the Add Math notes app and is linked at the end.
import { esc, icon, crumbs, LEVEL, journeyCompact } from '../ui.js';
import { chapter, loadChapter, exerciseCount, GAME, NOTES_APP_URL, chapterLabel } from '../data.js';
import { renderMath, tex } from '/app/addmath/src/notes/math.js';
import { mountVisual } from '/app/addmath/src/notes/visuals.js';
import { v3Of, sectionsOf, itemsOf } from '/app/addmath/src/notes/v3.js';

const SECTIONS = [['fahami', 'FAHAMI', 'k-fahami'], ['contoh', 'CONTOH', 'k-contoh'], ['ulang', 'ULANG KAJI', 'k-ulang'], ['latihan', 'LATIHAN', 'k-latihan']];
const head = (key, title) => { const [, label, k] = SECTIONS.find((s) => s[0] === key); return `<div class="nsec-head"><span class="nsec-label"><i></i>${label}</span><h2 id="h-${key}">${title}</h2></div>`; };

function exampleHtml(e) {
  return `<article class="example">
    <div class="example-q"><p class="eyebrow" style="margin-bottom:6px">Contoh · ${LEVEL[e.level] || ''}</p><div class="prose">${renderMath(e.question)}</div></div>
    <div class="example-plan"><span><b>Diberi:</b> ${renderMath(e.given)}</span><span><b>Cari:</b> ${renderMath(e.find)}</span><span><b>Kaedah:</b> ${renderMath(e.method)}</span></div>
    <ol class="wsteps">${e.steps.map((s) => `<li><div>${renderMath(s.do)}</div>${s.why ? `<div class="why">${renderMath(s.why)}</div>` : ''}</li>`).join('')}</ol>
    ${e.check ? `<p class="example-end"><b>Semak:</b> ${renderMath(e.check)}</p>` : ''}
    <p class="example-end"><b>Jawapan:</b> ${renderMath(e.conclusion)}</p>
  </article>`;
}

export async function render(route) {
  const [id, subId] = route.params;
  const c = chapter(id);
  if (!c) return { redirect: '#/bab' };
  const ch = await loadChapter(id);
  const sub = ch?.subtopics.find((s) => s.id === subId);
  if (!ch || !sub) return { redirect: `#/bab/${id}` };

  const v = v3Of(sub);
  const visuals = sectionsOf(sub, 'visual'), examples = itemsOf(sub, 'examples');
  const formulas = itemsOf(sub, 'formula'), mistakes = itemsOf(sub, 'mistakes');
  const summary = sectionsOf(sub, 'summary')[0];
  const vis = visuals[v.visual], ex = examples[v.example], mis = mistakes[v.mistake];
  const idx = ch.subtopics.indexOf(sub), prev = ch.subtopics[idx - 1], next = ch.subtopics[idx + 1];
  const n = exerciseCount(ch, sub.id);
  const level = c.hasGame ? GAME.levels.find((l) => l.sub === sub.id) : null;
  const fallbackIdea = sectionsOf(sub, 'concept')[0];

  const html = `<div class="wrap wrap-read"><div class="read">
    ${crumbs([['Hub', '#/hub'], [`Bab ${c.number}`, `#/bab/${id}`], [`${sub.id} ${sub.title}`]])}
    <header class="read-head">
      <p class="eyebrow">Tingkatan ${c.form} · ${esc(chapterLabel(c))}</p>
      <h1 class="h1">${esc(sub.id)} ${esc(sub.title)}</h1>
      ${v.lead ? `<p class="lead">${renderMath(v.lead)}</p>` : ''}
      <div style="margin-top:14px">${journeyCompact('fahami')}</div>
    </header>
    <nav class="jump" aria-label="Bahagian nota">${SECTIONS.map(([key, label, k]) => `<a href="#/nota/${id}/${sub.id}" data-jump="${key}" class="${k}"><i></i>${label}</a>`).join('')}</nav>

    <section class="nsec k-fahami" id="fahami" aria-labelledby="h-fahami">
      ${head('fahami', 'Idea utama')}
      <div class="prose">${v.idea ? renderMath(v.idea) : fallbackIdea ? renderMath(fallbackIdea.html) : ''}</div>
      ${v.when ? `<p class="when"><b>Bila guna:</b> ${renderMath(v.when)}</p>` : ''}
      ${vis ? `${vis.html ? `<div class="prose" style="margin-top:16px">${renderMath(vis.html)}</div>` : ''}<figure class="visual-fig"><div class="visual-host" data-visual></div><figcaption><details><summary>Penerangan teks bagi visual ini</summary>${renderMath(vis.alt)}</details></figcaption></figure>` : ''}
    </section>

    <section class="nsec k-contoh" id="contoh" aria-labelledby="h-contoh">
      ${head('contoh', 'Contoh langkah demi langkah')}
      ${ex ? exampleHtml(ex) : '<p class="muted">Tiada contoh untuk subtopik ini.</p>'}
    </section>

    <section class="nsec k-ulang" id="ulang" aria-labelledby="h-ulang">
      ${head('ulang', 'Rumus dan ringkasan')}
      ${formulas.length ? `<dl class="formulas">${formulas.map((f) => `<div class="formula"><dt>${tex(f.tex, true)}</dt><dd>${renderMath(f.html)}</dd></div>`).join('')}</dl>` : ''}
      ${v.steps.length ? `<h3 class="subhead">Cara menyelesaikan</h3><ol class="prose howto">${v.steps.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol>` : ''}
      ${summary?.points?.length ? `<h3 class="subhead">Ingat</h3><ul class="prose howto">${summary.points.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ul>` : ''}
      ${mis ? `<h3 class="subhead">Kesilapan lazim</h3><div class="mistake"><p><b>✗ Salah:</b> ${renderMath(mis.wrong)}</p><p><b>Kenapa:</b> ${renderMath(mis.why)}</p><p class="fix"><b>✓ Cara betul:</b> ${renderMath(mis.fix)}</p></div>` : ''}
    </section>

    <section class="nsec k-latihan" id="latihan" aria-labelledby="h-latihan">
      ${head('latihan', 'Cuba sendiri')}
      ${n ? `<div class="practice-cta"><div><b>${n} soalan tentang ${esc(sub.title)}</b><p class="small muted" style="margin-top:4px">Pilih atau tulis jawapan, semak, dan baca penyelesaian penuh.</p></div><a class="btn btn-ok btn-lg" href="#/latihan/${id}/${sub.id}">${icon('pencil')}Mula latihan</a></div>`
        : '<p class="muted">Latihan untuk subtopik ini belum tersedia.</p>'}
      ${level ? `<p class="notice" style="margin-top:16px">${icon('gamepad')}<span>Konsep ini digunakan dalam <b>Level ${level.no}: ${esc(level.title)}</b> dalam game DENAI. <a href="#/main">Lihat misi</a></span></p>` : ''}
    </section>

    <nav class="pager" aria-label="Subtopik lain">
      ${prev ? `<a href="#/nota/${id}/${prev.id}"><span>Sebelum</span>${esc(prev.id)} ${esc(prev.title)}</a>` : `<a href="#/bab/${id}"><span>Kembali</span>Gambaran Bab ${c.number}</a>`}
      ${next ? `<a class="next" href="#/nota/${id}/${next.id}"><span>Seterusnya</span>${esc(next.id)} ${esc(next.title)}</a>` : `<a class="next" href="#/bab/${id}"><span>Tamat bab</span>Gambaran Bab ${c.number}</a>`}
    </nav>
    <p class="source-line">Nota ini menunjukkan bahagian teras. Contoh tambahan dan penerangan penuh ada dalam <a href="${NOTES_APP_URL}#/nota/${id}/${sub.id}">Aplikasi Nota Add Math</a>.</p>
  </div></div>`;

  const mount = (view) => {
    const host = view.querySelector('[data-visual]');
    if (host && vis) { try { mountVisual(host, vis.spec); } catch (e) { console.warn('DENAI hub: visual not shown', e); host.closest('figure').hidden = true; } }
    const links = [...view.querySelectorAll('[data-jump]')];
    links.forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault(); // hash is the route; scroll to the section instead
      view.querySelector(`#${a.dataset.jump}`)?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }));
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.dataset.jump === en.target.id));
      }), { rootMargin: '-35% 0px -55% 0px' });
      view.querySelectorAll('.nsec').forEach((s) => obs.observe(s));
    }
  };
  return { title: `${sub.id} ${sub.title}`, nav: 'bab', surface: 'read', html, mount };
}
