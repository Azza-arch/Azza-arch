// Nota (#/nota/<id>/<sub>, optional ?b=contoh|ulang|latihan to open at a section).
// FAHAMI → CONTOH → ULANG KAJI → LATIHAN for one subtopic, from the verified
// chapter file. Everything published for the subtopic is here:
//   * the student-first core (V3 idea, when to use, main visual, main example);
//   * the full explanation, every other visual, every worked example and every
//     common mistake, in expandable blocks so the page stays calm;
//   * chapters without a V3 layer (Tingkatan 5, owner preview only) show their
//     explanation sections directly.
// Learning mode: no game decoration.
import { esc, icon, crumbs, LEVEL, masteryTag, insufficientNote } from '../ui.js';
import { store } from '../core/store.js';
import { noteOpen, noteDone } from '../core/events.js';
import { getLearner } from '../core/learner.js';
import { chapter, loadChapter, exerciseCount, writtenPool, gameLevelFor, NOTES_APP_URL, chapterLabel } from '../data.js';
import { renderMath, tex, mountVisual, v3Of, sectionsOf, itemsOf } from '../core/content.js';

const SECTIONS = [['fahami', 'FAHAMI', 'k-fahami'], ['contoh', 'CONTOH', 'k-contoh'], ['ulang', 'ULANG KAJI', 'k-ulang'], ['latihan', 'LATIHAN', 'k-latihan']];
const head = (key, title) => { const [, label] = SECTIONS.find((s) => s[0] === key); return `<div class="nsec-head"><span class="nsec-label"><i></i>${label}</span><h2 id="h-${key}">${title}</h2></div>`; };
const formHref = (form) => (form === 5 ? '#/bab?t=5' : '#/bab');

function exampleHtml(e, n, total) {
  const id = `ex-${n}`;
  return `<article class="example" data-example id="${id}">
    <div class="example-q"><p class="eyebrow" style="margin-bottom:6px">Contoh ${n}${total > 1 ? ` daripada ${total}` : ''} · ${LEVEL[e.level] || ''}</p><div class="prose">${renderMath(e.question)}</div></div>
    <div class="example-plan"><span><b>Diberi:</b> ${renderMath(e.given)}</span><span><b>Cari:</b> ${renderMath(e.find)}</span><span><b>Kaedah:</b> ${renderMath(e.method)}</span></div>
    <div class="example-mode"><button type="button" class="btn btn-quiet btn-sm" data-stepmode aria-controls="${id}-steps">${icon('list')}Tunjuk langkah satu per satu</button></div>
    <ol class="wsteps" id="${id}-steps">${e.steps.map((s) => `<li><div>${renderMath(s.do)}</div>${s.why ? `<div class="why"><b>Kenapa:</b> ${renderMath(s.why)}</div>` : ''}</li>`).join('')}</ol>
    <div class="step-ctrl" hidden><button type="button" class="btn btn-secondary" data-stepnext>Langkah seterusnya</button><button type="button" class="btn btn-quiet" data-stepall>Tunjuk semua</button><span class="small muted" data-steppos aria-live="polite"></span></div>
    <div class="example-tail">
      ${e.check ? `<p class="example-end"><b>Semak:</b> ${renderMath(e.check)}</p>` : ''}
      <p class="example-end"><b>Jawapan:</b> ${renderMath(e.conclusion)}</p>
    </div>
  </article>`;
}
const mistakeHtml = (m) => `<div class="mistake"><p><b>✗ Salah:</b> ${renderMath(m.wrong)}</p><p><b>Kenapa:</b> ${renderMath(m.why)}</p><p class="fix"><b>✓ Cara betul:</b> ${renderMath(m.fix)}</p></div>`;
const more = (title, inner, attrs = '') => (inner ? `<details class="more"${attrs}><summary>${title}</summary><div class="more-body">${inner}</div></details>` : '');
const visualFig = (vis, k) => `${vis.html ? `<div class="prose" style="margin-top:16px">${renderMath(vis.html)}</div>` : ''}<figure class="visual-fig"><div class="visual-host" data-visual="${k}"></div><figcaption>${vis.title ? `<b>${esc(vis.title)}</b>` : ''}<details><summary>Penerangan teks bagi visual ini</summary>${renderMath(vis.alt || '')}</details></figcaption></figure>`;

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
  const concepts = sectionsOf(sub, 'concept'), intro = sectionsOf(sub, 'intro')[0], prereq = sectionsOf(sub, 'prereq')[0];
  const summary = sectionsOf(sub, 'summary')[0];
  const mainVis = Math.min(v.visual, Math.max(0, visuals.length - 1)), mainEx = Math.min(v.example, Math.max(0, examples.length - 1)), mainMis = Math.min(v.mistake, Math.max(0, mistakes.length - 1));
  const idx = ch.subtopics.indexOf(sub), prev = ch.subtopics[idx - 1], next = ch.subtopics[idx + 1];
  const n = exerciseCount(ch, sub.id), w = writtenPool(ch, sub.id).length;
  const level = gameLevelFor(id, sub.id);
  const l = await getLearner(), done = l.noteDone(id, sub.id), lv = l.level(id, sub.id);
  const doneRow = (isDone) => isDone
    ? `<div class="note-done-row is-done" id="note-done"><span><b>${icon('check')} Nota selesai.</b> Tahap penguasaan berubah melalui jawapan latihan, bukan melalui nota.</span>${masteryTag(lv)}</div>`
    : `<div class="note-done-row" id="note-done"><span><b>Sudah baca nota ini?</b> Tandakan selesai supaya mudah disambung. Tahap penguasaan hanya berubah melalui latihan.</span><button type="button" class="btn btn-secondary" data-act="done">${icon('check')}Saya faham nota ini</button></div>`;

  const conceptHtml = (list) => list.map((s) => `<div class="concept-block">${s.title ? `<h3 class="subhead-plain">${renderMath(s.title)}</h3>` : ''}<div class="prose">${renderMath(s.html)}</div></div>`).join('');
  const fullExplain = [intro ? `<div class="prose">${renderMath(intro.html)}</div>` : '', prereq ? `<div class="callout-box"><b>${esc(prereq.title || 'Perlu tahu dahulu')}</b><div class="prose">${renderMath(prereq.html)}</div></div>` : '', conceptHtml(concepts)].join('');
  const otherVisuals = visuals.map((vis, k) => (k === mainVis ? '' : visualFig(vis, k))).join('');
  const otherExamples = examples.map((e, k) => (k === mainEx ? '' : more(`Contoh ${k + 1} · ${LEVEL[e.level] || ''}`, exampleHtml(e, k + 1, examples.length)))).join('');
  const otherMistakes = mistakes.map((m, k) => (k === mainMis ? '' : mistakeHtml(m))).join('');

  const fahami = v.complete
    ? `${v.idea ? `<div class="prose">${renderMath(v.idea)}</div>` : ''}
       ${v.when ? `<p class="when"><b>Bila guna:</b> ${renderMath(v.when)}</p>` : ''}
       ${visuals[mainVis] ? visualFig(visuals[mainVis], mainVis) : ''}
       ${more(`Penerangan penuh (${concepts.length} bahagian)`, fullExplain)}`
    : `${fullExplain}${visuals[mainVis] ? visualFig(visuals[mainVis], mainVis) : ''}`;

  const html = `<div class="wrap wrap-read"><div class="read">
    ${crumbs([['Belajar', '#/bab'], [`Tingkatan ${c.form}`, formHref(c.form)], [`Bab ${c.number}`, `#/bab/${id}`], [`${sub.id} ${sub.title}`]])}
    <header class="read-head">
      <p class="eyebrow">Tingkatan ${c.form} · ${esc(chapterLabel(c))}</p>
      <h1 class="h1">${esc(sub.id)} ${esc(sub.title)}</h1>
      ${v.lead ? `<p class="lead">${renderMath(v.lead)}</p>` : ''}
      <p class="read-meta">${masteryTag(lv)}<span>${examples.length} contoh · ${n} soalan latihan${w ? ` · ${w} soalan bertulis` : ''}</span></p>
    </header>
    <nav class="jump" aria-label="Bahagian nota">${SECTIONS.map(([key, label, k]) => `<a href="#/nota/${id}/${sub.id}?b=${key}" data-jump="${key}" class="${k}"><i></i>${label}</a>`).join('')}</nav>

    <section class="nsec k-fahami" id="fahami" aria-labelledby="h-fahami">
      ${head('fahami', 'Idea utama')}
      ${fahami}
      ${more(`Visual lain (${visuals.length - (visuals[mainVis] ? 1 : 0)})`, otherVisuals, ' data-lazyvis')}
    </section>

    <section class="nsec k-contoh" id="contoh" aria-labelledby="h-contoh">
      ${head('contoh', 'Contoh langkah demi langkah')}
      ${examples[mainEx] ? exampleHtml(examples[mainEx], mainEx + 1, examples.length) : '<p class="muted">Tiada contoh berlangkah untuk subtopik ini.</p>'}
      ${otherExamples ? `<h3 class="subhead">Contoh lain</h3><div class="stack">${otherExamples}</div>` : ''}
    </section>

    <section class="nsec k-ulang" id="ulang" aria-labelledby="h-ulang">
      ${head('ulang', 'Rumus dan ringkasan')}
      ${formulas.length ? `<dl class="formulas">${formulas.map((f) => `<div class="formula"><dt>${tex(f.tex, true)}</dt><dd>${renderMath(f.html)}</dd></div>`).join('')}</dl>` : ''}
      ${v.steps.length ? `<h3 class="subhead">Cara menyelesaikan</h3><ol class="prose howto">${v.steps.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol>` : ''}
      ${summary?.points?.length ? `<h3 class="subhead">Ingat</h3><ul class="prose howto">${summary.points.map((x) => `<li>${renderMath(x)}</li>`).join('')}</ul>` : ''}
      ${mistakes[mainMis] ? `<h3 class="subhead">Kesilapan lazim</h3>${mistakeHtml(mistakes[mainMis])}` : ''}
      ${more(`Kesilapan lazim lain (${mistakes.length - (mistakes[mainMis] ? 1 : 0)})`, otherMistakes ? `<div class="stack">${otherMistakes}</div>` : '')}
    </section>

    <section class="nsec k-latihan" id="latihan" aria-labelledby="h-latihan">
      ${head('latihan', 'Cuba sendiri')}
      ${doneRow(done)}
      ${insufficientNote(l.evidenceOf(id, sub.id))}
      <div style="margin-top:16px"></div>
      ${n ? `<div class="practice-cta"><div><b>Latihan ${esc(sub.id)}: set 5 soalan</b><p class="small muted" style="margin-top:4px">Dipilih daripada ${n} soalan. Dua cubaan setiap soalan, maklum balas pada kesilapan, penyelesaian penuh selepas itu.</p></div><a class="btn btn-ok btn-lg" href="#/latihan/${id}/${sub.id}">${icon('pencil')}Mula latihan</a></div>`
        : '<p class="muted">Latihan automatik untuk subtopik ini belum tersedia.</p>'}
      ${w ? `<p style="margin-top:12px"><a class="textlink" href="#/latihan/${id}/${sub.id}?jenis=bertulis">${icon('list')}Soalan bertulis (${w}): berstruktur dan penaakulan ${icon('arrow')}</a></p>` : ''}
      ${level ? `<p class="notice" style="margin-top:16px">${icon('gamepad')}<span>Konsep ini digunakan dalam misi game <b>Level ${level.no}: ${esc(level.title)}</b>. <a href="#/main">Lihat di tab Game</a></span></p>` : ''}
    </section>

    <nav class="pager" aria-label="Subtopik lain">
      ${prev ? `<a href="#/nota/${id}/${prev.id}"><span>Sebelum</span>${esc(prev.id)} ${esc(prev.title)}</a>` : `<a href="#/bab/${id}"><span>Kembali</span>Laluan Bab ${c.number}</a>`}
      ${next ? `<a class="next" href="#/nota/${id}/${next.id}"><span>Seterusnya</span>${esc(next.id)} ${esc(next.title)}</a>` : `<a class="next" href="#/bab/${id}/ulang-kaji"><span>Tamat bab</span>Ulang kaji Bab ${c.number}</a>`}
    </nav>
    <p class="source-line">Kandungan daripada nota Add Math yang ${c.preview ? 'sedang disemak' : 'telah diterbitkan'}. Paparan asal ada dalam <a href="${NOTES_APP_URL}#/nota/${id}/${sub.id}">Aplikasi Nota Add Math</a>.</p>
  </div></div>`;

  const mount = (view, r) => {
    // Record the visit once per 30 minutes (refreshes do not inflate it).
    const lastOpen = [...store.state().events].reverse().find((e) => e.t === 'note-open');
    if (!(lastOpen && lastOpen.ch === id && lastOpen.sub === sub.id && Date.now() - Date.parse(lastOpen.at) < 30 * 60000)) store.append(noteOpen(id, sub.id));
    view.querySelector('[data-act="done"]')?.addEventListener('click', () => {
      store.append(noteDone(id, sub.id));
      const row = view.querySelector('#note-done'); row.outerHTML = doneRow(true);
      view.querySelector('#note-done').setAttribute('tabindex', '-1'); view.querySelector('#note-done').focus();
    });
    const mountOne = (host) => {
      if (host.dataset.mounted) return; host.dataset.mounted = '1';
      const vis = visuals[Number(host.dataset.visual)];
      try { mountVisual(host, vis.spec); } catch (e) { console.warn('DENAI hub: visual not shown', e); host.closest('figure').hidden = true; }
    };
    view.querySelectorAll('[data-visual]').forEach((h) => { if (!h.closest('details')) mountOne(h); });
    view.querySelectorAll('details').forEach((d) => d.addEventListener('toggle', () => { if (d.open) d.querySelectorAll('[data-visual]').forEach(mountOne); }));

    // Worked examples: optional step-by-step reveal (never hides the content by default).
    view.querySelectorAll('[data-example]').forEach((ex) => {
      const steps = [...ex.querySelectorAll('.wsteps > li')], ctrl = ex.querySelector('.step-ctrl'), tail = ex.querySelector('.example-tail');
      const pos = ex.querySelector('[data-steppos]'), nextBtn = ex.querySelector('[data-stepnext]');
      let shown = steps.length;
      const paint = () => {
        steps.forEach((li, k) => { li.hidden = k >= shown; });
        tail.hidden = shown < steps.length;
        ctrl.hidden = shown >= steps.length;
        pos.textContent = shown < steps.length ? `Langkah ${shown} daripada ${steps.length}` : '';
      };
      ex.querySelector('[data-stepmode]').addEventListener('click', (e) => { shown = 1; paint(); e.currentTarget.parentElement.hidden = true; nextBtn.focus(); });
      nextBtn.addEventListener('click', () => { shown += 1; paint(); (shown >= steps.length ? steps[steps.length - 1] : nextBtn).focus?.(); });
      ex.querySelector('[data-stepall]').addEventListener('click', () => { shown = steps.length; paint(); });
    });

    const links = [...view.querySelectorAll('[data-jump]')];
    const goTo = (key, smooth) => view.querySelector(`#${key}`)?.scrollIntoView({ behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'auto', block: 'start' });
    links.forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); goTo(a.dataset.jump, true); }));
    const b = r?.query.get('b');
    if (b && SECTIONS.some((s) => s[0] === b)) requestAnimationFrame(() => goTo(b, false));
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries) => entries.forEach((en) => {
        if (en.isIntersecting) links.forEach((a) => a.classList.toggle('is-active', a.dataset.jump === en.target.id));
      }), { rootMargin: '-35% 0px -55% 0px' });
      view.querySelectorAll('.nsec').forEach((s) => obs.observe(s));
    }
  };
  return { title: `${sub.id} ${sub.title}`, nav: 'bab', surface: 'read', preview: c.preview, html, mount };
}
