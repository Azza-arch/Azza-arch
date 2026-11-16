// Level 1-1 area banner: appears once on entering a named area, ~2 s, no spam on boundaries or respawn.
// Usage: node tests/l1-banner-check.cjs <outdir>   (server on :8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => {
  let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } });
  window.__plays = [];
  addEventListener('DOMContentLoaded', () => {
    const t = document.getElementById('zone-toast');
    new MutationObserver(() => { if (t.classList.contains('play') && !t.dataset.counted) { t.dataset.counted = '1'; window.__plays.push({ at: performance.now(), text: t.querySelector('b')?.textContent }); } if (!t.classList.contains('play')) delete t.dataset.counted; })
      .observe(t, { attributes: true, attributeFilter: ['class'] });
  });
};
const tp = (p, x, feet) => p.evaluate(([x, feet]) => { const s = window.__game.scene.getScene('Lorong'); s.player.body.reset(x, feet - 31); s.player.body.setVelocity(0, 0); }, [x, feet]);
const plays = (p) => p.evaluate(() => window.__plays.map((q) => q.text));
async function visibleMs(p) { // sample opacity until it is gone
  const t0 = Date.now(); let first = null, last = null;
  while (Date.now() - t0 < 3200) { const o = await p.evaluate(() => { const c = getComputedStyle(document.getElementById('zone-toast')); return c.visibility === 'visible' ? +c.opacity : 0; }); if (o > 0.05) { first ??= Date.now(); last = Date.now(); } await sleep(40); }
  return first ? last - first : 0;
}
async function start(p) {
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player); await sleep(1200);
}
(async () => {
  const b = await chromium.launch(); const res = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/playfab|net::/i.test(m.text())) errs.push(m.text()); });
  await start(p); await p.click('#start'); await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing');
  res.startBanner = { plays: await plays(p), visibleMs: await visibleMs(p) };
  res.hudChip = await p.textContent('#hud-area');
  await sleep(300); await p.screenshot({ path: `${out}/b-desk-gameplay-no-banner.png` });
  // enter each area once (ground positions), measure the visible time of each banner
  res.areas = [];
  for (const [x, feet] of [[1300, 1404], [2300, 1242], [3100, 1242], [4455, 1296], [5400, 1242]]) {
    const before = (await plays(p)).length; await tp(p, x, feet); await sleep(150);
    if (x === 3100) { await sleep(250); await p.screenshot({ path: `${out}/b-desk-banner.png` }); }
    const ms = await visibleMs(p); res.areas.push({ x, newPlays: (await plays(p)).slice(before), visibleMs: ms });
    await sleep(200); res.areas.at(-1).afterStill = (await plays(p)).length - before; // no replay while standing still
  }
  // boundary jitter around 4212 (Tebing → Pokok Tinjau) within the 40 px band
  await tp(p, 4455, 1296); await sleep(7000); // stand in area 5 (its banner already played)
  const n0 = (await plays(p)).length;
  for (const x of [4200, 4225, 4195, 4240, 4185, 4230, 4198]) { await tp(p, x, x < 4212 ? 1242 : 1296); await sleep(120); }
  res.jitterPlays = (await plays(p)).length - n0;
  // cross well back and forth: back to area 4 then 5 again within 6 s → suppressed
  await tp(p, 4050, 1242); await sleep(200); await tp(p, 4455, 1296); await sleep(200);
  res.backAndForthPlays = (await plays(p)).length - n0;
  // respawn in the same area: no banner
  const n1 = (await plays(p)).length; await p.evaluate(() => window.__game.scene.getScene('Lorong').respawn()); await sleep(600);
  res.respawnSameAreaPlays = (await plays(p)).length - n1;
  res.errs = errs; await ctx.close();
  // phone landscape
  const pc = await b.newContext({ ...devices['iPhone 13 landscape'] }); await pc.addInitScript(HOOK);
  const pp = await pc.newPage(); await start(pp); await pp.locator('#start').tap(); await pp.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing');
  await sleep(2500); await tp(pp, 3100, 1242); await sleep(450); await pp.screenshot({ path: `${out}/b-phone-banner.png` });
  res.phoneBannerBox = await pp.evaluate(() => { const r = document.getElementById('zone-toast').getBoundingClientRect(); const pause = document.getElementById('pause').getBoundingClientRect(); const coin = document.getElementById('hud-collection').getBoundingClientRect(); return { banner: [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom)], overlapsPause: r.right > pause.left && r.top < pause.bottom, overlapsCoins: r.left < coin.right && r.top < coin.bottom, vw: innerWidth }; });
  await sleep(2200); await pp.screenshot({ path: `${out}/b-phone-sawmill.png` });
  await pc.close(); await b.close();
  console.log(JSON.stringify(res, null, 1));
})();
