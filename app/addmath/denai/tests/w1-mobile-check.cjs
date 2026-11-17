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
  .flatMap(([id, d]) => [[`${id}-potret`, devices[d]], [`${id}-landskap`, devices[`${d} landscape`]]])
  // Real Android Chrome landscape keeps its address bar: the game frame is only ~260 CSS px tall.
  .concat([['android-bar-landskap', { viewport: { width: 705, height: 262 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]);
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: [], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
const MEASURE = () => {
  const vis = (el) => !!el && !el.hidden && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden' && (el.offsetParent !== null || getComputedStyle(el).position === 'fixed');
  const r = (el) => { if (!vis(el)) return null; const b = el.getBoundingClientRect(); return b.width && b.height ? { l: Math.round(b.left), t: Math.round(b.top), r: Math.round(b.right), b: Math.round(b.bottom) } : null; };
  const $ = (s) => document.querySelector(s);
  const g = window.__game, s = g.scene.getScenes(true).find((x) => x.player && x.mode === 'playing'), cam = s?.cameras.main, cv = g.canvas.getBoundingClientRect();
  let bubble = null; const bb = s?.bubble || s?.workshop?.bubble || s?.supply?.bubble;
  if (bb?.active && bb.visible) { const k = cam.zoom, wb = bb.getBounds(); bubble = { l: Math.round(cv.left + (wb.x - cam.worldView.x) * k), t: Math.round(cv.top + (wb.y - cam.worldView.y) * k), r: Math.round(cv.left + (wb.right - cam.worldView.x) * k), b: Math.round(cv.top + (wb.bottom - cam.worldView.y) * k) }; }
  const dlgOpen = !!$('#v4-dialog')?.classList.contains('open'), jr = $('#quest-tracker'), journalOpen = document.body.classList.contains('journal-open');
  return { vw: innerWidth, vh: innerHeight, dlgOpen, journalOpen, journalCut: journalOpen && jr.scrollHeight > jr.clientHeight + 1,
    pin: r($('#quest-pin')), jbtn: r($('#journal-btn')), journal: journalOpen ? r(jr) : null, hint: r($('#qt-hint-text')), dlgBox: dlgOpen ? r($('#v4-dialog .dlg-box')) : null, dlgPortrait: dlgOpen ? r($('#v4-dialog .dlg-portrait')) : null,
    pause: r($('#pause')), plaque: r($('.hud-plaque')), prompt: r($('#world-prompt')), store: r($('#store-panel')), bubble, touch: [...document.querySelectorAll('#touch-controls button')].map(r).filter(Boolean) };
};
const hit = (a, b) => !!(a && b && a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1);
const off = (a, m) => !!(a && (a.l < -1 || a.t < -1 || a.r > m.vw + 1 || a.b > m.vh + 1));
function judge(m) {
  const issues = [], hud = [m.pause, m.plaque, m.jbtn].filter(Boolean);
  const check = (name, el, others) => { if (!el) return; if (off(el, m)) issues.push(`${name} di luar skrin`); for (const [n, o] of others) if ((Array.isArray(o) ? o : [o]).some((x) => hit(el, x))) issues.push(`${name} ⟂ ${n}`); };
  check('pin', m.pin, [['HUD', hud], ['butang sentuh', m.touch]]);
  check('panel stor', m.store, [['HUD', hud], ['butang sentuh', m.touch], ['pin', m.pin]]);
  check('gesaan', m.prompt, [['butang sentuh', m.touch], ['pin', m.pin]]);
  check('gelembung', m.bubble, [['pin', m.pin], ['HUD', hud], ['butang sentuh', m.touch], ['gesaan', m.prompt]]);
  check('dialog', m.dlgBox, [['HUD', hud]]); check('potret', m.dlgPortrait, [['HUD', hud]]);
  if (m.dlgOpen && m.touch.length) issues.push('butang sentuh kelihatan semasa dialog');
  check('jurnal', m.journal, []); if (m.journalCut) issues.push('jurnal perlu skrol');
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
const V4 = require('./v4-helpers.cjs');
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  for (const [vp, dev] of VIEWPORTS) {
    res[vp] = {};
    // 1-1: bridge discovery dialogue → pin → store receipt → journal with hints.
    { const { ctx, p, errs } = await start(b, dev, 'Lorong'); const K = 'Lorong';
      await tp(p, K, 2460, 1242); await sleep(1200); const dlg = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-1-dialog.png` });
      const pages = await V4.closeDialogue(p, { tap: true }); const pin = await p.evaluate(MEASURE);
      await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); Object.assign(s.run.quest, { found: true, doorTried: true, key: true }); });
      await tp(p, K, 2367, 1242); await sleep(700);
      for (let i = 0; i < 3 && !(await p.isVisible('#store-panel')); i++) await guna(p, 600);
      const store = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-1-stor.png` });
      await p.locator('#sp-close').tap(); await sleep(300);
      await V4.openJournal(p, { tap: true }); await p.locator('#qt-hint').tap(); await sleep(250);
      const journal = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-1-jurnal.png` }); await V4.closeJournal(p, { tap: true });
      res[vp]['1-1'] = { dialogPages: pages.length, dialogIssues: judge(dlg), pinIssues: judge(pin), storeOpen: !!store.store, storeIssues: judge(store), journalIssues: judge(journal), hintVisible: !!journal.hint, errs }; await ctx.close(); }
    // 1-2: discovery dialogue → workshop run (one-line bubble).
    { const { ctx, p, errs } = await start(b, dev, 'Jambatan'); const K = 'Jambatan';
      await tp(p, K, 3440, 1242); await sleep(1200); const dlg = await p.evaluate(MEASURE); await V4.closeDialogue(p, { tap: true });
      await guna(p, 3600); const m = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-2-bengkel.png` });
      res[vp]['1-2'] = { dialogIssues: judge(dlg), issues: judge(m), bubble: !!m.bubble, errs }; await ctx.close(); }
    // 1-3: discovery dialogue → valve wheel → flow (one-line bubble) → journal.
    { const { ctx, p, errs } = await start(b, dev, 'GerbangSongsang'); const K = 'GerbangSongsang';
      await tp(p, K, 2700, 1620); await sleep(1200); const dlg = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-3-dialog.png` }); await V4.closeDialogue(p, { tap: true });
      await tp(p, K, 2862, 1620); await sleep(600); await guna(p, 450); const wheel = await p.evaluate(MEASURE);
      await tp(p, K, 3060, 1620); await sleep(500); await guna(p, 2300);
      const flow = await p.evaluate(MEASURE); await p.screenshot({ path: `${out}/${vp}-1-3-injap.png` });
      res[vp]['1-3'] = { dialogIssues: judge(dlg), wheelIssues: judge(wheel), flowIssues: judge(flow), bubble: !!flow.bubble, errs }; await ctx.close(); }
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
