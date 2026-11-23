// DENAI Learning Hub smoke test — Phase 1 (real learning progress), desktop + phone.
//  1. Journey on a fresh browser: Home → Hub (new learner, no demo controls) → Bab → overview → note.
//  2. Note completion is recorded and survives a reload.
//  3. Exercise: unanswered/selected states, first mistake = retry feedback only (no answer,
//     no solution), resume after reload on try 2, second mistake reveals answer + solution,
//     correct answers, invalid input, completion, "Latihan lagi" gives a new set.
//  4. Dashboard, chapter and progress pages show the real record after reloads.
//  5. Demo mode only with ?demo=1, clearly bannered, never touches the real record.
//  6. Contrast of the four previously failing token pairs ≥ 4.5:1.
//  7. Only hub storage keys are written; game keys untouched. Link crawl, console errors,
//     and the real game still boots Phaser 3.90.0.
// Usage: node denai/hub/tests/hub-smoke.cjs
const { chromium } = require('playwright');
const { ORIGIN, attach } = require('./serve.cjs');

const HUB = `${ORIGIN}/denai/hub/`;
const KEY = 'denai-hub-progress-v1';
let failures = 0;
const ok = (cond, msg) => { if (cond) console.log(`  ✓ ${msg}`); else { failures++; console.log(`  ✗ ${msg}`); } };

async function settle(page) { await page.waitForFunction(() => !document.querySelector('#view .loading')); await page.waitForTimeout(200); }
async function go(page, path) { await page.goto(HUB + path); await settle(page); }
async function reload(page) { await page.reload(); await settle(page); }
const h1 = (page) => page.locator('#view h1').first().innerText();
const record = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || '{"events":[],"active":{}}'), KEY);
const count = async (page, t) => (await record(page)).events.filter((e) => !t || e.t === t).length;

// The question currently on screen, with what is needed to answer it right or wrong.
const current = (page, key) => page.evaluate(async ([k, storeKey]) => {
  const a = JSON.parse(localStorage.getItem(storeKey)).active[k];
  const [ch, sub] = k.split('/');
  const { loadChapter, questionPool } = await import('/denai/hub/js/data.js');
  const q = questionPool(await loadChapter(ch), sub).find((x) => x.id === a.qids[a.results.length]);
  return { type: q.type, right: q.type === 'mcq' ? q.options.findIndex((o) => o.correct) : String(q.answer), wrongIdx: q.type === 'mcq' ? q.options.findIndex((o) => !o.correct) : null, pos: a.results.length, total: a.qids.length, setId: a.id, qids: a.qids };
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

async function journey(page, mobile) {
  console.log('Fresh learner journey');
  await go(page, '#/');
  ok((await h1(page)).includes('Fahami Add Math'), 'Home renders');
  await page.click('a:has-text("Mula Belajar")'); await settle(page);
  ok((await h1(page)).includes('Selamat datang'), 'Hub: new learner view from an empty record');
  ok(await page.locator('#modebar').isHidden() && await page.locator('[data-persona], [data-demo]').count() === 0, 'No demo banner or demo switch in real mode');
  ok(await page.locator('text=/Data contoh/i').count() === 0, 'No "Data contoh" text in real mode');
  await page.click(mobile ? '#tabbar [data-nav="bab"]' : '.navlinks [data-nav="bab"]'); await settle(page);
  ok(await page.locator('.ch-card').count() === 10, 'Bab: Tingkatan 4 lists 10 chapters');
  await page.click('.seg a:has-text("Tingkatan 5")'); await settle(page);
  ok(await page.locator('.ch-card.is-soon').count() === 8, 'Tingkatan 5: 8 chapters still Dalam penyediaan (review content hidden)');
  await page.click('.seg a:has-text("Tingkatan 4")'); await settle(page);
  await page.click('.ch-card[href="#/bab/t4-1"]'); await settle(page);
  ok(await page.locator('.concept .mastery-belum').count() === 3, 'Overview: 3 subtopics at Belum mula');
  await page.click('.next-card a.btn'); await settle(page);
  ok(page.url().endsWith('#/nota/t4-1/1.1'), 'Next step → note 1.1');
  ok(await count(page, 'note-open') === 1, 'Note visit recorded once');
  await reload(page);
  ok(await count(page, 'note-open') === 1, 'Reload within 30 min does not double-count the visit');
  await page.click('[data-act="done"]');
  ok(await page.locator('#note-done.is-done').count() === 1 && await count(page, 'note-done') === 1, '"Saya faham nota ini" records note completion');
  await reload(page);
  ok(await page.locator('#note-done.is-done').count() === 1, 'Note completion persists after reload');
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
  if (cur.type === 'mcq') ok(await page.locator(`[data-opt="${cur.wrongIdx}"][disabled]`).count() === 1, 'Reload: first wrong option stays disabled');
  cur = await current(page, K);
  if (cur.type === 'mcq') { const alt = await page.evaluate(() => [...document.querySelectorAll('[data-opt]:not([disabled])')].map((b) => Number(b.dataset.opt))); cur.wrongIdx = alt.find((x) => x !== cur.right); }
  await answer(page, cur, false);
  ok(await page.locator('.feedback.is-wrong .correct-line').count() === 1 && await page.locator('details.explain[open]').count() === 1, 'Second mistake: answer and full solution revealed');
  ok((await page.locator('.ex-count').innerText()).includes('Soalan 1 '), 'Resolved feedback stays on question 1');
  await page.click('[data-act="next"]');
  let triedInvalid = false;
  for (let i = 1; i < 5; i++) {
    cur = await current(page, K);
    const inv = !triedInvalid && cur.type !== 'mcq'; if (inv) triedInvalid = true;
    await answer(page, cur, true, inv);
    const good = await page.locator('.feedback.is-right').count() === 1 && (await page.locator('.ex-count').innerText()).includes(`Soalan ${cur.pos + 1} `);
    ok(good, `Q${i + 1}: correct on first try, feedback stays on the same question`);
    await page.click('[data-act="next"]');
  }
  ok(await page.locator('.done').count() === 1, 'Completion summary');
  ok((await page.locator('.score-ring b').innerText()) === '4/5', 'Score 4/5 (one question missed twice)');
  ok(await page.locator('.done .mastery').count() === 1, 'Mastery level shown after the set');
  const rec = await record(page);
  ok(!rec.active[K] && rec.events.filter((e) => e.t === 'set-done').length === 1, 'set-done recorded; active set cleared');
  ok(rec.events.filter((e) => e.t === 'attempt').length === 6, '6 attempt events (1 question × 2 tries + 4 × 1)');
  const prevSet = cur.setId;
  await page.click('[data-act="again"]');
  const again = await current(page, K);
  ok(again.setId !== prevSet && (await page.locator('.ex-count').innerText()).includes('Soalan 1'), '"Latihan lagi" starts a new set');
}

async function dashboard(page, mobile) {
  console.log('Real data on Hub, Bab and Kemajuan (after reload)');
  await go(page, '#/hub'); await reload(page);
  ok((await h1(page)).includes('Selamat kembali'), 'Hub: returning view from the real record');
  ok(await page.locator('.activity li').count() >= 2, 'Hub: recent activity (note + set)');
  ok((await page.locator('#h-next').innerText()).length > 0, 'Hub: next step from real data');
  ok(await page.locator('.next-card a:has-text("Sambung latihan")').count() === 1, 'Hub: unfinished set offered as "Sambung latihan"');
  await go(page, '#/bab/t4-1');
  ok(await page.locator('.concept').first().locator('.mastery:not(.mastery-belum)').count() === 1, 'Overview: 1.1 shows a real mastery level');
  await page.click(mobile ? '#tabbar [data-nav="kemajuan"]' : '.navlinks [data-nav="kemajuan"]'); await settle(page);
  ok(await page.locator('.table tbody tr').count() === 1, 'Kemajuan: one finished set listed');
  ok((await page.locator('.stat').nth(2).innerText()).includes('1'), 'Kemajuan: 1 note completed');
  ok(await page.locator('text=/disimpan dalam pelayar ini/').count() >= 1, 'Kemajuan: says where progress is stored');
}

async function demo(page) {
  console.log('Demo mode isolation');
  const before = await record(page);
  await go(page, '?demo=1#/hub');
  ok(await page.locator('#modebar').isVisible() && (await page.locator('#modebar').innerText()).includes('bukan rekod pelajar sebenar'), 'Demo banner visible');
  ok((await h1(page)).includes('Selamat datang'), 'Demo persona Pelajar Baharu by default');
  await page.click('[data-persona="kembali"]'); await settle(page);
  ok((await h1(page)).includes('Selamat kembali') && (await page.locator('.continue').innerText()).includes('Fungsi Kuadratik'), 'Demo persona Pelajar Kembali');
  await go(page, '#/nota/t4-2/2.2'); // still demo (sessionStorage)
  ok(await page.locator('#modebar').isVisible(), 'Demo mode persists across pages in this tab');
  await page.click('[data-act="done"]');
  const after = await record(page);
  ok(JSON.stringify(after.events) === JSON.stringify(before.events), 'Demo actions never write the real record');
  await go(page, '?demo=0#/hub');
  ok(await page.locator('#modebar').isHidden() && (await page.locator('.continue').innerText()).includes('Fungsi'), 'Leaving demo mode shows the real record again');
}

async function contrast(page) {
  console.log('Contrast (WCAG AA)');
  await go(page, '#/bab?t=5');
  const ratios = await page.evaluate(() => {
    const rgb = (s) => (s.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const bg = (el) => { for (let e = el; e; e = e.parentElement) { const c = rgb(getComputedStyle(e).backgroundColor); if (c.length === 3 || c[3] === 1) return c.slice(0, 3); } return [255, 255, 255]; };
    const cr = (el) => { const a = lum(rgb(getComputedStyle(el).color)), b = lum(bg(el)); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
    const probe = (html) => { const d = document.createElement('div'); d.innerHTML = html; document.querySelector('#view').append(d); return d.firstElementChild; };
    return {
      'btn-ok': cr(probe('<button class="btn btn-ok">Semak</button>')),
      'ink-faint (crumbs)': cr(document.querySelector('.crumbs li')),
      'tag-soon': cr(document.querySelector('.tag-soon')),
      'tag-done / --ok': cr(probe('<span class="tag tag-done">Dikuasai</span>')),
      'mastery-faham': cr(probe('<span class="mastery mastery-faham">Faham</span>')),
      'mastery-belum': cr(probe('<span class="mastery mastery-belum">Belum mula</span>')),
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
    for (const l of await page.$$eval('a[href^="#/"]', (as) => as.map((a) => a.getAttribute('href')))) if (!seen.has(l)) queue.push(l);
  }
  ok(seen.size > 40, `${seen.size} hub routes visited, none broken, no horizontal overflow`);
}

async function storageKeys(page) {
  const keys = await page.evaluate(() => Object.keys(localStorage));
  const game = ['denai-save-v14', 'denai-profile-v1', 'denai-records-v14', 'denai-campaign-v1', 'denai-l3-campaign-v1'];
  ok(keys.every((k) => k.startsWith('denai-hub-')), `Only hub keys written: ${keys.join(', ')}`);
  ok(!keys.some((k) => game.includes(k)), 'No game save key created or changed');
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
  for (const [label, opts, mobile] of [['Desktop 1280', { viewport: { width: 1280, height: 900 } }, false], ['Phone 390', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }, true]]) {
    console.log(`\n=== ${label} ===`);
    const ctx = await browser.newContext(opts);
    await attach(ctx);
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    await journey(page, mobile);
    await exercise(page);
    await dashboard(page, mobile);
    await demo(page);
    if (!mobile) { await contrast(page); await allLinks(page); }
    await storageKeys(page);
    ok(errors.length === 0, `No console errors${errors.length ? `: ${errors.slice(0, 5).join(' | ')}` : ''}`);
    await ctx.close();
  }
  await realGame(browser);
  await browser.close();
  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
