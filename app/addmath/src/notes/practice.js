// Practice cards for any question type. Feedback explains WHY an answer is
// right or wrong; every question has a full worked solution.
import { renderMath } from './math.js';
import { tryEval, equivalent } from './expr.js';

const LEVEL = { mudah: 'Mudah', sederhana: 'Sederhana', mencabar: 'Mencabar' };
const TYPE = { mcq: 'Objektif', numeric: 'Jawapan ringkas', expression: 'Jawapan ringkas', structured: 'Berstruktur', reasoning: 'Penaakulan' };

function checkSingle(spec, raw) {
  const text = String(raw).trim();
  if (!text) return { state: 'empty', html: 'Tulis jawapan dahulu.' };
  if (spec.type === 'numeric') {
    const v = tryEval(text);
    if (v === null) return { state: 'invalid', html: 'Jawapan perlu nombor (contoh: 7, -2.5 atau 3/4).' };
    const ok = Math.abs(v - spec.answer) <= (spec.tolerance ?? 1e-9) * Math.max(1, Math.abs(spec.answer));
    if (ok) return { state: 'right', html: spec.right || 'Betul.' };
    const w = (spec.wrong || []).find((x) => Math.abs(v - x.value) <= 1e-9 * Math.max(1, Math.abs(x.value)));
    return { state: 'wrong', html: w ? w.feedback : (spec.hint || 'Belum tepat. Semak langkah anda, atau lihat penyelesaian penuh.') };
  }
  if (spec.type === 'expression') {
    if (tryEval(text, { x: 1.37 }) === null && tryEval(text, { x: 2.41 }) === null) return { state: 'invalid', html: 'Ungkapan tidak dapat dibaca. Contoh format: 2x+1, (x-1)/2, 3(x+4)^2.' };
    if (equivalent(text, spec.answer, spec.equiv)) return { state: 'right', html: spec.right || 'Betul.' };
    const w = (spec.wrong || []).find((x) => equivalent(text, x.expr, spec.equiv));
    return { state: 'wrong', html: w ? w.feedback : (spec.hint || 'Belum tepat. Semak langkah anda, atau lihat penyelesaian penuh.') };
  }
  return { state: 'invalid', html: '' };
}

function inputFor(spec, id) {
  const ph = spec.type === 'expression' ? 'contoh: 2x+1' : 'jawapan';
  return `<div class="q-input-row"><input id="${id}" class="q-input" type="text" inputmode="${spec.type === 'numeric' ? 'decimal' : 'text'}" autocomplete="off" spellcheck="false" placeholder="${ph}" aria-label="Jawapan">${spec.unit ? `<span class="q-unit">${renderMath(spec.unit)}</span>` : ''}<button type="button" class="btn-primary q-check">Semak</button></div><div class="q-feedback" aria-live="polite"></div>`;
}

export function renderQuestions(host, questions) {
  host.innerHTML = questions.map((q, n) => {
    const id = `q-${q.id}`;
    let body = '';
    if (q.type === 'mcq') body = `<div class="q-options" role="group" aria-label="Pilihan jawapan">${q.options.map((o, k) => `<button type="button" class="q-option" data-k="${k}"><span class="q-letter">${'ABCD'[k]}</span><span>${renderMath(o.text)}</span></button>`).join('')}</div><div class="q-feedback" aria-live="polite"></div>`;
    else if (q.type === 'structured') body = q.parts.map((p, k) => `<div class="q-part" data-part="${k}"><p class="q-part-prompt"><strong>(${String.fromCharCode(97 + k)})</strong> ${renderMath(p.prompt)}</p>${p.type === 'reasoning' ? '' : inputFor(p, `${id}-${k}`)}</div>`).join('');
    else if (q.type === 'reasoning') body = `<p class="q-self">Tulis jawapan anda di atas kertas, kemudian bandingkan dengan penyelesaian penuh.</p>`;
    else body = inputFor(q, id);
    return `<article class="q-card" data-q="${n}" id="${id}-card">
      <p class="q-meta"><span class="q-num">Soalan ${n + 1}</span><span class="q-tag q-${q.difficulty}">${LEVEL[q.difficulty]}</span><span class="q-tag">${TYPE[q.type]}</span></p>
      <div class="q-prompt">${renderMath(q.prompt)}</div>
      ${body}
      <details class="q-solution"><summary>Lihat penyelesaian penuh</summary>${q.type === 'structured' ? q.parts.map((p, k) => `<p class="q-sol-part"><strong>(${String.fromCharCode(97 + k)})</strong></p><ol>${p.solution.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol>`).join('') : `<ol>${q.solution.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol>`}</details>
    </article>`;
  }).join('');

  host.querySelectorAll('.q-card').forEach((card) => {
    const q = questions[Number(card.dataset.q)];
    if (q.type === 'mcq') {
      const fb = card.querySelector('.q-feedback');
      card.querySelectorAll('.q-option').forEach((b) => b.addEventListener('click', () => {
        const o = q.options[Number(b.dataset.k)];
        card.querySelectorAll('.q-option').forEach((x) => x.classList.remove('is-right', 'is-wrong'));
        b.classList.add(o.correct ? 'is-right' : 'is-wrong');
        fb.className = `q-feedback is-${o.correct ? 'right' : 'wrong'}`; fb.innerHTML = renderMath(o.feedback);
      }));
      return;
    }
    const holders = q.type === 'structured' ? [...card.querySelectorAll('.q-part')] : [card];
    holders.forEach((holder) => {
      const spec = q.type === 'structured' ? q.parts[Number(holder.dataset.part)] : q;
      const btn = holder.querySelector('.q-check'); if (!btn) return;
      const input = holder.querySelector('.q-input'), fb = holder.querySelector('.q-feedback');
      const run = () => { const r = checkSingle(spec, input.value); fb.className = `q-feedback is-${r.state}`; fb.innerHTML = renderMath(r.html); };
      btn.addEventListener('click', run); input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
    });
  });
}
