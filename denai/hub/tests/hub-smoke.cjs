// DENAI Learning Hub smoke test (desktop + phone).
// 1) Walks the learning journey: Home → Hub → Bab → Overview → Nota → Latihan → Game → Hub → Kemajuan.
// 2) Exercises every question state (unanswered, selected, submitted, correct,
//    incorrect, explanation, next, completion) for MCQ and typed answers.
// 3) Follows every internal link on every page and fails on "not found" / errors.
// 4) Opens the real game route and checks Phaser starts with no page errors.
// Usage: node denai/hub/tests/hub-smoke.cjs
const { chromium } = require('playwright');
const { ORIGIN, attach } = require('./serve.cjs');

const HUB = `${ORIGIN}/denai/hub/`;
let failures = 0;
const ok = (cond, msg) => { if (cond) console.log(`  ✓ ${msg}`); else { failures++; console.log(`  ✗ ${msg}`); } };

async function settle(page) { await page.waitForFunction(() => !document.querySelector('#view .loading')); await page.waitForTimeout(150); }
async function go(page, hash) { await page.goto(HUB + hash); await settle(page); }
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
const h1 = (page) => page.locator('#view h1').first().innerText();

async function journey(page, mobile) {
  console.log('Journey');
  await go(page, '#/');
  ok((await h1(page)).includes('Fahami Add Math'), 'Home renders');
  await page.click('a:has-text("Mula Belajar")'); await settle(page);
  ok(page.url().endsWith('#/hub'), 'Start Learning → Hub');
  ok(await page.locator('[data-nav="hub"][aria-current="page"]').count() >= 1, 'Hub nav item active');
  ok((await h1(page)).includes('Selamat datang'), 'Pelajar Baharu state by default');
  await page.click('[data-demo="kembali"]'); await settle(page);
  ok((await h1(page)).includes('Selamat kembali'), 'Switch to Pelajar Kembali');
  ok(await page.locator('text=Sambung belajar').count() === 1 && await page.locator('.activity li').count() > 0, 'Continue card + recent activity shown');
  ok(await page.locator('.demo-note').count() > 0, 'Demo data is labelled');
  await page.click('[data-demo="baharu"]'); await settle(page);
  ok((await h1(page)).includes('Selamat datang'), 'Switch back to Pelajar Baharu');

  const navBab = mobile ? '#tabbar [data-nav="bab"]' : '.navlinks [data-nav="bab"]';
  await page.click(navBab); await settle(page);
  ok(page.url().endsWith('#/bab'), `${mobile ? 'Tab bar' : 'Top nav'} → Bab`);
  ok(await page.locator('.ch-card').count() === 10, 'Tingkatan 4 lists 10 chapters');
  await page.click('.seg a:has-text("Tingkatan 5")'); await settle(page);
  ok(await page.locator('.ch-card').count() === 8, 'Tingkatan 5 lists 8 chapters');
  ok(await page.locator('.ch-card.is-soon').count() === 8, 'Tingkatan 5 chapters marked Dalam penyediaan (not published)');
  await page.click('.seg a:has-text("Tingkatan 4")'); await settle(page);
  await page.click('.ch-card[href="#/bab/t4-1"]'); await settle(page);
  ok((await h1(page)) === 'Fungsi', 'Chapter card → overview');
  ok(await page.locator('.concept').count() === 3, 'Overview lists 3 concepts');
  await page.click('.next-card a.btn'); await settle(page);
  ok(page.url().endsWith('#/nota/t4-1/1.1'), 'Next action → first note');
  for (const k of ['fahami', 'contoh', 'ulang', 'latihan']) ok(await page.locator(`section#${k}`).count() === 1, `Note has ${k.toUpperCase()} section`);
  ok(await page.locator('.katex').count() > 3, 'Maths rendered by KaTeX');
  ok(await page.locator('.visual-host svg').count() >= 1, 'Concept visual mounted');
  await page.click('[data-jump="ulang"]'); await page.waitForTimeout(600);
  ok(page.url().endsWith('#/nota/t4-1/1.1'), 'Section jump keeps the route');
  await page.click('a:has-text("Mula latihan")'); await settle(page);
  ok(page.url().endsWith('#/latihan/t4-1/1.1'), 'Note → exercise');
}

async function exercise(page) {
  console.log('Exercise states');
  const submit = page.locator('[data-act="submit"]');
  // Q1 (MCQ): unanswered → selected → wrong answer
  ok(await submit.isDisabled(), 'Unanswered: submit disabled');
  await page.click('[data-opt="0"]');
  ok(await page.locator('[data-opt="0"][aria-checked="true"]').count() === 1 && await submit.isEnabled(), 'Selected: option checked, submit enabled');
  await submit.click();
  ok(await page.locator('.feedback.is-wrong').count() === 1, 'Incorrect feedback');
  ok(await page.locator('.option.is-right').count() === 1 && await page.locator('.option.is-wrong').count() === 1, 'Correct and chosen options marked');
  ok(await page.locator('details.explain[open]').count() === 1, 'Explanation open after a wrong answer');
  ok(await page.locator('.option[disabled]').count() === 4, 'Options locked after submit');
  await page.click('[data-act="next"]');
  ok((await page.locator('.ex-count').innerText()).includes('Soalan 2'), 'Next question');

  // Remaining questions: answer correctly using the page's own correct option / typed answer.
  const answers = await page.evaluate(async () => {
    const { loadChapter, exerciseSet } = await import('/denai/hub/js/data.js');
    const ch = await loadChapter('t4-1');
    return exerciseSet(ch, '1.1').map((q) => (q.type === 'mcq' ? { mcq: q.options.findIndex((o) => o.correct) } : { text: String(q.answer) }));
  });
  for (let i = 1; i < answers.length; i++) {
    const a = answers[i];
    if ('mcq' in a) await page.click(`[data-opt="${a.mcq}"]`);
    else {
      await page.fill('#ans', 'abc'); await submit.click();
      if (i === 1) ok((await page.locator('#ans-msg').innerText()).length > 0 && await page.locator('.feedback').count() === 0, 'Invalid typed answer: inline message, not submitted');
      await page.fill('#ans', a.text);
    }
    await submit.click();
    ok(await page.locator('.feedback.is-right').count() === 1, `Q${i + 1}: correct feedback`);
    await page.click('[data-act="next"]');
  }
  ok(await page.locator('.done').count() === 1, 'Completion summary shown');
  ok((await page.locator('.score-ring b').innerText()) === `${answers.length - 1}/${answers.length}`, 'Score counts right answers');
  await page.click('[data-act="retry"]');
  ok((await page.locator('.ex-count').innerText()).includes('Soalan 1'), 'Retry restarts the set');
}

async function gameLink(page, mobile) {
  console.log('Game launch');
  await go(page, '#/main');
  const href = await page.locator('#play').getAttribute('href');
  ok(href === '/app/addmath/denai/main', 'Play DENAI uses the real game route');
  await page.click('a:has-text("Kembali ke Hub")'); await settle(page);
  ok(page.url().endsWith('#/hub'), 'Game page → back to Hub');
  await page.click(mobile ? '#tabbar [data-nav="kemajuan"]' : '.navlinks [data-nav="kemajuan"]'); await settle(page);
  ok((await h1(page)).length > 0 && page.url().endsWith('#/kemajuan'), 'Hub → My Progress');
  ok(await page.locator('.empty').count() >= 1, 'Progress: empty states for Pelajar Baharu');
  await page.click('[data-demo="kembali"]'); await settle(page);
  ok(await page.locator('.table tbody tr').count() === 4, 'Progress: exercise activity for Pelajar Kembali');
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
    if (await overflow(page) > 0) ok(false, `${hash} overflows horizontally`);
    const links = await page.$$eval('a[href^="#/"]', (as) => as.map((a) => a.getAttribute('href')));
    for (const l of links) if (!seen.has(l)) queue.push(l);
  }
  ok(seen.size > 40, `${seen.size} hub routes visited, none broken, no horizontal overflow`);
  const ext = await page.evaluate(() => [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))]);
  ok(ext.length > 0, `External same-site links present: ${ext.join(', ')}`);
}

async function realGame(browser) {
  console.log('Existing game still launches');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await attach(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const res = await page.goto(`${ORIGIN}/app/addmath/denai/main`);
  ok(res.ok(), 'Game route responds');
  await page.waitForSelector('#game canvas', { timeout: 15000 }).catch(() => {});
  ok(await page.locator('#game canvas').count() === 1, 'Phaser canvas created');
  ok(await page.evaluate(() => typeof window.Phaser === 'object' && window.Phaser.VERSION) === '3.90.0', 'Phaser 3.90.0 loaded');
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
    await gameLink(page, mobile);
    if (!mobile) await allLinks(page);
    ok(errors.length === 0, `No console errors${errors.length ? `: ${errors.slice(0, 5).join(' | ')}` : ''}`);
    await ctx.close();
  }
  await realGame(browser);
  await browser.close();
  console.log(failures ? `\n${failures} check(s) FAILED` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
})();
