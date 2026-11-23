// DENAI Learning Hub smoke test — v2 (four tabs, learning paths, full content).
// Desktop 1280 + phone 390 (full journey), tablet 820 (navigation + journey), then:
//   * shell: exactly four tabs (Utama, Belajar, Game, Kemajuan), landing on #/, no nav CTA;
//   * Utama: one primary action, real next step, unfinished set offered as "Sambung belajar";
//   * Belajar: Tingkatan → chapter path → subtopic path → Nota / Contoh / Latihan; honest
//     status for every Tingkatan 5 chapter; review content hidden without ?semak=1;
//   * notes: every published worked example, formula, mistake, visual and explanation
//     section of every subtopic is on the page; step-by-step examples;
//   * exercises: two attempts, no answer after the first mistake, resume after reload,
//     progressive hints that never show the last two steps, and a correct answer is
//     accepted for the first question of EVERY subtopic's practice pool;
//   * written questions: every auto-checkable part of every structured question accepts
//     its answer key; reasoning parts reveal the model solution;
//   * progress persists, demo mode isolated, data erase keeps game saves, contrast,
//     link crawl, console errors, the real game still boots Phaser 3.90.0.
// Usage: node denai/hub/tests/hub-smoke.cjs
const { chromium } = require('playwright');
const { ORIGIN, attach } = require('./serve.cjs');

const HUB = `${ORIGIN}/denai/hub/`;
const KEY = 'denai-hub-progress-v1';
let failures = 0;
const ok = (cond, msg) => { if (cond) console.log(`  ✓ ${msg}`); else { failures++; console.log(`  ✗ ${msg}`); } };

async function settle(page) { await page.waitForFunction(() => !document.querySelector('#view .loading')); await page.waitForTimeout(150); }
async function go(page, path) { await page.goto(HUB + path); await settle(page); }
async function reload(page) { await page.reload(); await settle(page); }
const h1 = (page) => page.locator('#view h1').first().innerText();
const record = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{"events":[],"active":{}}'), KEY);
const count = async (page, t) => (await record(page)).events.filter((e) => !t || e.t === t).length;
const tab = (page, mobile, key) => page.click(mobile ? `#tabbar [data-nav="${key}"]` : `.navlinks [data-nav="${key}"]`);

// The question currently on screen, with what is needed to answer it right or wrong.
const current = (page, key) => page.evaluate(async ([k, storeKey]) => {
  const a = JSON.parse(localStorage.getItem(storeKey)).active[k];
  const [ch, sub] = k.split('/');
  const { loadChapter, questionPool } = await import('/denai/hub/js/data.js');
  const q = questionPool(await loadChapter(ch), sub).find((x) => x.id === a.qids[a.results.length]);
  return { type: q.type, right: q.type === 'mcq' ? q.options.findIndex((o) => o.correct) : String(q.answer), wrongIdx: q.type === 'mcq' ? q.options.findIndex((o) => !o.correct) : null, pos: a.results.length, total: a.qids.length, setId: a.id, qids: a.qids, steps: (q.solution || []).length };
}, [key, KEY]);

async function answer(page, cur, right, alsoTryInvalid = false) {
  if (cur.type === 'mcq') await page.click(`[data-opt="${right ? cur.right : cur.wrongIdx}"]:not([disabled])`);
  else {
    if (alsoTryInvalid) {
      await page.fill('#ans', 'abc'); await page.click('[data-act="submit"]');
      ok((await page.locator('#ans-msg').innerText()).length > 0 && await page.locator('.feedback').count() === 0, 'Invalid typed answer: inline message, not counted as a try');
    }
    await page.fill('#ans', right ? cur.right : '987654');
  }
  await page.click('[data-act="submit"]');
}

async function shell(page, mobile) {
  console.log('Shell and navigation');
  await go(page, '#/');
  ok((await h1(page)).includes('Fahami Add Math'), 'Landing page on #/');
  const labels = await page.$$eval(mobile ? '#tabbar [data-nav]' : '.navlinks [data-nav]', (as) => as.map((a) => `${a.textContent.trim()}→${a.getAttribute('href')}`));
  ok(JSON.stringify(labels) === JSON.stringify(['Utama→#/hub', 'Belajar→#/bab', 'Game→#/main', 'Kemajuan→#/kemajuan']), `Exactly four tabs: ${labels.join(', ')}`);
  ok(await page.locator('.nav-cta').count() === 0, 'No competing call-to-action in the navigation bar');
  ok(await page.locator('[data-nav][aria-current]').count() === 0, 'Landing: no tab marked current');
  ok(await page.locator('.brand').getAttribute('href') === '#/', 'Logo leads to the landing page');
  const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement)[innerWidth < 960 ? 'scrollPaddingBottom' : 'scrollPaddingTop']));
  ok(pad >= 56, `Scroll padding keeps focused content clear of the fixed bar (${pad}px)`);
}

async function journey(page, mobile) {
  console.log('Fresh learner journey');
  await page.click('a:has-text("Mula Belajar")'); await settle(page);
  ok(page.url().endsWith('#/hub') && (await h1(page)).includes('Selamat datang'), 'Utama (#/hub): new learner view from an empty record');
  ok(await page.locator('#view .btn-primary').count() === 1, 'Utama: exactly one primary action');
  ok(await page.locator('#modebar').isHidden() && await page.locator('[data-persona]').count() === 0, 'No demo banner or demo switch in real mode');
  ok(await page.locator(`${mobile ? '#tabbar' : '.navlinks'} [data-nav="hub"][aria-current="page"]`).count() === 1, 'Utama tab marked current');
  await tab(page, mobile, 'bab'); await settle(page);
  ok(await page.locator('.path > .path-node').count() === 10, 'Belajar: Tingkatan 4 path lists 10 chapters');
  ok(await page.locator('.path-node.is-current').count() === 1, 'Belajar: one chapter marked "Anda di sini"');
  await page.click('.seg a:has-text("Tingkatan 5")'); await settle(page);
  ok(await page.locator('.path > .path-node').count() === 8, 'Tingkatan 5 path lists 8 chapters');
  // 2026-11-23: all of Tingkatan 5 was accepted and published (owner product decision), so no
  // chapter is "Sedang disemak" or "Belum ditulis" any more; the review-hiding path stays in the
  // code (preview.js) but has no real content to exercise.
  ok(await page.locator('.path-node .tag-review').count() === 0 && await page.locator('.path-node:has-text("belum ditulis")').count() === 0, 'Tingkatan 5: all 8 chapters published, none "Sedang disemak" or "Belum ditulis"');
  await page.click('.path-link[href="#/bab/t5-2"]'); await settle(page);
  ok((await h1(page)).includes('Pembezaan') && await page.locator('.path-sub .path-node').count() === 4, 'T5 chapter page: Pembezaan lists its 4 subtopics publicly');
  await go(page, '#/nota/t5-2/2.1');
  ok(page.url().endsWith('#/nota/t5-2/2.1') && (await h1(page)).includes('2.1'), 'Published T5 note opens without owner preview');
  await go(page, '#/nota/t5-8/8.3');
  ok(page.url().endsWith('#/nota/t5-8/8.3') && (await h1(page)).includes('8.3'), 'New T5 Bab 8 note opens publicly');
  await go(page, '#/bab');
  await page.click('.path-link[href="#/bab/t4-1"]'); await settle(page);
  ok(await page.locator('.path-sub .path-node').count() === 3 && await page.locator('.path-sub .mastery-belum').count() === 3, 'Chapter path: 3 subtopics at Belum mula');
  ok(await page.locator('.path-sub .path-node.is-current .btn-primary').count() === 1, 'Chapter path: current subtopic carries the one primary action');
  await page.click('.path-node.is-current .btn-primary'); await settle(page);
  ok(page.url().endsWith('#/nota/t4-1/1.1'), 'Recommended step → note 1.1');
  ok(await count(page, 'note-open') === 1, 'Note visit recorded once');
  await reload(page);
  ok(await count(page, 'note-open') === 1, 'Reload within 30 min does not double-count the visit');
  // Step-by-step worked example.
  const ex = page.locator('[data-example]').first();
  const totalSteps = await ex.locator('.wsteps > li').count();
  await ex.locator('[data-stepmode]').click();
  ok(await ex.locator('.wsteps > li:visible').count() === 1 && await ex.locator('.example-tail').isHidden(), 'Step mode: one step at a time, answer hidden until the end');
  for (let i = 1; i < totalSteps; i++) await ex.locator('[data-stepnext]').click();
  ok(await ex.locator('.wsteps > li:visible').count() === totalSteps && await ex.locator('.example-tail').isVisible(), 'Step mode: last step reveals the check and the answer');
  await page.click('[data-act="done"]');
  ok(await page.locator('#note-done.is-done').count() === 1 && await count(page, 'note-done') === 1, '"Saya faham nota ini" records note completion');
  await reload(page);
  ok(await page.locator('#note-done.is-done').count() === 1, 'Note completion persists after reload');
  await go(page, '#/bab/t4-1');
  ok(await page.locator('.path-sub .mastery-belum').count() === 3, 'Finishing a note does not change mastery (D13)');
  await go(page, '#/nota/t4-1/1.1');
  await page.click('a:has-text("Mula latihan")'); await settle(page);
  ok(page.url().endsWith('#/latihan/t4-1/1.1'), 'Note → exercise');
}

async function exercise(page) {
  console.log('Exercise (two attempts, resume, completion)');
  const K = 't4-1/1.1';
  let cur = await current(page, K);
  ok(cur.total === 5, 'Set of 5 drawn from the subtopic pool');
  ok(await page.locator('[data-act="submit"]').isDisabled(), 'Unanswered: submit disabled');
  if (cur.type === 'mcq') { await page.click(`[data-opt="${cur.wrongIdx}"]`); ok(await page.locator('[data-act="submit"]').isEnabled(), 'Selected: submit enabled'); }
  await answer(page, cur, false);
  ok(await page.locator('.feedback.is-retry').count() === 1, 'First mistake: retry feedback');
  ok(await page.locator('.correct-line').count() === 0 && await page.locator('details.explain').count() === 0, 'First mistake: no answer and no solution shown');
  ok((await page.locator('[data-act="submit"]').innerText()).includes('cubaan kedua'), 'Second-attempt button shown');
  ok((await record(page)).active[K].cur.try === 2, 'Try 2 saved in the record');
  await reload(page);
  ok(await page.locator('#ex-resume').isVisible() && await page.locator('text=Cubaan 2 daripada 2').count() === 1, 'Reload: set resumes on the same question, still on try 2');
  cur = await current(page, K);
  if (cur.type === 'mcq') { const alt = await page.evaluate(() => [...document.querySelectorAll('[data-opt]:not([disabled])')].map((b) => Number(b.dataset.opt))); cur.wrongIdx = alt.find((x) => x !== cur.right); }
  await answer(page, cur, false);
  ok(await page.locator('.feedback.is-wrong .correct-line').count() === 1 && await page.locator('details.explain[open]').count() === 1, 'Second mistake: answer and full solution revealed');
  await page.click('[data-act="next"]');
  let triedInvalid = false;
  for (let i = 1; i < 5; i++) {
    cur = await current(page, K);
    const inv = !triedInvalid && cur.type !== 'mcq'; if (inv) triedInvalid = true;
    await answer(page, cur, true, inv);
    ok(await page.locator('.feedback.is-right').count() === 1 && (await page.locator('.ex-count').innerText()).includes(`Soalan ${cur.pos + 1} `), `Q${i + 1}: correct on first try, feedback stays on the same question`);
    await page.click('[data-act="next"]');
  }
  ok(await page.locator('.done').count() === 1 && (await page.locator('.score-ring b').innerText()) === '4/5', 'Completion summary: 4/5');
  ok(await page.locator('.done .mastery').count() === 1, 'Mastery level and its evidence shown after the set');
  const rec = await record(page);
  ok(!rec.active[K] && rec.events.filter((e) => e.t === 'set-done').length === 1 && rec.events.filter((e) => e.t === 'attempt').length === 6, 'set-done recorded, active set cleared, 6 attempt events');
  await page.click('[data-act="again"]');
  const again = await current(page, K);
  ok(again.setId !== cur.setId, '"Latihan lagi" starts a new set');
  await answer(page, again, true); // leave the new set unfinished: 1 of 5 answered
}

async function hints(page) {
  console.log('Progressive hints');
  // A question with ≥4 solution steps, put on screen as a one-question set.
  const target = await page.evaluate(async (storeKey) => {
    const { loadChapter, questionPool } = await import('/denai/hub/js/data.js');
    for (const id of ['t4-1', 't4-2', 't4-3', 't4-4', 't4-5', 't4-6', 't4-7', 't4-8', 't4-9', 't4-10']) {
      const ch = await loadChapter(id);
      for (const sub of ch.subtopics) {
        const q = questionPool(ch, sub.id).find((x) => (x.solution || []).length >= 4 && x.type !== 'mcq');
        if (q) {
          const rec = JSON.parse(localStorage.getItem(storeKey) || '{"v":1,"events":[],"active":{}}');
          rec.active[`${id}/${sub.id}`] = { id: 'shint1', qids: [q.id], i: 0, results: [], cur: { try: 1, wrong: [], text: '' }, startedAt: new Date().toISOString() };
          localStorage.setItem(storeKey, JSON.stringify(rec));
          return { ch: id, sub: sub.id, steps: q.solution, answer: String(q.answer) };
        }
      }
    }
    return null;
  }, KEY);
  if (!target) { ok(false, 'A question with ≥4 solution steps exists'); return; }
  await go(page, `#/latihan/${target.ch}/${target.sub}`);
  ok(await page.locator('[data-act="hint"]').count() === 0, 'No hint before the first attempt');
  await page.fill('#ans', '987654'); await page.click('[data-act="submit"]');
  let n = 0;
  while (await page.locator('[data-act="hint"]').count()) { await page.click('[data-act="hint"]'); n++; if (n > 10) break; }
  ok(n === target.steps.length - 2, `Hints stop at ${n} of ${target.steps.length} steps (never the last two)`);
  ok(await page.locator('.hint-box li').count() === target.steps.length - 2 && await page.locator('.correct-line').count() === 0, 'Hints show solution steps only, never the answer');
  ok(await count(page, 'hint') === n, `${n} hint events recorded`);
  await page.fill('#ans', target.answer); await page.click('[data-act="submit"]');
  ok((await page.locator('.feedback-title').innerText()).includes('dengan petunjuk'), 'Answer after hints is labelled "dengan petunjuk" (not first-try evidence)');
  await page.click('[data-act="next"]');
  ok((await page.locator('.review-list').innerText()).includes('dengan petunjuk'), 'Set summary marks the hinted question');
}

async function dashboard(page, mobile) {
  console.log('Real data on Utama, Belajar and Kemajuan (after reload)');
  await go(page, '#/hub'); await reload(page);
  ok((await h1(page)).includes('Selamat kembali'), 'Utama: returning view from the real record');
  ok(await page.locator('#view .btn-primary').count() === 1 && (await page.locator('#continue').innerText()).includes('Sambung belajar'), 'Utama: one primary action, "Sambung belajar"');
  ok((await page.locator('.next-title').innerText()).includes('Sambung latihan'), 'Utama: the unfinished set is the next step');
  ok(await page.locator('#view .activity, #view .stat, #view .card-link').count() === 0, 'Utama: no activity feed, statistics or shortcut cards');
  await page.click('#continue'); await settle(page);
  ok(page.url().includes('#/latihan/t4-1/1.1') && (await page.locator('.ex-count').innerText()).includes('Soalan 2 '), '"Sambung belajar" resumes the set at question 2');
  await go(page, '#/bab/t4-1');
  ok(await page.locator('.path-sub .path-node').first().locator('.mastery:not(.mastery-belum)').count() === 1, 'Chapter path: 1.1 shows a real mastery level');
  await tab(page, mobile, 'kemajuan'); await settle(page);
  ok(await page.locator('.table tbody tr').count() >= 1, 'Kemajuan: finished sets listed');
  ok((await page.locator('.prog-summary').innerText()).includes('1 nota selesai'), 'Kemajuan: 1 note completed');
  ok(await page.locator('.activity li').count() >= 2, 'Kemajuan: recent activity (note + set)');
  ok(await page.locator('.review-rows li').count() >= 1, 'Kemajuan: revision list from real activity');
  ok(await page.locator('.prog-list').nth(1).locator('.prog-ch.is-soon').count() === 8, 'Kemajuan: every Tingkatan 5 chapter listed with its status');
  ok(await page.locator('text=/disimpan dalam pelayar ini/').count() >= 1, 'Kemajuan: says where progress is stored');
}

async function demo(page) {
  console.log('Demo mode isolation');
  const before = await record(page);
  await go(page, '?demo=1#/hub');
  ok(await page.locator('#modebar').isVisible() && (await page.locator('#modebar').innerText()).includes('bukan rekod pelajar sebenar'), 'Demo banner visible');
  ok((await h1(page)).includes('Selamat datang'), 'Demo persona Pelajar Baharu by default');
  await page.click('[data-persona="kembali"]'); await settle(page);
  ok((await h1(page)).includes('Selamat kembali') && (await page.locator('.next-up').innerText()).includes('Fungsi Kuadratik'), 'Demo persona Pelajar Kembali');
  await go(page, '#/nota/t4-2/2.2');
  ok(await page.locator('#modebar').isVisible(), 'Demo mode persists across pages in this tab');
  await page.click('[data-act="done"]');
  ok(JSON.stringify((await record(page)).events) === JSON.stringify(before.events), 'Demo actions never write the real record');
  await go(page, '?demo=0#/hub');
  ok(await page.locator('#modebar').isHidden() && (await page.locator('.next-up').innerText()).includes('Fungsi'), 'Leaving demo mode shows the real record again');
}

async function contrast(page) {
  console.log('Contrast (WCAG AA)');
  await go(page, '#/bab/t4-1');
  const ratios = await page.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const bg = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length === 3 || c[3] === 1) return c.slice(0, 3); } return [255, 255, 255]; };
    const cr = (el) => { const a = lum(rgb(getComputedStyle(el).color)), b = lum(bg(el)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
    const probe = (html) => { const d = document.createElement('div'); d.innerHTML = html; document.querySelector('.path-body').append(d); return d.firstElementChild; };
    return {
      'btn-ok': cr(probe('<button class="btn btn-ok">Semak</button>')),
      'btn-primary': cr(probe('<a class="btn btn-primary">Sambung belajar</a>')),
      crumbs: cr(document.querySelector('.crumbs li')),
      'tag-soon': cr(probe('<span class="tag tag-soon">Belum ditulis</span>')),
      'tag-review': cr(probe('<span class="tag tag-review">Sedang disemak</span>')),
      'tag-done': cr(probe('<span class="tag tag-done">Dikuasai</span>')),
      'tag-progress': cr(probe('<span class="tag tag-progress">Anda di sini</span>')),
      'path-kicker': cr(document.querySelector('.path-kicker')),
      'path-actions link': cr(document.querySelector('.path-actions a')),
      'mastery-belum': cr(probe('<span class="mastery mastery-belum">Belum mula</span>')),
      'mastery-mencuba': cr(probe('<span class="mastery mastery-mencuba">Mencuba</span>')),
      'mastery-faham': cr(probe('<span class="mastery mastery-faham">Faham</span>')),
      'mastery-mahir': cr(probe('<span class="mastery mastery-mahir">Mahir</span>')),
      'evidence-note': cr(probe('<span class="evidence-note">Bukti belum mencukupi</span>')),
    };
  });
  for (const [k, v] of Object.entries(ratios)) ok(v >= 4.5, `${k}: ${v.toFixed(2)}:1`);
}

async function allLinks(page) {
  console.log('Every internal link');
  const seen = new Set(), queue = ['#/'];
  while (queue.length) {
    const hash = queue.shift();
    if (seen.has(hash)) continue; seen.add(hash);
    await go(page, hash);
    const title = await page.title();
    if (/tidak dijumpai|Ralat/.test(title)) { ok(false, `${hash} → ${title}`); continue; }
    if (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth) > 0) ok(false, `${hash} overflows horizontally`);
    for (const l of await page.$$eval('a[href^="#/"]', (as) => as.map((a) => a.getAttribute('href')))) if (!seen.has(l) && !/\?b=(ulang|latihan|fahami)/.test(l)) queue.push(l);
  }
  ok(seen.size > 120, `${seen.size} hub routes visited, none broken, no horizontal overflow`);
}

async function storageKeys(page) {
  const keys = await page.evaluate(() => Object.keys(localStorage));
  const game = ['denai-save-v14', 'denai-profile-v1', 'denai-records-v14', 'denai-campaign-v1', 'denai-l3-campaign-v1'];
  ok(keys.every((k) => k.startsWith('denai-hub-')), `Only hub keys written: ${keys.join(', ')}`);
  ok(!keys.some((k) => game.includes(k)), 'No game save key created or changed');
}

// Every subtopic of every chapter visible in `mode` ('' public, '?semak=1' owner preview).
async function contentAudit(browser, mode) {
  console.log(`Content integration and answer checking (${mode ? 'owner preview: content still in review, if any' : 'published content'})`);
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await attach(ctx);
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${HUB}${mode}#/bab`); await settle(page);
  const subs = await page.evaluate(async () => {
    const { CHAPTERS, loadChapter, questionPool, writtenPool } = await import('/denai/hub/js/data.js');
    const { sectionsOf, itemsOf } = await import('/denai/hub/js/core/content.js');
    const out = [];
    for (const c of CHAPTERS.filter((x) => x.available)) {
      const ch = await loadChapter(c.id);
      for (const s of ch.subtopics) out.push({ ch: c.id, sub: s.id, preview: c.preview, examples: itemsOf(s, 'examples').length, formulas: itemsOf(s, 'formula').length, mistakes: itemsOf(s, 'mistakes').length, visuals: sectionsOf(s, 'visual').length, concepts: sectionsOf(s, 'concept').length, pool: questionPool(ch, s.id).length, written: writtenPool(ch, s.id).length });
    }
    return out;
  });
  const want = mode ? subs.filter((s) => s.preview) : subs;
  ok(mode ? want.length === 0 && subs.length === 59 : want.length === 59, mode ? `owner preview adds no hidden content (${want.length} review subtopics; ${subs.length} visible)` : `${want.length} subtopics published`);
  let notesOk = 0, exOk = 0, wOk = 0, wParts = 0, examples = 0, questions = 0;
  for (const s of want) {
    await page.goto(`${HUB}#/nota/${s.ch}/${s.sub}`); await settle(page);
    await page.evaluate(() => document.querySelectorAll('#view details').forEach((d) => { d.open = true; }));
    await page.waitForTimeout(60);
    const got = await page.evaluate(() => ({ examples: document.querySelectorAll('[data-example]').length, formulas: document.querySelectorAll('#ulang .formula').length, mistakes: document.querySelectorAll('#ulang .mistake').length, visuals: document.querySelectorAll('[data-visual]').length, concepts: document.querySelectorAll('.concept-block').length, flag: !!document.querySelector('.preview-flag') }));
    const good = got.examples === s.examples && got.formulas === s.formulas && got.mistakes === s.mistakes && got.visuals === s.visuals && got.concepts === s.concepts && got.flag === !!s.preview;
    if (good) notesOk++; else ok(false, `Note ${s.ch} ${s.sub}: page ${JSON.stringify(got)} vs content ${JSON.stringify(s)}`);
    examples += got.examples;
    if (s.pool) {
      await page.goto(`${HUB}#/latihan/${s.ch}/${s.sub}`); await settle(page);
      const cur = await current(page, `${s.ch}/${s.sub}`);
      await answer(page, cur, true);
      if (await page.locator('.feedback.is-right').count() === 1) exOk++; else ok(false, `Exercise ${s.ch} ${s.sub}: answer key not accepted`);
      questions += s.pool;
    }
    if (s.written) {
      await page.goto(`${HUB}#/latihan/${s.ch}/${s.sub}?jenis=bertulis`); await settle(page);
      const res = await page.evaluate(async ([ch, sub]) => {
        const { loadChapter, writtenPool } = await import('/denai/hub/js/data.js');
        const wq = writtenPool(await loadChapter(ch), sub);
        let parts = 0, right = 0, self = 0;
        for (const [qi, q] of wq.entries()) {
          const card = document.querySelector(`.wq[data-q="${qi}"]`);
          const ps = q.type === 'structured' ? q.parts : [q];
          for (const [k, p] of ps.entries()) {
            const el = card.querySelector(`.wpart[data-part="${k}"]`);
            if (el.hasAttribute('data-self')) { el.querySelector('[data-reveal]').click(); if (el.querySelector('.feedback.is-self li')) self++; continue; }
            parts++;
            el.querySelector('input').value = String(p.answer);
            el.querySelector('[data-check]').click();
            if (el.querySelector('.feedback.is-right')) right++;
          }
        }
        return { n: wq.length, parts, right, self, cards: document.querySelectorAll('.wq').length };
      }, [s.ch, s.sub]);
      wParts += res.parts;
      if (res.cards === res.n && res.right === res.parts) wOk++; else ok(false, `Written ${s.ch} ${s.sub}: ${JSON.stringify(res)}`);
    }
  }
  ok(notesOk === want.length, `Notes: all explanation sections, ${examples} worked examples, formulas, mistakes and visuals on ${notesOk}/${want.length} subtopic pages`);
  ok(exOk === want.filter((s) => s.pool).length, `Exercises: answer key accepted on ${exOk} subtopics (pools totalling ${questions} questions)`);
  ok(wOk === want.filter((s) => s.written).length, `Written questions: ${wParts} auto-checked parts accepted on ${wOk} subtopics; reasoning solutions reveal`);
  ok(errors.length === 0, `No console errors${errors.length ? `: ${errors.slice(0, 3).join(' | ')}` : ''}`);
  await ctx.close();
}

async function eraseKeepsGame(browser) {
  console.log('Erase my progress (game saves untouched)');
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await attach(ctx);
  const page = await ctx.newPage();
  await go(page, '#/nota/t4-1/1.1');
  await page.click('[data-act="done"]');
  await page.evaluate(() => localStorage.setItem('denai-save-v14', '{"sentinel":true}'));
  await go(page, '#/kemajuan');
  await page.click('[data-act="reset"]');
  ok(await page.locator('[role="alertdialog"]').isVisible(), 'Erase asks for confirmation');
  await page.click('[data-act="confirm"]'); await settle(page);
  ok(await page.evaluate((k) => localStorage.getItem(k), KEY) === null && await page.locator('text=/telah dipadam/').count() === 1, 'Hub record erased and confirmed');
  ok(await page.evaluate(() => localStorage.getItem('denai-save-v14')) === '{"sentinel":true}', 'Game save left untouched');
  await ctx.close();
}

async function gameTab(page, mobile) {
  console.log('Game tab');
  await tab(page, mobile, 'main'); await settle(page);
  ok(await page.locator('#play').getAttribute('href') === '/app/addmath/denai/main', 'Game tab: Play opens the existing game route');
  ok(await page.locator('.world').count() === 4 && await page.locator('.world.is-playable').count() === 1, 'Game tab: 4 worlds, only Dunia 1 playable');
  ok(await page.locator('.world.is-playable .level').count() === 3 && await page.locator('.world:not(.is-playable) .tag').count() === 3, 'Game tab: 3 missions; unavailable worlds clearly labelled');
  ok((await page.locator('.game-sep').innerText()).includes('bukan bukti penguasaan'), 'Game tab: game records kept apart from mastery');
}

async function realGame(browser) {
  console.log('Existing game still launches');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await attach(ctx);
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto(`${ORIGIN}/app/addmath/denai/main`);
  ok(res.ok(), 'Game route responds');
  await page.waitForSelector('#game canvas', { timeout: 15000 }).catch(() => {});
  ok(await page.locator('#game canvas').count() === 1, 'Phaser canvas created');
  ok(await page.evaluate(() => window.Phaser?.VERSION) === '3.90.0', 'Phaser 3.90.0 loaded');
  await page.waitForTimeout(1500);
  ok(errors.length === 0, `No page errors in the game${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch();
  const runs = [
    ['Desktop 1280', { viewport: { width: 1280, height: 900 } }, false, 'full'],
    ['Tablet 820', { viewport: { width: 820, height: 1180 }, hasTouch: true }, true, 'nav'],
    ['Phone 390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, true, 'full'],
  ];
  for (const [label, opts, mobile, scope] of runs) {
    console.log(`\n=== ${label} ===`);
    const ctx = await browser.newContext(opts);
    await attach(ctx);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await shell(page, mobile);
    await journey(page, mobile);
    if (scope === 'full') {
      await exercise(page);
      await dashboard(page, mobile);
      await hints(page);
      await demo(page);
      await gameTab(page, mobile);
      if (!mobile) { await contrast(page); await allLinks(page); }
    }
    await storageKeys(page);
    ok(errors.length === 0, `No console errors${errors.length ? `: ${errors.slice(0, 5).join(' | ')}` : ''}`);
    await ctx.close();
  }
  await contentAudit(browser, '');
  await contentAudit(browser, '?semak=1');
  await eraseKeepsGame(browser);
  await realGame(browser);
  await browser.close();
  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
