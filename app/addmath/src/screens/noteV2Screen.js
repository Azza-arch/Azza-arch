/*
 * ADD MATH / Read mode: prototype of 2.3 within the existing cream/blue world.
 * Contract: desktop subtopic rail + readable content; mobile selector + three modes.
 * First viewport: objective, direct destinations, and the idea behind a parabola.
 * Signature interaction: change the graph's parameters, then read its vertex;
 * formula-to-explanation and wrong-answer-to-concept links preserve the learning path.
 * No source content/status edits. No rollout beyond Bab 2 before owner review.
 */
import { loadChapterNotes } from '../content/notes/index.js';
import { previewMode, visibleStatus } from '../notes/preview.js';
import { renderMath, ensureKatexCss, tex } from '../notes/math.js';
import { mountVisual } from '../notes/visuals.js';
import { renderQuestions } from '../notes/practice.js';
import { PLAN, FORMULA_GUIDES } from '../notes/v2/quadraticPlan.js';
import { navigate } from '../utils/router.js';

const R = String.raw;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const levels = { mudah: 'Asas', sederhana: 'Sederhana', mencabar: 'Cabaran' };
const modes = { fahami: 'Fahami', 'ulang-kaji': 'Ulang kaji', latihan: 'Latihan' };
const href = (mode, target = '') => `#/nota-v2/t4-2/2.3/${mode}${target ? `/${target}` : ''}`;
const fullHref = (sub, section) => sub === '2.3' ? href('fahami', `s${section}`) : `#/nota/t4-2/${sub}/s${section}`;
const drafts = new Map();
let loadVersion = 0;

// Break long equalities into readable lines; only the typesetting changes.
function math(html) {
  return renderMath(String(html ?? '').replace(/\\\[([\s\S]+?)\\\]/g, (all, expression) => {
    if (expression.length < 75 || !expression.includes(' = ') || expression.includes('\\begin')) return all;
    const [first, ...rest] = expression.split(' = ');
    return `\\[\\begin{aligned}${first}${rest.map(x => `\\\\ &= ${x}`).join('')}\\end{aligned}\\]`;
  }));
}

function section(s, i) {
  return `<section class="v2-section" id="s${i}" tabindex="-1" data-source-section="${i}">
    <h2>${esc(s.title)}</h2>${math(s.html)}</section>`;
}

function example(e, index, label) {
  return `<article class="v2-example" data-example-index="${index}">
    <header><h3>${esc(label || `Contoh ${index + 1}`)}</h3><span>${levels[e.level]}</span></header>
    <div class="v2-question">${math(e.question)}</div>
    <dl class="v2-example-frame"><div><dt>Diberi</dt><dd>${math(e.given)}</dd></div><div><dt>Cari</dt><dd>${math(e.find)}</dd></div><div><dt>Kaedah</dt><dd>${math(e.method)}</dd></div></dl>
    <ol class="v2-steps">${e.steps.map(st => `<li><div>${math(st.do)}</div>${st.why ? `<p class="v2-why">${math(st.why)}</p>` : ''}</li>`).join('')}</ol>
    <p><strong>Semak:</strong> ${math(e.check)}</p><p>${math(e.conclusion)}</p></article>`;
}

function mistakes(items) {
  return items.map(m => `<div class="v2-mistake"><p><span class="v2-wrong">Kesilapan:</span> ${math(m.wrong)}</p><p>${math(m.why)}</p><p><strong>Pembetulan:</strong> ${math(m.fix)}</p></div>`).join('');
}

function understand(chapter, sub) {
  const ss = sub.sections, examples = ss[PLAN.examples].items;
  return `<header class="v2-heading"><h1>Baca bentuk dan graf kuadratik</h1><p class="v2-objective">${PLAN.objective}</p></header>
    <nav class="v2-jumps" aria-label="Cari dalam nota"><a href="${href('fahami', 'graf')}">Graf interaktif</a><a href="${href('ulang-kaji', 'formula-2-3-1')}">Paksi simetri</a><a href="${href('fahami', 'contoh')}">Contoh berlangkah</a><a href="${href('fahami', 'ringkasan')}">Ringkasan</a></nav>
    <section class="v2-section v2-idea"><h2>Idea utama</h2>${math(R`<p>Graf fungsi kuadratik ialah parabola. Tanda \(a\) menentukan arah bukaan; bucu ialah titik minimum atau maksimum. Pintasan menunjukkan tempat graf bertemu paksi.</p><p>Gunakan \(f(x)=ax^2+bx+c\), dengan \(a\ne0\). Jika \(a=0\), fungsi itu bukan kuadratik.</p>`)}</section>
    <details class="v2-disclosure" data-source-section="0"><summary>${esc(ss[0].title)} — kaitan dengan kehidupan</summary>${math(ss[0].html)}</details>
    <section class="v2-section v2-prereq"><h2>Asas yang digunakan</h2>${math(chapter.subtopics[0].sections[1].html)}<a href="#/nota/t4-2/2.1/s2">Ulang penyempurnaan kuasa dua</a></section>
    ${section(ss[1], 1)}
    <section class="v2-section" id="graf" tabindex="-1"><h2>Teroka parabola</h2><p>Ubah satu nilai pada satu masa. Perhatikan arah bukaan, paksi simetri dan titik pusingan.</p>
      <div class="v2-graph-tabs" role="tablist" aria-label="Bentuk fungsi">${PLAN.visuals.map((i, n) => `<button role="tab" type="button" id="graph-tab-${n}" aria-controls="graph-panel-${n}" aria-selected="${n === 0}" tabindex="${n === 0 ? 0 : -1}">${n === 0 ? 'Bentuk am: a, b, c' : 'Bentuk verteks: a, h, k'}</button>`).join('')}</div>
      ${PLAN.visuals.map((i, n) => `<div role="tabpanel" id="graph-panel-${n}" aria-labelledby="graph-tab-${n}" data-source-section="${i}" ${n ? 'hidden' : ''}>${math(ss[i].html)}<figure class="visual-fig"><div data-v2-visual="${i}"></div><figcaption><details><summary>Penerangan teks graf</summary>${math(ss[i].alt)}</details></figcaption></figure></div>`).join('')}</section>
    ${section(ss[2], 2)}${section(ss[4], 4)}${section(ss[5], 5)}
    <section class="v2-section" id="contoh" tabindex="-1"><h2>Dua contoh untuk membina kefahaman</h2><p>Baca bucu dahulu, kemudian lihat bagaimana bentuk am ditukar kepada bentuk verteks.</p>
      ${example(examples[0], 0, 'Contoh asas · Baca bucu')}${example(examples[2], 2, 'Contoh berlangkah · Sempurnakan kuasa dua')}
    </section>
    ${section(ss[7], 7)}${section(ss[8], 8)}
    <section class="v2-section" id="tambahan" tabindex="-1" data-source-section="10"><h2>Contoh tambahan</h2><p>Pilih mengikut kemahiran yang ingin anda semak. Semua langkah dan sebab pengiraan disertakan.</p>
      ${examples.map((e, i) => PLAN.featuredExamples.includes(i) ? '' : `<details class="v2-disclosure"><summary>Contoh ${i + 1} · ${esc(['Baca bucu', 'Bandingkan pekali', 'Bentuk verteks', 'Buktikan fungsi sentiasa positif', 'Lakar graf berlabel', 'Luas maksimum kandang', 'Tinggi maksimum bola'][i])}<span>${levels[e.level]}</span></summary>${example(e, i)}</details>`).join('')}
    </section>
    <section class="v2-section" id="kesilapan" tabindex="-1" data-source-section="11"><h2>Kesilapan yang perlu dielakkan</h2>${mistakes(ss[11].items)}</section>
    <section class="v2-section" id="ringkasan" tabindex="-1" data-source-section="12"><h2>Ingat empat perkara ini</h2><ul>${ss[12].points.map(x => `<li>${math(x)}</li>`).join('')}</ul><a class="v2-action" href="${href('latihan')}">Cuba latihan 2.3</a> <a href="${href('ulang-kaji')}">Lihat rumus Bab 2</a></section>
    <section class="v2-section" data-source-section="13"><h2>Kaitan seterusnya</h2>${math(ss[13].html)}${ss[13].links.map(l => `<a href="${l.href}">${esc(l.label)}</a>`).join('')}</section>`;
}

function revise(chapter) {
  return `<header class="v2-heading"><h1>Rujukan pantas Bab 2</h1><p class="v2-objective">Cari rumus, semak syarat, kemudian pilih kaedah yang sesuai. Gunakan pautan penerangan penuh jika langkahnya belum jelas.</p></header>
    <label class="v2-search">Cari rumus atau kaedah<input id="v2-formula-search" type="search" placeholder="Contoh: paksi simetri, punca, verteks" autocomplete="off"></label>
    <nav class="v2-jumps" aria-label="Rumus bab">${chapter.subtopics.map(s => `<a href="${href('ulang-kaji', `recap-${s.id.replace('.', '-')}`)}">${s.id} ${esc(s.title)}</a>`).join('')}</nav>
    <p id="v2-search-count" role="status"></p>
    ${chapter.subtopics.map(sub => {
      const formulas = sub.sections.find(s => s.kind === 'formula').items;
      const examples = sub.sections.find(s => s.kind === 'examples').items;
      const errors = sub.sections.find(s => s.kind === 'mistakes').items;
      return `<section class="v2-recap-group" id="recap-${sub.id.replace('.', '-')}" tabindex="-1"><h2>${sub.id} ${esc(sub.title)}</h2>
        ${formulas.map((f, i) => { const g = FORMULA_GUIDES[sub.id][i];
          return `<article class="v2-formula" id="formula-${sub.id.replace('.', '-')}-${i}" tabindex="-1" data-search="${esc(`${g.title} ${g.when} ${sub.title} ${sub.sections[g.section].title} ${g.keywords || ''}`.toLowerCase())}" data-formula-source="${sub.id}:${i}"><h3>${g.title}</h3>
            ${sub.id === '2.2' ? `${tex('D = b^2 - 4ac', true)}<ul class="v2-root-types"><li>${tex('D > 0')}: dua punca nyata berbeza</li><li>${tex('D = 0')}: dua punca nyata sama</li><li>${tex('D < 0')}: tiada punca nyata</li></ul>` : tex(f.tex, true)}
            <div>${math(f.html)}</div><p><strong>Syarat:</strong> ${math(g.condition)}</p><p><strong>Bila guna:</strong> ${g.when}</p><a href="${fullHref(sub.id, g.section)}">Fahami ${g.title.toLowerCase()} sepenuhnya</a></article>`;
        }).join('')}
        <details class="v2-disclosure"><summary>Langkah kaedah & kesilapan · ${sub.id}</summary>
          ${examples.map(e => `<div class="v2-method"><h3>${math(e.method)}</h3><div>${math(e.question)}</div><ol>${e.steps.map(st => `<li>${math(st.do)}</li>`).join('')}</ol></div>`).join('')}
          <h3>Elakkan kesilapan ini</h3>${mistakes(errors)}
          <a href="${sub.id === '2.3' ? href('fahami', 'contoh') : `#/nota/t4-2/${sub.id}`}">Baca contoh penuh berserta sebab pengiraan</a></details></section>`;
    }).join('')}`;
}

function practiceShell(chapter) {
  return `<header class="v2-heading"><h1>Latihan mengikut kemahiran</h1><p class="v2-objective">Pilih soalan untuk menguji kefahaman. Nota dan penyelesaian sentiasa boleh dibuka.</p></header>
    <details class="v2-practice-filters" ${matchMedia('(min-width: 801px)').matches ? 'open' : ''}><summary>Tapis soalan <span id="v2-filter-summary">2.3 · Semua tahap</span></summary>
    <div class="v2-filters"><label>Subtopik latihan<select id="v2-practice-sub">${chapter.subtopics.map(s => `<option value="${s.id}" ${s.id === '2.3' ? 'selected' : ''}>${s.id} ${esc(s.title)}</option>`).join('')}</select></label><label>Kemahiran<select id="v2-practice-skill"></select></label></div>
    <div class="v2-levels" role="group" aria-label="Tahap latihan">${[['all', 'Semua'], ...Object.entries(levels)].map(([value, label]) => `<button type="button" data-level="${value}" aria-pressed="${value === 'all'}">${label}</button>`).join('')}</div>
    </details><p class="v2-result-count" role="status"></p><label class="v2-question-picker">Pilih soalan<select id="v2-question-picker"></select></label>
    <div class="v2-practice-body"></div>`;
}

function wirePractice(root, chapter, target) {
  const subSelect = root.querySelector('#v2-practice-sub'), skill = root.querySelector('#v2-practice-skill'), picker = root.querySelector('#v2-question-picker'), host = root.querySelector('.v2-practice-body');
  let level = 'all', current;
  const save = () => {
    if (!current) return;
    drafts.set(current.id, { inputs: [...host.querySelectorAll('.q-input')].map(i => i.value), feedback: [...host.querySelectorAll('.q-feedback')].map(f => ({ html: f.innerHTML, cls: f.className })), options: [...host.querySelectorAll('.q-option')].map(o => o.className), open: !!host.querySelector('.q-solution')?.open });
  };
  const show = q => {
    save(); current = q;
    if (!q) { host.innerHTML = '<p>Tiada soalan pada gabungan ini. Pilih tahap “Semua” atau kemahiran lain.</p>'; return; }
    history.replaceState(null, '', href('latihan', q.id));
    host.innerHTML = '<div class="q-list"></div><div class="v2-review-links"></div>';
    renderQuestions(host.querySelector('.q-list'), [q]);
    host.querySelector('.q-num').textContent = `Soalan ${chapter.questions.filter(x => x.subtopic === q.subtopic).findIndex(x => x.id === q.id) + 1}`;
    host.querySelectorAll('.q-tag').forEach(t => { if (t.textContent === 'Mudah') t.textContent = 'Asas'; if (t.textContent === 'Mencabar') t.textContent = 'Cabaran'; });
    const sub = chapter.subtopics.find(s => s.id === q.subtopic);
    const concepts = sub.sections.map((s, i) => ({ ...s, i })).filter(s => s.kind === 'concept' && s.sp.some(sp => q.sp.includes(sp)));
    host.querySelector('.v2-review-links').innerHTML = `<p>Perlu semak konsep?</p>${concepts.map(s => `<a href="${fullHref(sub.id, s.i)}">${esc(s.title)}</a>`).join('')}`;
    const saved = drafts.get(q.id);
    if (saved) {
      host.querySelectorAll('.q-input').forEach((input, i) => input.value = saved.inputs[i] || '');
      host.querySelectorAll('.q-feedback').forEach((f, i) => { if (saved.feedback[i]) { f.innerHTML = saved.feedback[i].html; f.className = saved.feedback[i].cls; } });
      host.querySelectorAll('.q-option').forEach((o, i) => o.className = saved.options[i]);
      host.querySelector('.q-solution').open = saved.open;
    }
    host.oninput = save; host.onclick = () => queueMicrotask(save); host.onkeyup = () => queueMicrotask(save);
  };
  function filter(selected) {
    root.querySelector('#v2-filter-summary').textContent = `${subSelect.value} · ${levels[level] || 'Semua tahap'}${skill.value ? ` · SP ${skill.value}` : ''}`;
    const qs = chapter.questions.filter(q => visibleStatus(q.status) && q.subtopic === subSelect.value && (level === 'all' || q.difficulty === level) && (!skill.value || q.sp.includes(skill.value)));
    root.querySelector('.v2-result-count').textContent = `${qs.length} soalan · ${skill.selectedOptions[0]?.textContent || 'Semua kemahiran'}`;
    picker.innerHTML = qs.map((q, i) => `<option value="${q.id}">${i + 1}. ${levels[q.difficulty]} · SP ${q.sp.join(', ')} · ${q.type === 'structured' ? 'Berstruktur' : q.type === 'reasoning' ? 'Penaakulan' : q.type === 'mcq' ? 'Objektif' : 'Jawapan ringkas'}</option>`).join('');
    picker.disabled = !qs.length;
    const chosen = qs.find(q => q.id === selected) || qs[0]; if (chosen) picker.value = chosen.id; show(chosen);
  }
  function setSkills() {
    const sub = chapter.subtopics.find(s => s.id === subSelect.value);
    skill.innerHTML = '<option value="">Semua kemahiran</option>' + sub.sp.map(sp => `<option value="${sp}">${sp} · ${esc(sub.sections.find(s => s.kind === 'concept' && s.sp?.includes(sp))?.title || sp)}</option>`).join('');
  }
  const requested = chapter.questions.find(q => q.id === target);
  if (requested) subSelect.value = requested.subtopic;
  setSkills(); filter(target);
  subSelect.onchange = () => { setSkills(); filter(); };
  skill.onchange = () => filter();
  root.querySelectorAll('[data-level]').forEach(button => button.onclick = () => {
    level = button.dataset.level;
    root.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    filter();
  });
  picker.onchange = () => show(chapter.questions.find(q => q.id === picker.value));
}

export async function renderNoteV2Screen(root, chapterId, subId, mode = 'fahami', target = '') {
  const version = ++loadVersion, route = location.hash;
  if (!previewMode() || chapterId !== 't4-2' || subId !== '2.3') { navigate('bab/t4-2'); return; }
  if (!modes[mode]) { navigate('nota-v2/t4-2/2.3/fahami'); return; }
  ensureKatexCss();
  if (!document.querySelector('#nota-v2-css')) {
    const link = document.createElement('link'); link.id = 'nota-v2-css'; link.rel = 'stylesheet'; link.href = new URL('../../styles/nota-v2.css', import.meta.url).href; document.head.append(link);
  }
  root.innerHTML = '<p class="note-loading">Memuatkan nota…</p>';
  const chapter = await loadChapterNotes('t4-2');
  if (version !== loadVersion || location.hash !== route) return;
  const sub = chapter.subtopics.find(s => s.id === '2.3');
  if (!visibleStatus(chapter.status) || !visibleStatus(sub.status)) { navigate('bab/t4-2'); return; }
  const subLinks = chapter.subtopics.map(s => `<a href="${s.id === '2.3' ? href('fahami') : `#/nota/t4-2/${s.id}`}" ${s.id === '2.3' ? 'aria-current="page"' : ''}><span>${s.id}</span>${esc(s.title)}${s.id !== '2.3' ? '<small>Nota asal</small>' : ''}</a>`).join('');
  root.innerHTML = `<div class="nota-v2"><a class="v2-skip" href="#v2-content">Terus ke kandungan</a>
    <div class="v2-notice" role="note">Prototype semakan · Bab 2 · Status review <a href="#/nota/t4-2/2.3">Bandingkan nota asal</a></div>
    <header class="v2-top"><a href="#/bab/t4-2">Add Math / Tingkatan 4 / Bab 2</a><span>Fungsi Kuadratik</span></header>
    <div class="v2-layout"><aside class="v2-sidebar"><nav aria-label="Subtopik Bab 2"><p>Dalam bab ini</p>${subLinks}</nav><nav class="v2-sidebar-jumps" aria-label="Pautan pantas">${PLAN.coreConcepts.map(i => `<a href="${href('fahami', `s${i}`)}">${esc(sub.sections[i].title)}</a>`).join('')}</nav><div class="v2-chapters"><a href="#/bab/t4-1">← Bab 1: Fungsi</a><a href="#/bab/t4-3">Bab 3: Sistem Persamaan →</a></div></aside>
    <div class="v2-reading">${mode !== 'latihan' ? `<label class="v2-mobile-sub">Subtopik<select id="v2-subtopic">${chapter.subtopics.map(s => `<option value="${s.id}" ${s.id === '2.3' ? 'selected' : ''}>${s.id} ${esc(s.title)}${s.id === '2.3' ? '' : ' (nota asal)'}</option>`).join('')}</select></label>` : ''}
    <nav class="v2-modes" aria-label="Mod pembelajaran">${Object.entries(modes).map(([key, label]) => `<a href="${href(key)}" ${key === mode ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <main class="v2-main" id="v2-content" tabindex="-1">${mode === 'fahami' ? understand(chapter, sub) : mode === 'ulang-kaji' ? revise(chapter) : practiceShell(chapter)}</main>
    <footer class="v2-footer"><p>Nota 2.3 meliputi SP 2.3.1–2.3.6. Semua kandungan masih dalam semakan.</p><a href="#/bab/t4-1">← Bab sebelumnya</a><a href="#/bab/t4-3">Bab berikutnya →</a></footer></div></div></div>`;
  root.querySelector('#v2-subtopic')?.addEventListener('change', e => navigate(e.target.value === '2.3' ? 'nota-v2/t4-2/2.3/fahami' : `nota/t4-2/${e.target.value}`));
  root.querySelector('.v2-skip').onclick = e => { e.preventDefault(); root.querySelector('main').focus(); };
  if (mode === 'fahami') {
    PLAN.visuals.forEach(i => mountVisual(root.querySelector(`[data-v2-visual="${i}"]`), sub.sections[i].spec));
    const tabs = [...root.querySelectorAll('.v2-graph-tabs [role="tab"]')];
    function select(tab) { tabs.forEach(t => { const active = t === tab; t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; root.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !active; }); }
    tabs.forEach((tab, i) => { tab.onclick = () => select(tab); tab.onkeydown = e => {
      const n = { ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[e.key];
      if (n !== undefined) { e.preventDefault(); select(tabs[n]); tabs[n].focus(); }
    }; });
  } else if (mode === 'ulang-kaji') {
    root.querySelector('#v2-formula-search').oninput = e => {
      const term = e.target.value.toLowerCase().trim(); let count = 0;
      root.querySelectorAll('.v2-formula').forEach(f => { f.hidden = !f.dataset.search.includes(term); if (!f.hidden) count++; });
      root.querySelectorAll('.v2-recap-group').forEach(g => g.hidden = !g.querySelector('.v2-formula:not([hidden])'));
      root.querySelector('#v2-search-count').textContent = `${count} rumus ditemui${count ? '' : '. Cuba “punca”, “verteks” atau “simetri”.'}`;
    };
  } else wirePractice(root, chapter, target);
  // Same-mode anchor jumps do not reconstruct graphs or erase an answer.
  root.querySelectorAll('a[href]').forEach(a => a.addEventListener('click', e => {
    const prefix = href(mode) + '/';
    if (a.getAttribute('href').startsWith(prefix) && mode !== 'latihan') {
      const id = a.getAttribute('href').slice(prefix.length), el = root.querySelector(`[id="${id}"]`);
      if (el) { e.preventDefault(); el.scrollIntoView(); el.focus({ preventScroll: true }); history.replaceState(null, '', a.href); }
    }
  }));
  if (target && mode !== 'latihan') requestAnimationFrame(() => {
    if (location.hash !== route) return;
    const el = document.getElementById(target); el?.scrollIntoView(); el?.focus({ preventScroll: true });
  });
}
