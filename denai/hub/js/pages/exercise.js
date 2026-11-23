// PAGE 06 — Interactive exercise (Phase 1: real progress).
// * The set is drawn from the subtopic's whole auto-checkable pool (core/practice.js);
//   "Latihan lagi" gives a different set.
// * Two attempts per question: a first mistake shows targeted feedback only (no
//   answer, no solution); the answer and full solution appear after a correct
//   answer or a second mistake.
// * Every attempt is recorded as a learning event; the set in progress is saved,
//   so a refresh resumes at the same question. Checking happens in the browser
//   with the notes app's own checker.
import { esc, icon, crumbs, tag, LEVEL, emptyState, journeyCompact, masteryTag } from '../ui.js';
import { chapter, loadChapter, questionPool, GAME, chapterLabel } from '../data.js';
import { renderMath, checkSingle, answerHtml } from '../core/content.js';
import { store } from '../core/store.js';
import { attempt, setDone } from '../core/events.js';
import { outcomes, levelFor, poolOf } from '../core/mastery.js';
import { pickSet, mulberry32 } from '../core/practice.js';

const KEYS = 'ABCDEF';
const TYPE = { mcq: 'Objektif', numeric: 'Jawapan nombor', expression: 'Jawapan ungkapan' };
const INPUT_HINT = { numeric: 'Contoh format: 7, -2.5 atau 3/4', expression: 'Contoh format: 2x+1, (x-1)/2, 3(x+4)^2' };
const RETRY_GENERIC = 'Belum tepat. Semak semula langkah anda dan cuba sekali lagi.';

export async function render(route) {
  const [id, subId] = route.params;
  const c = chapter(id);
  if (!c) return { redirect: '#/bab' };
  const ch = await loadChapter(id);
  const sub = ch?.subtopics.find((s) => s.id === subId);
  if (!ch || !sub) return { redirect: `#/bab/${id}` };
  const pool = questionPool(ch, sub.id);
  const byId = new Map(pool.map((q) => [q.id, q]));
  const next = ch.subtopics[ch.subtopics.indexOf(sub) + 1];
  const level = c.hasGame ? GAME.levels.find((l) => l.sub === sub.id) : null;
  const KEY = `${id}/${sub.id}`;

  const top = `${crumbs([['Hub', '#/hub'], [`Bab ${c.number}`, `#/bab/${id}`], [`${sub.id} ${sub.title}`, `#/nota/${id}/${sub.id}`], ['Latihan']])}
    <header class="read-head" style="border:0;padding-bottom:0">
      <p class="eyebrow">Latihan · ${esc(chapterLabel(c))}</p>
      <h1 class="h1">${esc(sub.id)} ${esc(sub.title)}</h1>
      <div style="margin-top:12px">${journeyCompact('latih')}</div>
    </header>`;

  if (!pool.length) {
    return { title: `Latihan ${sub.id}`, nav: 'bab', surface: 'read', html: `<div class="wrap wrap-read"><div class="read">${top}<div style="margin-top:24px">${emptyState({ ico: 'pencil', title: 'Latihan belum tersedia', text: 'Subtopik ini belum mempunyai soalan yang boleh disemak secara automatik.', actions: `<a class="btn btn-primary" href="#/nota/${id}/${sub.id}">Kembali ke nota</a>` })}</div></div></div>` };
  }

  const html = `<div class="wrap wrap-read"><div class="read">${top}<p class="small muted" id="ex-resume" role="status" hidden></p><div id="ex-host" aria-live="polite"></div>
    <p class="source-line">Soalan asal daripada bank soalan nota Add Math (bukan soalan SPM sebenar). Setiap soalan ada dua cubaan; jawapan penuh ditunjuk selepas jawapan betul atau cubaan kedua.</p></div></div>`;

  const mount = (view) => {
    const host = view.querySelector('#ex-host');
    const attemptsHere = () => store.state().events.filter((e) => e.t === 'attempt' && e.ch === id && e.sub === sub.id);

    function newSet(prevIds = []) {
      const qids = pickSet(pool, outcomes(attemptsHere()), prevIds, mulberry32(Date.now() & 0xffffffff));
      const a = { id: `s${Date.now().toString(36)}${Math.floor(Math.random() * 1e6).toString(36)}`, qids, i: 0, results: [], cur: { try: 1, wrong: [], text: '' }, startedAt: new Date().toISOString() };
      store.setActive(KEY, a);
      return store.active(KEY);
    }

    let set = store.active(KEY);
    if (set && set.qids.every((q) => byId.has(q)) && set.results.length < set.qids.length) {
      const note = view.querySelector('#ex-resume');
      note.textContent = `Menyambung set latihan anda: soalan ${set.results.length + 1} daripada ${set.qids.length}.`;
      note.hidden = false;
    } else set = newSet();

    // UI-only state for the current question.
    // ui.qid pins the question on screen: after it is resolved, set.results already
    // counts it, but its feedback stays visible until "Soalan seterusnya".
    const ui = { qid: set.qids[set.results.length], pick: null, text: set.cur.text || '', msg: '', resolved: null, retry: null, tried: [] };
    const q = () => byId.get(ui.qid);
    const save = () => store.setActive(KEY, set);

    const dots = () => `<ol class="dots" aria-hidden="true">${set.qids.map((_, k) => { const r = set.results[k]; return `<li class="${r ? (r.ok ? 'is-right' : 'is-wrong') : k === set.qids.indexOf(ui.qid) ? 'is-current' : ''}"></li>`; }).join('')}</ol>`;

    function resolvedHtml(qq) {
      const r = ui.resolved; // { ok, first }
      const fb = qq.type === 'mcq' && ui.pick !== null ? qq.options[ui.pick].feedback : ui.check?.html;
      const title = r.ok ? (r.first ? 'Betul!' : 'Betul pada cubaan kedua') : 'Belum tepat';
      return `<div class="feedback ${r.ok ? 'is-right' : 'is-wrong'}" role="status">
          <p class="feedback-title">${icon(r.ok ? 'check' : 'x')}${title}</p>
          ${fb && !(r.ok && qq.type !== 'mcq' && fb === 'Betul.') ? `<div class="prose small">${renderMath(fb)}</div>` : ''}
          ${r.ok ? '' : `<p class="correct-line"><b>Jawapan betul:</b> ${answerHtml(qq)}</p>`}
        </div>
        ${qq.solution?.length ? `<details class="explain"${r.ok ? '' : ' open'}><summary>${icon('bulb')}Penyelesaian penuh</summary><ol class="prose">${qq.solution.map((s) => `<li>${renderMath(s)}</li>`).join('')}</ol></details>` : ''}`;
    }

    function view1() {
      const qq = q(), n = set.qids.indexOf(ui.qid), total = set.qids.length, last = n === total - 1;
      const tryNo = set.cur.try, done = !!ui.resolved;
      const correctIdx = qq.type === 'mcq' ? qq.options.findIndex((o) => o.correct) : -1;
      const triedList = done ? ui.tried : set.cur.wrong;
      const opt = (o, k) => {
        const tried = triedList.includes(k);
        let cls = '';
        if (done) cls = k === correctIdx ? ' is-right' : (k === ui.pick || tried) ? ' is-wrong' : ' is-dim';
        else if (tried) cls = ' is-tried';
        const mark = done && k === correctIdx ? icon('check', 'Jawapan betul') : (done && (k === ui.pick || tried)) || tried ? icon('x', 'Pilihan salah') : '';
        return `<li><button type="button" class="option${cls}" role="radio" aria-checked="${k === ui.pick}" data-opt="${k}"${done || tried ? ' disabled' : ''}><span class="opt-key">${KEYS[k]}</span><span class="opt-text">${renderMath(o.text)}</span><span class="opt-mark">${mark}</span></button></li>`;
      };
      const field = qq.type === 'mcq'
        ? `<ul class="options" role="radiogroup" aria-label="Pilihan jawapan">${qq.options.map(opt).join('')}</ul>`
        : `<div class="answer-field"><label for="ans">Jawapan anda${qq.unit ? ` (${renderMath(qq.unit)})` : ''}</label>
            <input id="ans" type="text" inputmode="${qq.type === 'numeric' ? 'decimal' : 'text'}" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(ui.text)}"${done ? ` readonly class="${ui.resolved.ok ? 'is-right' : 'is-wrong'}"` : ''}>
            <span class="hint">${INPUT_HINT[qq.type]}</span><span class="inline-msg" id="ans-msg">${ui.msg}</span></div>`;
      const ready = qq.type === 'mcq' ? ui.pick !== null : ui.text.trim() !== '';
      const status = done ? '' : tryNo === 2 ? 'Cubaan kedua' : ready ? 'Sedia untuk disemak' : qq.type === 'mcq' ? 'Pilih satu jawapan' : 'Tulis jawapan anda';
      host.innerHTML = `
        <div class="ex-top"><span class="ex-count">Soalan ${n + 1} daripada ${total}</span>${dots()}</div>
        <article class="qcard" aria-labelledby="q-prompt">
          <div class="qcard-body">
            <div class="qmeta">${tag(TYPE[qq.type])}${qq.difficulty ? tag(LEVEL[qq.difficulty] || qq.difficulty, qq.difficulty === 'mencabar' ? 'progress' : 'ready') : ''}${tryNo === 2 && !done ? tag('Cubaan 2 daripada 2', 'progress') : ''}</div>
            <div class="qprompt" id="q-prompt">${renderMath(qq.prompt)}</div>
            ${field}
          </div>
          ${done ? resolvedHtml(qq) : ui.retry ? `<div class="feedback is-retry" role="status"><p class="feedback-title">${icon('refresh')}Cuba sekali lagi</p><div class="prose small">${renderMath(ui.retry)}</div><p class="small muted">Jawapan penuh ditunjuk selepas cubaan kedua.</p></div>` : ''}
          <div class="qactions">
            <span class="qstatus">${status}</span>
            ${done ? `<button type="button" class="btn btn-primary" data-act="next">${last ? 'Lihat keputusan' : 'Soalan seterusnya'} ${icon('arrow')}</button>`
              : `<button type="button" class="btn btn-ok" data-act="submit"${ready ? '' : ' disabled'}>${icon('check')}${tryNo === 2 ? 'Semak cubaan kedua' : 'Semak jawapan'}</button>`}
          </div>
        </article>`;
      bind(qq);
    }

    function bind(qq) {
      host.querySelectorAll('[data-opt]:not([disabled])').forEach((b) => b.addEventListener('click', () => {
        ui.pick = Number(b.dataset.opt); view1(); host.querySelector(`[data-opt="${ui.pick}"]`)?.focus();
      }));
      const radios = [...host.querySelectorAll('[data-opt]:not([disabled])')];
      radios.forEach((b, k) => b.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); radios[(k + d + radios.length) % radios.length].focus(); }
      }));
      const input = host.querySelector('#ans:not([readonly])');
      if (input) {
        input.addEventListener('input', () => {
          ui.text = input.value; ui.msg = '';
          const ok = input.value.trim() !== '';
          host.querySelector('[data-act="submit"]').disabled = !ok;
          host.querySelector('.qstatus').textContent = set.cur.try === 2 ? 'Cubaan kedua' : ok ? 'Sedia untuk disemak' : 'Tulis jawapan anda';
          host.querySelector('#ans-msg').textContent = '';
        });
        input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); submit(qq); } });
      }
      host.querySelector('[data-act="submit"]')?.addEventListener('click', () => submit(qq));
      host.querySelector('[data-act="next"]')?.addEventListener('click', advance);
    }

    function submit(qq) {
      let ok, misc, fb;
      if (qq.type === 'mcq') {
        if (ui.pick === null) return;
        const o = qq.options[ui.pick]; ok = !!o.correct; misc = o.misconception; fb = o.feedback;
        ui.check = null;
      } else {
        const r = checkSingle(qq, ui.text);
        if (r.state === 'empty' || r.state === 'invalid') { ui.msg = r.html; view1(); host.querySelector('#ans')?.focus(); return; }
        ok = r.state === 'right'; ui.check = r;
        fb = r.html && !/^Belum tepat\./.test(r.html) ? r.html : RETRY_GENERIC; // generic text mentions the solution; not shown yet
      }
      const tryNo = set.cur.try;
      store.append(attempt({ ch: id, sub: sub.id, q: qq, set: set.id, tryNo, ok, misc }));
      if (!ok && tryNo === 1) {
        // First mistake: targeted feedback only, no answer, no solution.
        set.cur = { try: 2, wrong: qq.type === 'mcq' ? [ui.pick] : [], text: '' };
        save();
        ui.retry = fb; ui.pick = null; ui.text = qq.type === 'mcq' ? '' : ui.text;
        view1();
        (host.querySelector('[data-opt]:not([disabled])') || host.querySelector('#ans'))?.focus({ preventScroll: true });
        return;
      }
      ui.resolved = { ok, first: ok && tryNo === 1 };
      ui.retry = null; ui.tried = [...set.cur.wrong];
      set.results.push({ q: qq.id, first: ui.resolved.first, ok });
      set.cur = { try: 1, wrong: [], text: '' };
      save();
      view1();
      host.querySelector('[data-act="next"]')?.focus({ preventScroll: true });
    }

    function advance() {
      Object.assign(ui, { qid: set.qids[set.results.length], pick: null, text: '', msg: '', resolved: null, retry: null, check: null, tried: [] });
      if (set.results.length < set.qids.length) {
        view1();
        host.querySelector('.qprompt')?.scrollIntoView({ block: 'center', behavior: 'auto' });
        (host.querySelector('[data-opt]') || host.querySelector('#ans'))?.focus({ preventScroll: true });
      } else completion();
    }

    function completion() {
      const total = set.qids.length, right = set.results.filter((r) => r.ok).length, first = set.results.filter((r) => r.first).length;
      store.append(setDone({ ch: id, sub: sub.id, set: set.id, total, first, right }));
      const finished = set; store.clearActive(KEY);
      const lv = levelFor(outcomes(attemptsHere()), poolOf(pool));
      const pct = Math.round((right / total) * 100);
      const msg = first === total ? 'Cemerlang! Semua betul pada cubaan pertama.' : pct >= 60 ? 'Bagus. Semak penyelesaian soalan yang tersilap, kemudian teruskan.' : 'Baca semula nota dan cuba set baharu. Penyelesaian penuh ada untuk setiap soalan.';
      host.innerHTML = `<section class="qcard done" style="margin-top:16px" aria-labelledby="h-done">
        <div class="score-ring" style="--v:${pct}" role="img" aria-label="Betul ${right} daripada ${total}"><div><b>${right}/${total}</b><span>Betul</span></div></div>
        <h2 id="h-done" tabindex="-1">Latihan selesai</h2>
        <p>${msg}</p>
        <p style="margin-top:12px">${first} betul pada cubaan pertama · ${right - first} pada cubaan kedua</p>
        <p style="margin-top:12px;display:flex;gap:8px;justify-content:center;align-items:center;flex-wrap:wrap"><span class="small muted">Tahap penguasaan ${esc(sub.id)}:</span>${masteryTag(lv)}</p>
        <ul class="review-list">${finished.qids.map((qid, k) => { const r = finished.results[k]; const qq = byId.get(qid); return `<li class="${r.ok ? 'is-right' : 'is-wrong'}">${icon(r.ok ? 'check' : 'x', r.ok ? (r.first ? 'Betul pada cubaan pertama' : 'Betul pada cubaan kedua') : 'Salah')}<span class="rl-text"><b>S${k + 1}.</b> ${renderMath(qq.prompt)}${r.ok && !r.first ? ' <span class="small muted">(cubaan kedua)</span>' : ''}</span></li>`; }).join('')}</ul>
        <div class="btn-row">
          <button type="button" class="btn btn-secondary" data-act="again">${icon('refresh')}Latihan lagi (set baharu)</button>
          ${next ? `<a class="btn btn-primary" href="#/nota/${id}/${next.id}">Nota seterusnya: ${esc(next.id)} ${icon('arrow')}</a>` : `<a class="btn btn-primary" href="#/bab/${id}">Kembali ke Bab ${c.number} ${icon('arrow')}</a>`}
        </div>
        ${level ? `<p class="notice" style="margin-top:24px;text-align:left">${icon('gamepad')}<span>Sedia untuk cabaran? Konsep ini digunakan dalam <b>Level ${level.no}: ${esc(level.title)}</b>. <a href="#/main">Ke halaman game</a></span></p>` : ''}
        <p class="small muted" style="margin-top:20px">${store.demo ? 'Mod demo: keputusan ini tidak disimpan.' : 'Keputusan disimpan dalam pelayar ini.'} <a href="#/hub">Kembali ke Learning Hub</a></p>
      </section>`;
      host.querySelector('#h-done').focus({ preventScroll: false });
      host.querySelector('[data-act="again"]').addEventListener('click', () => {
        set = newSet(finished.qids);
        view.querySelector('#ex-resume').hidden = true;
        Object.assign(ui, { qid: set.qids[0], pick: null, text: '', msg: '', resolved: null, retry: null, check: null, tried: [] });
        view1();
      });
    }

    view1();
  };
  return { title: `Latihan ${sub.id} ${sub.title}`, nav: 'bab', surface: 'read', html, mount };
}
