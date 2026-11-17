// World 1 mobile layout check (Fasa F): 10 viewports (5 devices × portrait /
// landscape), touch only. For each level the real interaction is driven with
// the "Guna" button and the hint opened:
//   1-1: storeroom door → store panel (buy controls)   1-2: workshop run
//   1-3: valve wheel + flow
// Measured (CSS px): mission tracker, pause, HUD chips, world prompt, store
// panel, touch buttons — overlaps and off-screen; the in-game speech bubble is
// projected to the screen and checked against the tracker, HUD and buttons.
// Usage: node tests/w1-mobile-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const VIEWPORTS = [['iphone-se', 'iPhone SE'], ['iphone-13', 'iPhone 13'], ['pixel-5', 'Pixel 5'], ['galaxy-s8', 'Galaxy S8'], ['ipad-mini', 'iPad Mini']]
  .flatMap(([id, d]) => [[`${id}-potret`, devices[d]], [`${id}-landskap`, devices[`${d} landscape`]]]);
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: [], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
const MEASURE = () => {
  const r = (el) => { if (!el || el.hidden || el.offsetParent === null && getComputedStyle(el).position !== 'fixed') return null; const b = el.getBoundingClientRect(); return b.width && b.height ? { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } : null; };
  const $ = (s) => document.querySelector(s);
  const g = window.__game, s = g.scene.getScenes(true).find((x) => x.player && x.mode === 'playing'), cam = s?.cameras.main, cv = g.canvas.getBoundingClientRect();
  let bubble = null; const bb = s?.bubble || s?.workshop?.bubble || s?.supply?.bubble;
  if (bb?.active && bb.visible) { const k = cam.zoom, wb = bb.getBounds(); bubble = { l: Math.round(cv.left + (wb.x - cam.worldView.x) * k), t: Math.round(cv.top + (wb.y - cam.worldView.y) * k), r: Math.round(cv.left + (wb.right - cam.worldView.x) * k), b: Math.round(cv.top + (wb.bottom - cam.worldView.y) * k) }; }
  const trEl = $('#quest-tracker'), trackerShown = !!trEl && !trEl.hidden && getComputedStyle(trEl).visibility !== 'hidden', trackerScrolled = !!trEl && (trEl.scrollTop > 0 || trEl.scrollHeight > trEl.clientHeight + 1); // cut = scrolled or overflowing
  return { vw: innerWidth, vh: innerHeight, trackerShown, trackerScrolled, tracker: r($('#quest-tracker')), hint: r($('#qt-hint-text')), pause: r($('#pause')), area: r($('#hud-area')), coll: r($('#hud-collection')), prompt: r($('#world-prompt')), store: r($('#store-panel')), bubble, touch: [...document.querySelectorAll('#touch-controls button')].map(r).filter(Boolean) };
};
const hit = (a, b) => !!(a && b && a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1);
const off = (a, m) => !!(a && (a.l < -1 || a.t < -1 || a.r > m.vw + 1 || a.b > m.vh + 1));
function judge(m) {
  const issues = [], hud = [m.pause, m.area, m.coll].filter(Boolean);
  const check = (name, el, others) => { if (!el) return; if (off(el, m)) issues.push(`${name} di luar skrin`); for (const [n, o] of others) if ((Array.isArray(o) ? o : [o]).some((x) => hit(el, x))) issues.push(`${name} ⟂ ${n}`); };
  check('penjejak', m.tracker, [['jeda/HUD', hud], ['butang sentuh', m.touch]]);
  check('panel stor', m.store, [['jeda/HUD', hud], ['butang sentuh', m.touch]]);
  check('gesaan', m.prompt, [['butang sentuh', m.touch], ['penjejak', m.tracker]]);
  check('gelembung', m.bubble, [['penjejak', m.trackerShown ? m.tracker : null], ['jeda/HUD', hud], ['butang sentuh', m.touch], ['gesaan', m.prompt]]);
  if (m.tracker && !m.trackerShown && !m.bubble) issues.push('penjejak tersembunyi tanpa gelembung');
  if (m.trackerShown && m.trackerScrolled) issues.push('penjejak terpotong (skrol)');
  return issues;
}
async function start(b, dev, key) {
  const ctx = await b.newContext({ ...dev }); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html');
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
  await p.evaluate(([pr, l2, key]) => { localStorage.clear(); if (key !== 'Lorong') localStorage.setItem('denai-profile-v1', pr); if (key === 'GerbangSongsang') localStorage.setItem('denai-campaign-v1', l2); }, [PROFILE, L2DONE, key]);
  await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 }); await sleep(500);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  await p.evaluate(() => document.getElementById('play-main').click());
  await p.waitForFunction((k) => window.__game.scene.getScene(k)?.mode === 'playing', key, { timeout: 15000 }); await sleep(1200);
  await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  return { ctx, p, errs };
}
const tp = (p, key, x, feet) => p.evaluate(([k, x, feet]) => { const s = window.__game.scene.getScene(k); s.player.body.reset(x, feet - 31); s.player.body.setVelocity(0, 0); }, [key, x, feet]);
const guna = async (p, w = 400) => { const g = p.locator('[data-action="interact"]'); if (await g.isVisible()) { await g.tap(); await sleep(w); return true; } return false; };
const hintOpen = async (p) => { if (await p.isVisible('#qt-hint')) { await p.locator('#qt-hint').tap(); await sleep(250); } };
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  for (const [vp, dev] of VIEWPORTS) {
    res[vp] = {};
    // 1-1: storeroom door with the key → store panel; then bridge discovery bubble + hint.
    { const { ctx, p, errs } = await start(b, dev, 'Lorong'); const K = 'Lorong';
      await tp(p, K, 2460, 1242); await sleep(500); const disc = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-1-jambatan.png` }); // fresh run: discovery bubble
      await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); Object.assign(s.run.quest, { found: true, doorTried: true, key: true }); });
      await tp(p, K, 2367, 1242); await sleep(700);
      for (let i = 0; i < 3 && !(await p.isVisible('#store-panel')); i++) await guna(p, 600);
      const store = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-1-stor.png` });
      await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.player.body.reset(2200, 1211); }); await sleep(1600);
      await tp(p, K, 2460, 1242); await sleep(900); await hintOpen(p);
      const hint = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-1-petunjuk.png` });
      res[vp]['1-1'] = { storeOpen: !!store.store, storeIssues: judge(store), discoveryBubble: !!disc.bubble, discoveryIssues: judge(disc), hintIssues: judge(hint), hintVisible: !!hint.hint, errs }; await ctx.close(); }
    // 1-2: workshop run with the hint open.
    { const { ctx, p, errs } = await start(b, dev, 'Jambatan'); const K = 'Jambatan';
      await tp(p, K, 3440, 1242); await sleep(1000); await hintOpen(p); await guna(p, 3600);
      const m = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-2-bengkel.png` });
      res[vp]['1-2'] = { issues: judge(m), bubble: !!m.bubble, hintVisible: !!m.hint, errs }; await ctx.close(); }
    // 1-3: valve wheel, then flow, with the hint open.
    { const { ctx, p, errs } = await start(b, dev, 'GerbangSongsang'); const K = 'GerbangSongsang';
      await tp(p, K, 2862, 1620); await sleep(900); await guna(p, 450); await hintOpen(p);
      const wheel = await p.evaluate(MEASURE);
      await tp(p, K, 3060, 1620); await sleep(500); await guna(p, 2300);
      const flow = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-3-injap.png` });
      res[vp]['1-3'] = { wheelIssues: judge(wheel), flowIssues: judge(flow), bubble: !!flow.bubble, hintVisible: !!wheel.hint, errs }; await ctx.close(); }
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
