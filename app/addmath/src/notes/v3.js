// V3 "student-first" building blocks shared by the three learning modes:
// Fahami (one compact subtopic page), Ulang Kaji (chapter cheat sheet) and
// Latihan (one question at a time). Content comes from the verified chapter
// files; the per-subtopic `v3` block (src/content/notes/v3/<id>.js) chooses what
// is shown first. Everything else stays reachable in expandable sections.
import { renderMath, tex } from './math.js';

export const LEVEL = { mudah: 'Asas', sederhana: 'Sederhana', mencabar: 'Cabaran' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const sectionsOf = (sub, kind) => sub.sections.filter((s) => s.kind === kind);
export const itemsOf = (sub, kind) => sectionsOf(sub, kind).flatMap((s) => s.items || []);

/** Fallbacks keep a subtopic usable even before its v3 block is written. */
export function v3Of(sub) {
  const v = sub.v3 || {};
  const ex = itemsOf(sub, 'examples');
  const firstMid = ex.findIndex((e) => e.level === 'sederhana');
  return {
    lead: v.lead || '',
    idea: v.idea || '',
    when: v.when || '',
    steps: v.steps || [],
    example: v.example ?? (firstMid >= 0 ? firstMid : 0),
    visual: v.visual ?? 0,
    mistake: v.mistake ?? 0,
    complete: !!sub.v3,
  };
}

export function modeTabs(chapterId, active, subId) {
  const t = (key, label, href) => `<a class="mode-tab${active === key ? ' is-active' : ''}" href="#/${href}"${active === key ? ' aria-current="page"' : ''}>${label}</a>`;
  return `<nav class="mode-tabs" aria-label="Mod pembelajaran">${t('fahami', 'Fahami', subId ? `nota/${chapterId}/${subId}` : `bab/${chapterId}`)}${t('ulangkaji', 'Ulang Kaji', `ulangkaji/${chapterId}`)}${t('latihan', 'Latihan', subId ? `latihan/${chapterId}/${subId}` : `latihan/${chapterId}`)}</nav>`;
}

export const formulaList = (items) => `<dl class="v3-formulas">${items.map((f) => `<div class="v3-formula"><dt>${tex(f.tex, true)}</dt><dd>${renderMath(f.html)}</dd></div>`).join('')}</dl>`;

export function exampleHtml(e, label = 'Contoh') {
  return `<article class="v3-example">
    <p class="v3-example-head"><span>${label}</span><span class="q-tag q-${e.level}">${LEVEL[e.level]}</span></p>
    <div class="v3-example-q">${renderMath(e.question)}</div>
    <p class="v3-example-plan"><strong>Diberi:</strong> ${renderMath(e.given)} · <strong>Cari:</strong> ${renderMath(e.find)}<br><strong>Kaedah:</strong> ${renderMath(e.method)}</p>
    <ol class="v3-steps">${e.steps.map((st) => `<li><div class="v3-step-do">${renderMath(st.do)}</div>${st.why ? `<div class="v3-step-why">${renderMath(st.why)}</div>` : ''}</li>`).join('')}</ol>
    <p class="v3-example-check"><strong>Semak:</strong> ${renderMath(e.check)}</p>
    <p class="v3-example-end"><strong>Jawapan:</strong> ${renderMath(e.conclusion)}</p>
  </article>`;
}

export const mistakeHtml = (m) => `<div class="v3-mistake"><p class="v3-wrong"><span aria-hidden="true">✗</span> <strong>Salah:</strong> ${renderMath(m.wrong)}</p><p class="v3-why"><strong>Kenapa salah:</strong> ${renderMath(m.why)}</p><p class="v3-fix"><span aria-hidden="true">✓</span> <strong>Cara betul:</strong> ${renderMath(m.fix)}</p></div>`;

export const more = (title, inner, open = false) => (inner ? `<details class="v3-more"${open ? ' open' : ''}><summary>${title}</summary><div class="v3-more-body">${inner}</div></details>` : '');

/** A readable "correct answer" line for any question part. */
export function answerHtml(spec) {
  if (spec.type === 'mcq') { const o = spec.options.find((x) => x.correct); return o ? renderMath(o.text) : ''; }
  if (spec.type === 'numeric') { const v = spec.answer; const s = Number.isInteger(v) ? String(v) : String(+v.toPrecision(10)); return `${esc(s)}${spec.unit ? ` ${renderMath(spec.unit)}` : ''}`; }
  if (spec.type === 'expression') return `<code>${esc(spec.answer)}</code>${spec.upToConstant ? ' + c' : ''}`;
  return '';
}
