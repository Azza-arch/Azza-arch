// Soalan bertulis (#/latihan/<id>/<sub>?jenis=bertulis): the subtopic's published
// structured and reasoning questions, which the auto-graded practice set leaves out.
//  * Structured: each auto-checkable part (numeric / expression) is checked with the
//    notes app's own checker, two tries per part; the part's answer and worked
//    solution appear after a right answer or the second try (same rule as D7).
//  * Reasoning (whole question or part): there is no reliable automatic marker, so
//    the learner writes on paper first, then reveals the model solution.
// Nothing here is recorded and nothing changes mastery (open decision O5 keeps
// written answers out of the evidence).
import { esc, icon, tag, LEVEL, emptyState } from '../ui.js';
import { renderMath, checkSingle, answerHtml } from '../core/content.js';

const AUTO = new Set(['numeric', 'expression']);
const HINT = { numeric: 'Contoh format: 7, -2.5 atau 3/4', expression: 'Contoh format: 2x+1, (x-1)/2' };
const RETRY = 'Belum tepat. Semak semula langkah anda dan cuba sekali lagi.';
const letter = (k) => String.fromCharCode(97 + k);
const solutionList = (steps) => `<ol class="prose small">${(steps || []).map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol>`;

function partHtml(q, p, k, qi) {
  const pid = `w${qi}-${k}`;
  const label = q.type === 'structured' ? `<b>(${letter(k)})</b> ` : '';
  if (AUTO.has(p.type)) {
    return `<div class="wpart" data-part="${k}">
      <div class="wpart-prompt">${label}${renderMath(p.prompt || '')}</div>
      <div class="answer-field"><label for="${pid}">Jawapan ${q.type === 'structured' ? `(${letter(k)})` : 'anda'}${p.unit ? ` (${renderMath(p.unit)})` : ''}</label>
        <div class="wpart-row"><input id="${pid}" type="text" inputmode="${p.type === 'numeric' ? 'decimal' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false"><button type="button" class="btn btn-ok" data-check>${icon('check')}Semak</button></div>
        <span class="hint">${HINT[p.type]}</span><span class="inline-msg" data-msg aria-live="polite"></span></div>
      <div data-out></div>
    </div>`;
  }
  return `<div class="wpart" data-part="${k}" data-self>
    <div class="wpart-prompt">${label}${renderMath(p.prompt || '')}</div>
    <p class="small muted">Tulis jawapan anda di atas kertas dahulu, kemudian bandingkan dengan penyelesaian.</p>
    <div data-out><button type="button" class="btn btn-secondary btn-sm" data-reveal>${icon('bulb')}Saya sudah cuba: tunjuk penyelesaian${q.type === 'structured' ? ` (${letter(k)})` : ''}</button></div>
  </div>`;
}

export function written({ c, sub, id, top, wq }) {
  if (!wq.length) {
    return { title: `Soalan bertulis ${sub.id}`, nav: 'bab', surface: 'read', preview: c.preview, html: `<div class="wrap wrap-read"><div class="read">${top}<div style="margin-top:24px">${emptyState({ ico: 'list', title: 'Tiada soalan bertulis', text: 'Subtopik ini belum mempunyai soalan berstruktur atau penaakulan.', actions: `<a class="btn btn-primary" href="#/latihan/${id}/${sub.id}">Ke latihan</a>` })}</div></div></div>` };
  }
  const card = (q, qi) => {
    const parts = q.type === 'structured' ? q.parts : [q.type === 'reasoning' ? { ...q, prompt: '' } : q];
    return `<article class="qcard wq" data-q="${qi}" aria-labelledby="wq-${qi}">
      <div class="qcard-body">
        <div class="qmeta">${tag(`Soalan ${qi + 1}`)}${tag(q.type === 'structured' ? 'Berstruktur' : 'Penaakulan')}${q.difficulty ? tag(LEVEL[q.difficulty] || q.difficulty, q.difficulty === 'mencabar' ? 'progress' : 'ready') : ''}</div>
        <div class="qprompt" id="wq-${qi}">${renderMath(q.prompt)}</div>
        <div class="wparts">${parts.map((p, k) => partHtml(q, p, k, qi)).join('')}</div>
      </div>
    </article>`;
  };
  const html = `<div class="wrap wrap-read"><div class="read">${top}
    <p class="notice" style="margin-top:16px">${icon('info')}<span>Soalan bertulis melatih jawapan berlangkah seperti dalam peperiksaan. <b>Ia tidak mengubah tahap penguasaan</b>, kerana jawapan penaakulan tidak dapat disemak secara automatik. Bahagian bernombor disemak terus; bahagian penaakulan anda bandingkan sendiri dengan penyelesaian.</span></p>
    <div class="stack" style="margin-top:16px">${wq.map(card).join('')}</div>
    <p class="source-line">Soalan asal daripada bank soalan nota Add Math (bukan soalan SPM sebenar).</p>
  </div></div>`;

  const mount = (view) => {
    view.querySelectorAll('.wq').forEach((cardEl) => {
      const q = wq[Number(cardEl.dataset.q)];
      const parts = q.type === 'structured' ? q.parts : [q];
      cardEl.querySelectorAll('.wpart').forEach((el) => {
        const p = parts[Number(el.dataset.part)], out = el.querySelector('[data-out]');
        if (el.hasAttribute('data-self')) {
          el.querySelector('[data-reveal]').addEventListener('click', () => {
            out.innerHTML = `<div class="feedback is-self" role="status"><p class="feedback-title">${icon('bulb')}Penyelesaian</p>${solutionList(p.solution)}<p class="small muted">Bandingkan langkah demi langkah. Jika ada langkah yang tertinggal, baca semula nota ${esc(sub.id)}.</p></div>`;
            out.querySelector('.feedback').setAttribute('tabindex', '-1'); out.querySelector('.feedback').focus();
          });
          return;
        }
        let tries = 0;
        const input = el.querySelector('input'), msg = el.querySelector('[data-msg]'), btn = el.querySelector('[data-check]');
        const check = () => {
          const r = checkSingle(p, input.value);
          if (r.state === 'empty' || r.state === 'invalid') { msg.innerHTML = r.html; input.focus(); return; }
          msg.textContent = ''; tries += 1;
          const right = r.state === 'right';
          if (!right && tries === 1) {
            const fb = r.html && !/^Belum tepat\./.test(r.html) ? r.html : RETRY;
            out.innerHTML = `<div class="feedback is-retry" role="status"><p class="feedback-title">${icon('refresh')}Cuba sekali lagi</p><div class="prose small">${renderMath(fb)}</div><p class="small muted">Jawapan dan penyelesaian ditunjuk selepas cubaan kedua.</p></div>`;
            input.select(); return;
          }
          input.readOnly = true; btn.disabled = true; input.classList.add(right ? 'is-right' : 'is-wrong');
          out.innerHTML = `<div class="feedback ${right ? 'is-right' : 'is-wrong'}" role="status"><p class="feedback-title">${icon(right ? 'check' : 'x')}${right ? (tries === 1 ? 'Betul!' : 'Betul pada cubaan kedua') : 'Belum tepat'}</p>${right ? '' : `<p class="correct-line"><b>Jawapan betul:</b> ${answerHtml(p)}</p>`}</div>
            ${p.solution?.length ? `<details class="explain"${right ? '' : ' open'}><summary>${icon('bulb')}Penyelesaian${q.type === 'structured' ? ` (${letter(Number(el.dataset.part))})` : ''}</summary>${solutionList(p.solution)}</details>` : ''}`;
        };
        btn.addEventListener('click', check);
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      });
    });
  };
  return { title: `Soalan bertulis ${sub.id} ${sub.title}`, nav: 'bab', surface: 'read', preview: c.preview, html, mount };
}
