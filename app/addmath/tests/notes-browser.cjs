// Bab 1 interaction test for the notes app (V3 pages), desktop + phone, with screenshots.
//   node app/addmath/tests/notes-browser.cjs <outdir>
// Files are served in-process (denai/hub/tests/serve.cjs); NOTES_SMOKE_SERVER=1 uses
// python3 -m http.server 8790 at the repo root instead.
// Updated 2026-11-23: the original version targeted the pre-V3 page (practice cards on
// #/nota) and Bab 1 in 'review'. Bab 1 is published (2026-11-14) and practice lives in
// Latihan (#/latihan/<bab>/<sub>), so the same intents are checked on the current pages:
// public visibility, rendering (KaTeX + MathML, visuals, no horizontal scroll), the
// expression checker accepting an equivalent form, specific misconception feedback,
// structured parts, and the visual slider. Review hiding is covered per chapter status in
// notes-smoke.cjs and denai/hub/tests/hub-smoke.cjs.
const { chromium, devices } = require('playwright');
const S = process.argv[2] || require('os').tmpdir();
const SERVE = process.env.NOTES_SMOKE_SERVER === '1' ? null : require('../../../denai/hub/tests/serve.cjs');
const B = SERVE ? `${SERVE.ORIGIN}/app/addmath/` : 'http://127.0.0.1:8790/app/addmath/';
(async () => {
  const b = await chromium.launch(); const R = [];
  const ok = (n, c, d) => { R.push(!!c); console.log(c ? 'PASS' : 'FAIL', n, d !== undefined ? JSON.stringify(d).slice(0, 300) : ''); };
  for (const [name, opt] of [['desktop', { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 }], ['phone', { ...devices['iPhone 13'] }]]) {
    const c = await b.newContext(opt); if (SERVE) await SERVE.attach(c); const p = await c.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error' && !/frame-ancestors/.test(m.text())) errs.push(m.text()); });
    // public view: Bab 1 is published, so its three subtopics are listed without the preview banner
    await p.goto(B + '?semak=0#/bab/t4-1'); await p.waitForTimeout(600);
    const pub = await p.evaluate(() => ({ subs: document.querySelectorAll('.v3-subrow').length, banner: !!document.querySelector('.preview-banner') }));
    ok(`${name}: public Bab 1 lists its 3 published subtopics, no preview banner`, pub.subs === 3 && !pub.banner, pub);
    for (const sub of ['1.1', '1.2', '1.3']) {
      await p.goto(B + '#/nota/t4-1/' + sub); await p.waitForSelector('.v3-idea', { timeout: 8000 });
      await p.evaluate(() => document.querySelectorAll('.v3-more').forEach((d) => { d.open = true; d.dispatchEvent(new Event('toggle')); })); await p.waitForTimeout(400);
      const st = await p.evaluate(() => ({ katex: document.querySelectorAll('.katex').length, katexErr: document.querySelectorAll('.katex-error').length, mathml: document.querySelectorAll('.katex math').length, svgs: document.querySelectorAll('.visual-fig svg, .visual-fig .value-table').length, figs: document.querySelectorAll('.visual-fig').length, ex: document.querySelectorAll('.v3-example, .example').length, overflow: document.documentElement.scrollWidth > innerWidth + 1, font: getComputedStyle(document.querySelector('.katex')).fontFamily }));
      ok(`${name}: ${sub} renders (KaTeX+MathML, visuals, examples, no h-scroll)`, st.katex > 30 && st.katexErr === 0 && st.mathml === st.katex && st.svgs >= st.figs && st.ex >= 5 && !st.overflow && /KaTeX/.test(st.font), st);
      if (sub === '1.1' && name === 'desktop') await p.screenshot({ path: `${S}/nota11_top.png` });
    }
    // practice interactions in Latihan 1.2: open a question by id through the picker
    await p.goto(B + '#/latihan/t4-1/1.2'); await p.waitForSelector('.q-card', { timeout: 8000 });
    const open = async (id) => { const n = await p.locator('.v3-qpicker button').count(); for (let k = 0; k < n; k++) { await p.click(`.v3-qpicker button[data-i="${k}"]`); if (await p.$(`[id="q-${id}-card"]`)) return p.locator(`[id="q-${id}-card"]`); } return null; };
    let card = await open('t4-1.2-03');
    await card.locator('.q-input').fill('4(x+2)-1'); await card.locator('.q-check').click();
    const r1 = await card.locator('.q-feedback').first().getAttribute('class');
    card = await open('t4-1.2-03'); await card.locator('.q-input').fill('4x+1'); await card.locator('.q-check').click();
    const r2 = await card.locator('.q-feedback').first().innerText();
    ok(`${name}: expression answer accepts equivalent form, explains gf / bracket mistake`, /is-right/.test(r1) && /gf/.test(r2) && /Kurungan/.test(r2), { r1, r2 });
    card = await open('t4-1.2-01'); await card.locator('.q-input').fill('21'); await card.locator('.q-check').click();
    ok(`${name}: numeric wrong answer gives specific feedback`, /gf/.test(await card.locator('.q-feedback').first().innerText()));
    card = await open('t4-1.2-09'); await card.locator('.q-part').nth(0).locator('.q-input').fill('104'); await card.locator('.q-part').nth(0).locator('.q-check').click();
    ok(`${name}: structured part checks`, /is-right/.test(await card.locator('.q-part').nth(0).locator('.q-feedback').getAttribute('class')));
    if (name === 'phone') await p.screenshot({ path: `${S}/latihan12_phone.png` });
    // visual slider
    await p.goto(B + '#/nota/t4-1/1.1'); await p.waitForSelector('.v3-idea');
    await p.evaluate(() => document.querySelectorAll('.v3-more').forEach((d) => { d.open = true; d.dispatchEvent(new Event('toggle')); })); await p.waitForTimeout(300);
    const fig = p.locator('.visual-fig').filter({ has: p.locator('input[type=range]') }).filter({ has: p.locator('.plot-readout') }).first();
    const before = await fig.locator('.plot-readout').innerText(); const rng = fig.locator('input[type=range]').first();
    await rng.fill(await rng.getAttribute('max')); await rng.dispatchEvent('input');
    const after = await fig.locator('.plot-readout').innerText(); ok(`${name}: slider updates visual readout`, before !== after, { after: after.slice(0, 80) });
    if (name === 'phone') { await fig.scrollIntoViewIfNeeded(); await p.screenshot({ path: `${S}/nota11_phone_visual.png` }); }
    ok(`${name}: no console errors`, errs.length === 0, errs); await c.close();
  }
  console.log(`${R.filter(Boolean).length}/${R.length} passed`); await b.close(); process.exit(R.every(Boolean) ? 0 : 1);
})();
