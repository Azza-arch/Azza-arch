// PAGE 06 — Interactive exercise. Frontend only: answers are checked in the
// browser with the notes app's own checker; nothing is graded on a server or saved.
// States per question: unanswered → selected → submitted (correct | incorrect)
// → explanation → next; then a completion summary.
import { esc, icon, crumbs, tag, LEVEL, emptyState, journeyCompact } from '../ui.js';
import { chapter, loadChapter, exerciseSet, GAME, chapterLabel } from '../data.js';
import { renderMath } from '/app/addmath/src/notes/math.js';
import { checkSingle } from '/app/addmath/src/notes/practice.js';
import { answerHtml } from '/app/addmath/src/notes/v3.js';

const KEYS = 'ABCDEF';
const TYPE = { mcq: 'Objektif', numeric: 'Jawapan nombor', expression: 'Jawapan ungkapan' };
const INPUT_HINT = { numeric: 'Contoh format: 7, -2.5 atau 3/4', expression: 'Contoh format: 2x+1, (x-1)/2, 3(x+4)^2' };

export async function render(route) {
  const [id, subId] = route.params;
  const c = chapter(id);
  if (!c) return { redirect: '#/bab' };
  const ch = await loadChapter(id);
  const sub = ch?.subtopics.find((s) => s.id === subId);
  if (!ch || !sub) return { redirect: `#/bab/${id}` };
  const qs = exerciseSet(ch, sub.id);
  const next = ch.subtopics[ch.subtopics.indexOf(sub) + 1];
  const level = c.hasGame ? GAME.levels.find((l) => l.sub === sub.id) : null;

  const top = `${crumbs([['Hub', '#/hub'], [`Bab ${c.number}`, `#/bab/${id}`], [`${sub.id} ${sub.title}`, `#/nota/${id}/${sub.id}`], ['Latihan']])}
    <header class="read-head" style="border:0;padding-bottom:0">
      <p class="eyebrow">Latihan · ${esc(chapterLabel(c))}</p>
      <h1 class="h1">${esc(sub.id)} ${esc(sub.title)}</h1>
      <div style="margin-top:12px">${journeyCompact('latih')}</div>
    </header>`;

  if (!qs.length) {
    return { title: `Latihan ${sub.id}`, nav: 'bab', surface: 'read', html: `<div class="wrap wrap-read"><div class="read">${top}<div style="margin-top:24px">${emptyState({ ico: 'pencil', title: 'Latihan belum tersedia', text: 'Subtopik ini belum mempunyai soalan yang boleh disemak secara automatik.', actions: `<a class="btn btn-primary" href="#/nota/${id}/${sub.id}">Kembali ke nota</a>` })}</div></div></div>` };
  }

  const html = `<div class="wrap wrap-read"><div class="read">${top}<div id="ex-host" aria-live="polite"></div>
    <p class="source-line">Soalan asal daripada bank soalan nota Add Math (bukan soalan SPM sebenar). Demo frontend: jawapan disemak dalam pelayar dan keputusan tidak disimpan.</p></div></div>`;

  const mount = (view) => {
    const host = view.querySelector('#ex-host');
    const st = { i: 0, results: [], phase: 'unanswered', pick: null, text: '', check: null, msg: '' };

    const dots = () => `<ol class="dots" aria-hidden="true">${qs.map((_, k) => `<li class="${k < st.results.length ? (st.results[k] ? 'is-right' : 'is-wrong') : k === st.i ? 'is-current' : ''}"></li>`).join('')}</ol>`;

    function feedbackHtml(q) {
      const right = st.check.state === 'right';
      const fb = q.type === 'mcq' ? q.options[st.pick].feedback : st.check.html;
      return `<div class="feedback ${right ? 'is-right' : 'is-wrong'}" role="status">
        <p class="feedback-title">${icon(right ? 'check' : 'x')}${right ? 'Betul!' : 'Belum tepat'}</p>
        ${fb ? `<div class="prose small">${renderMath(fb)}</div>` : ''}
        ${right ? '' : `<p class="correct-line"><b>Jawapan betul:</b> ${answerHtml(q)}</p>`}
      </div>
      ${q.solution?.length ? `<details class="explain"${right ? '' : ' open'}><summary>${icon('bulb')}Penyelesaian penuh</summary><ol class="prose">${q.solution.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol></details>` : ''}`;
    }

    function questionView() {
      const q = qs[st.i], done = st.phase === 'submitted', last = st.i === qs.length - 1;
      const correctIdx = q.type === 'mcq' ? q.options.findIndex((o) => o.correct) : -1;
      const opt = (o, k) => {
        let cls = '';
        if (done) cls = k === correctIdx ? ' is-right' : k === st.pick ? ' is-wrong' : ' is-dim';
        const mark = done && k === correctIdx ? icon('check', 'Jawapan betul') : done && k === st.pick ? icon('x', 'Pilihan anda') : '';
        return `<li><button type="button" class="option${cls}" role="radio" aria-checked="${k === st.pick}" data-opt="${k}"${done ? ' disabled' : ''}><span class="opt-key">${KEYS[k]}</span><span class="opt-text">${renderMath(o.text)}</span><span class="opt-mark">${mark}</span></button></li>`;
      };
      const field = q.type === 'mcq'
        ? `<ul class="options" role="radiogroup" aria-label="Pilihan jawapan">${q.options.map(opt).join('')}</ul>`
        : `<div class="answer-field"><label for="ans">Jawapan anda${q.unit ? ` (${renderMath(q.unit)})` : ''}</label>
            <input id="ans" type="text" inputmode="${q.type === 'numeric' ? 'decimal' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(st.text)}"${done ? ` readonly class="${st.check.state === 'right' ? 'is-right' : 'is-wrong'}"` : ''}>
            <span class="hint">${INPUT_HINT[q.type]}</span><span class="inline-msg" id="ans-msg">${st.msg}</span></div>`;
      const status = { unanswered: q.type === 'mcq' ? 'Pilih satu jawapan' : 'Tulis jawapan anda', selected: 'Sedia untuk disemak' }[st.phase] || '';
      host.innerHTML = `
        <div class="ex-top"><span class="ex-count">Soalan ${st.i + 1} daripada ${qs.length}</span>${dots()}</div>
        <article class="qcard" aria-labelledby="q-prompt">
          <div class="qcard-body">
            <div class="qmeta">${tag(TYPE[q.type])}${q.difficulty ? tag(LEVEL[q.difficulty] || q.difficulty, q.difficulty === 'mencabar' ? 'progress' : 'ready') : ''}</div>
            <div class="qprompt" id="q-prompt">${renderMath(q.prompt)}</div>
            ${field}
          </div>
          ${done ? feedbackHtml(q) : ''}
          <div class="qactions">
            <span class="qstatus">${status}</span>
            ${done ? `<button type="button" class="btn btn-primary" data-act="next">${last ? 'Lihat keputusan' : 'Soalan seterusnya'} ${icon('arrow')}</button>`
              : `<button type="button" class="btn btn-ok" data-act="submit"${st.phase === 'selected' ? '' : ' disabled'}>${icon('check')}Semak jawapan</button>`}
          </div>
        </article>`;
      bind(q);
    }

    function bind(q) {
      host.querySelectorAll('[data-opt]').forEach((b) => b.addEventListener('click', () => {
        st.pick = Number(b.dataset.opt); st.phase = 'selected'; questionView();
        host.querySelector(`[data-opt="${st.pick}"]`)?.focus();
      }));
      const radios = [...host.querySelectorAll('[data-opt]:not([disabled])')];
      radios.forEach((b, k) => b.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); radios[(k + d + radios.length) % radios.length].focus(); }
      }));
      const input = host.querySelector('#ans:not([readonly])');
      if (input) {
        input.addEventListener('input', () => {
          st.text = input.value; st.msg = '';
          const ready = input.value.trim() !== '';
          st.phase = ready ? 'selected' : 'unanswered';
          const btn = host.querySelector('[data-act="submit"]'); btn.disabled = !ready;
          host.querySelector('.qstatus').textContent = ready ? 'Sedia untuk disemak' : 'Tulis jawapan anda';
          host.querySelector('#ans-msg').textContent = '';
        });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); submit(q); } });
      }
      host.querySelector('[data-act="submit"]')?.addEventListener('click', () => submit(q));
      host.querySelector('[data-act="next"]')?.addEventListener('click', advance);
    }

    function submit(q) {
      if (q.type === 'mcq') {
        if (st.pick === null) return;
        st.check = { state: q.options[st.pick].correct ? 'right' : 'wrong' };
      } else {
        const r = checkSingle(q, st.text);
        if (r.state === 'empty' || r.state === 'invalid') { st.msg = r.html; questionView(); host.querySelector('#ans')?.focus(); return; }
        st.check = r;
      }
      st.phase = 'submitted';
      st.results.push(st.check.state === 'right');
      questionView();
      host.querySelector('[data-act="next"]')?.focus({ preventScroll: true });
    }

    function advance() {
      if (st.i < qs.length - 1) {
        Object.assign(st, { i: st.i + 1, phase: 'unanswered', pick: null, text: '', check: null, msg: '' });
        questionView();
        host.querySelector('.qprompt')?.scrollIntoView({ block: 'center', behavior: 'auto' });
        (host.querySelector('[data-opt]') || host.querySelector('#ans'))?.focus({ preventScroll: true });
      } else completion();
    }

    function completion() {
      const score = st.results.filter(Boolean).length, pct = Math.round((score / qs.length) * 100);
      const msg = pct === 100 ? 'Cemerlang! Semua jawapan betul.' : pct >= 60 ? 'Bagus. Semak semula soalan yang salah, kemudian teruskan.' : 'Baca semula nota dan cuba sekali lagi. Penyelesaian penuh ada untuk setiap soalan.';
      host.innerHTML = `<section class="qcard done" style="margin-top:16px" aria-labelledby="h-done">
        <div class="score-ring" style="--v:${pct}" role="img" aria-label="Skor ${score} daripada ${qs.length}"><div><b>${score}/${qs.length}</b><span>Skor</span></div></div>
        <h2 id="h-done" tabindex="-1">Latihan selesai</h2>
        <p>${msg}</p>
        <ul class="review-list">${qs.map((q, k) => `<li class="${st.results[k] ? 'is-right' : 'is-wrong'}">${icon(st.results[k] ? 'check' : 'x', st.results[k] ? 'Betul' : 'Salah')}<span class="rl-text"><b>S${k + 1}.</b> ${renderMath(q.prompt)}</span></li>`).join('')}</ul>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" data-act="retry">${icon('refresh')}Ulang latihan</button>
          ${next ? `<a class="btn btn-primary" href="#/nota/${id}/${next.id}">Nota seterusnya: ${esc(next.id)} ${icon('arrow')}</a>` : `<a class="btn btn-primary" href="#/bab/${id}">Kembali ke Bab ${c.number} ${icon('arrow')}</a>`}
        </div>
        ${level ? `<p class="notice" style="margin-top:24px;text-align:left">${icon('gamepad')}<span>Sedia untuk cabaran? Konsep ini digunakan dalam <b>Level ${level.no}: ${esc(level.title)}</b>. <a href="#/main">Ke halaman game</a></span></p>` : ''}
        <p class="small muted" style="margin-top:20px">Keputusan ini tidak disimpan (demo frontend). <a href="#/hub">Kembali ke Learning Hub</a></p>
      </section>`;
      host.querySelector('#h-done').focus({ preventScroll: false });
      host.querySelector('[data-act="retry"]').addEventListener('click', () => {
        Object.assign(st, { i: 0, results: [], phase: 'unanswered', pick: null, text: '', check: null, msg: '' }); questionView();
      });
    }

    questionView();
  };
  return { title: `Latihan ${sub.id} ${sub.title}`, nav: 'bab', surface: 'read', html, mount };
}
