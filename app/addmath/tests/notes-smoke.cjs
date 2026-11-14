// Browser smoke test (V3) for every registered notes chapter, desktop + phone.
// Needs: python3 -m http.server 8790 at the repo root; Playwright.
//   node app/addmath/tests/notes-smoke.cjs [chapterId…]
// Checks: review content hidden publicly; overview lists subtopics; each Fahami
// page renders (KaTeX, idea, example, visuals incl. optional ones, sliders,
// no horizontal overflow); Ulang Kaji renders and search filters; Latihan shows
// one question, the picker covers the chapter, and checking reveals the answer.
const { chromium, devices } = require('playwright'); const fs = require('fs'); const path = require('path');
const B = 'http://127.0.0.1:8790/app/addmath/';
const idx = fs.readFileSync(path.join(__dirname, '../src/content/notes/index.js'), 'utf8');
const chapters = process.argv.slice(2).length ? process.argv.slice(2) : [...idx.matchAll(/'(t[45]-\d+)': \(\) => import\('\.\/t/g)].map((m) => m[1]);
(async () => {
  const b = await chromium.launch(); let pass = 0, total = 0;
  const ok = (n, c, d) => { total++; if (c) pass++; else console.log('FAIL', n, JSON.stringify(d)); };
  for (const [name, opt] of [['desktop', { viewport: { width: 1280, height: 900 } }], ['phone', { ...devices['iPhone 13'] }]]) {
    const c = await b.newContext(opt); const p = await c.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/frame-ancestors/.test(m.text())) errs.push(m.text()); });
    for (const ch of chapters) {
      await p.goto(B + '?semak=0#/bab/' + ch); await p.waitForTimeout(400);
      const published = new RegExp(`'${ch}': 'published'`).test(idx);
      const publicRows = await p.evaluate(() => document.querySelectorAll('.v3-subrow').length);
      ok(`${name} ${ch}: ${published ? 'visible' : 'hidden'} publicly`, published ? publicRows > 0 : publicRows === 0, { published, publicRows });
      await p.goto(B + '?semak=1#/bab/' + ch); await p.waitForTimeout(500);
      const subs = await p.evaluate(() => [...document.querySelectorAll('.v3-subrow-main')].map((a) => a.getAttribute('href').split('/').pop()));
      ok(`${name} ${ch}: overview lists subtopics`, subs.length > 0, subs);
      for (const s of subs) {
        await p.goto(B + `#/nota/${ch}/${s}`); await p.waitForSelector('.v3-idea', { timeout: 8000 }); await p.waitForTimeout(250);
        await p.evaluate(() => document.querySelectorAll('.v3-more').forEach((d) => { d.open = true; d.dispatchEvent(new Event('toggle')); })); await p.waitForTimeout(250);
        const st = await p.evaluate(() => ({ katex: document.querySelectorAll('.katex').length, err: document.querySelectorAll('.katex-error').length, idea: (document.querySelector('.v3-idea')?.innerText || '').length, ex: document.querySelectorAll('#contoh .v3-example').length, figs: document.querySelectorAll('.visual-fig').length, drawn: document.querySelectorAll('.visual-fig svg,.visual-fig .value-table').length, overflow: document.documentElement.scrollWidth > innerWidth + 1, q: document.querySelectorAll('.q-card').length }));
        ok(`${name} ${ch} ${s}: Fahami renders`, st.katex > 5 && !st.err && st.idea > 60 && st.ex === 1 && st.drawn >= st.figs && !st.overflow && st.q === 0, st);
        const vis = await p.evaluate(() => [...document.querySelectorAll('.visual-fig')].map((f, i) => ({ i, slider: !!f.querySelector('input[type=range]'), readout: !!f.querySelector('.plot-readout') })));
        for (const v of vis.filter((v) => v.slider && v.readout)) { const fig = p.locator('.visual-fig').nth(v.i); const before = await fig.locator('.plot-readout').innerText(); let changed = false; const rs = fig.locator('input[type=range]'); for (let k = 0; k < await rs.count() && !changed; k++) { const r = rs.nth(k); await r.fill(await r.getAttribute('max')); await r.dispatchEvent('input'); changed = before !== await fig.locator('.plot-readout').innerText(); } ok(`${name} ${ch} ${s} visual ${v.i + 1}: sliders update readout`, changed); }
      }
      await p.goto(B + `#/ulangkaji/${ch}`); await p.waitForSelector('.v3-rev', { timeout: 8000 });
      const rv = await p.evaluate(() => ({ groups: document.querySelectorAll('.v3-rev').length, err: document.querySelectorAll('.katex-error').length, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
      ok(`${name} ${ch}: Ulang Kaji renders`, rv.groups === subs.length && !rv.err && !rv.overflow, rv);
      await p.fill('#rev-q', 'zzzz-tiada'); ok(`${name} ${ch}: Ulang Kaji search filters`, await p.evaluate(() => [...document.querySelectorAll('.v3-rev')].every((g) => g.hidden) && !document.querySelector('.v3-empty').hidden));
      await p.goto(B + `#/latihan/${ch}`); await p.waitForSelector('.q-card', { timeout: 8000 });
      const lt = await p.evaluate(() => ({ cards: document.querySelectorAll('.q-card').length, picks: document.querySelectorAll('.v3-qpicker button').length, overflow: document.documentElement.scrollWidth > innerWidth + 1 }));
      ok(`${name} ${ch}: Latihan shows one question`, lt.cards === 1 && lt.picks >= 5 && !lt.overflow, lt);
      // answer the first question that has an input or options, then expect the reveal
      for (let k = 0; k < lt.picks; k++) { await p.click(`.v3-qpicker button[data-i="${k}"]`); const hasIn = await p.$('.q-card .q-input'), hasOpt = await p.$('.q-card .q-option'); if (hasIn) { await hasIn.fill('12345'); await p.click('.q-card .q-check'); } else if (hasOpt) await hasOpt.click(); else continue; break; }
      await p.waitForTimeout(150);
      ok(`${name} ${ch}: Latihan reveals answer and concept link`, await p.evaluate(() => !document.querySelector('.q-reveal').hidden && document.querySelector('.q-solution').open && !!document.querySelector('.q-reveal a[href*="#/nota/"]')));
    }
    ok(`${name}: no console errors`, !errs.length, errs); await c.close();
  }
  console.log(`${pass}/${total} passed (${chapters.join(', ')})`); await b.close(); process.exit(pass === total ? 0 : 1);
})();
