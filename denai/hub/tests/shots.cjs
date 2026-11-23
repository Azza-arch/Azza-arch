// Screenshot + overflow + console check for a list of hub routes.
// Usage: node denai/hub/tests/shots.cjs <outdir> "#/" "#/hub" …
// A route may carry a setup script after "|", run before the screenshot.
const { chromium } = require('playwright');
const { ORIGIN, attach } = require('./serve.cjs');

(async () => {
  const [out, ...routes] = process.argv.slice(2);
  const browser = await chromium.launch();
  for (const [w, h, tag] of [[1280, 900, 'd'], [820, 1180, 't'], [390, 844, 'm']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await attach(ctx);
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', (e) => errs.push(`PAGEERROR ${e.message}`));
    for (const r of routes) {
      const [hash, setup] = r.split('|');
      await page.goto(`${ORIGIN}/denai/hub/${hash}`);
      await page.waitForTimeout(700);
      if (setup) { await page.evaluate(setup); await page.waitForTimeout(700); }
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in')));
      await page.waitForTimeout(600);
      const ow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      const name = `${(hash.replace(/[#/?=.|]+/g, '_').replace(/^_|_$/g, '') || 'home')}${setup ? '-s' : ''}-${tag}`;
      await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
      console.log(tag, hash, setup ? '(setup)' : '', 'overflow', ow, errs.splice(0).join(' || '));
    }
    await ctx.close();
  }
  await browser.close();
})();
