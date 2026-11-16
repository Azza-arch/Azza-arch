// Main menu + World Map checks in PRODUCTION unlock mode (host is not a local-preview host).
// Usage: node tests/menu-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const URL = 'http://denai.test:8790/app/addmath/denai/main.html';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const levels = (p) => p.$$eval('#wm-panel .wm-level', (els) => els.map((e) => ({ num: e.querySelector('.wm-num').textContent, chip: e.querySelector('.wm-chip').textContent, buttons: [...e.querySelectorAll('button')].map((b) => `${b.textContent}${b.disabled ? '(disabled)' : ''}`) })));
const menu = (p) => p.evaluate(() => ({ main: document.getElementById('play-main').textContent, sub: document.getElementById('play-main-sub').textContent, buttons: [...document.querySelectorAll('.title-actions > button')].filter((b) => b.offsetParent).map((b) => b.textContent) }));
const active = (p) => p.evaluate(() => window.__game.scene.getScenes(true).map((s) => s.scene.key + ':' + s.mode));
const PROFILE_DONE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 2, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: { timeMs: 312000, coins: 9, secrets: 1, at: '2026-11-01T00:00:00.000Z' } } }, coinIds: ['start-reward'], secretIds: [], achievements: ['jejak-pertama', 'tepat-sekali'] });

(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/playfab|net::|favicon/i.test(m.text())) errs.push(m.text()); });
  // 1. new player
  await p.goto(URL); await ready(p); await p.evaluate(() => localStorage.clear()); await p.reload(); await ready(p); await sleep(800);
  res.newPlayerMenu = await menu(p); await p.screenshot({ path: `${out}/m-desk-menu-new.png` });
  await p.click('#world-map-btn'); await sleep(500);
  res.newPlayerW1 = await levels(p); await p.screenshot({ path: `${out}/m-desk-worldmap-new.png` });
  await p.click('.wm-node[data-world="w2"]'); await sleep(300); res.w2 = await levels(p); res.w2dev = await p.textContent('.wm-dev');
  await p.screenshot({ path: `${out}/m-desk-worldmap-w2.png` });
  await p.click('#wm-back'); await sleep(300);
  // 2. MAIN starts 1-1 directly (no selection modal)
  await p.click('#play-main'); await sleep(1500); res.afterMain = await active(p); res.dialogsOpen = await p.evaluate(() => [...document.querySelectorAll('dialog[open]')].map((d) => d.id));
  await p.evaluate(() => window.__game.scene.getScene('Lorong').writeSave()); await p.reload(); await ready(p); await sleep(600);
  res.l1InProgressMenu = await menu(p); await p.click('#world-map-btn'); await sleep(400); res.l1InProgress = await levels(p);
  // 3. 1-1 completed (profile record) → 1-2 unlocked, MAIN/SAMBUNG goes to 1-2
  await p.evaluate((pr) => { localStorage.removeItem('denai-save-v14'); localStorage.setItem('denai-profile-v1', pr); }, PROFILE_DONE); await p.reload(); await ready(p); await sleep(600);
  res.l1DoneMenu = await menu(p); await p.click('#world-map-btn'); await sleep(400); res.l1Done = await levels(p);
  await p.screenshot({ path: `${out}/m-desk-worldmap-l1done.png` });
  await p.click('#wm-back'); await sleep(300);
  await p.click('#play-main'); await sleep(2500); res.mainGoesTo = await active(p);
  await sleep(1200); await p.evaluate(() => window.__game.scene.getScene('Jambatan').returnToMenu()); await sleep(2500);
  res.returnFromL2 = { mapOpen: await p.isVisible('#world-map-page'), scenes: await active(p) }; res.afterL2Visit = await levels(p);
  // 4. Replay 1-1 keeps the permanent record
  await p.click('#wm-panel button[data-level="w1-l1"][data-mode="replay"]'); await sleep(1500);
  res.replayL1 = { scenes: await active(p), profileCompletions: await p.evaluate(() => JSON.parse(localStorage.getItem('denai-profile-v1')).levels['w1-l1'].completions), achievements: await p.evaluate(() => JSON.parse(localStorage.getItem('denai-profile-v1')).achievements) };
  // 5. 1-2 completed in its own store → 1-3 available; replay 1-2 keeps completions
  await p.evaluate(() => { const k = 'denai-campaign-v1'; const raw = JSON.parse(localStorage.getItem(k) || '{"schemaVersion":1,"levels":{}}'); raw.schemaVersion = 1; raw.levels ||= {}; raw.levels['w1-l2'] = { ...(raw.levels['w1-l2'] || {}), completions: 1, completedRuns: ['x'], coins: [], secrets: [], bestMs: 400000, run: null }; localStorage.setItem(k, JSON.stringify(raw)); localStorage.removeItem('denai-save-v14'); });
  await p.reload(); await ready(p); await sleep(600); res.l2DoneMenu = await menu(p); await p.click('#world-map-btn'); await sleep(400); res.l2Done = await levels(p);
  await p.click('#wm-panel button[data-level="w1-l2"][data-mode="replay"]'); await sleep(2500);
  res.replayL2 = { scenes: await active(p), completions: await p.evaluate(() => JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].completions) };
  // 6. Everything complete → MAIN opens the World Map
  await p.evaluate(() => window.__game.scene.getScene('Jambatan').returnToMenu()); await sleep(2000); // leave 1-2 so its pagehide save cannot race the injection
  await p.evaluate(() => { localStorage.setItem('denai-l3-campaign-v1', JSON.stringify({ schemaVersion: 1, completions: 1, completedRuns: ['y'], coins: [], secrets: [], run: null })); const k = 'denai-campaign-v1'; const raw = JSON.parse(localStorage.getItem(k)); raw.levels['w1-l2'].run = null; localStorage.setItem(k, JSON.stringify(raw)); });
  await p.reload(); await ready(p); await sleep(600); res.allDoneMenu = await menu(p);
  await p.click('#play-main'); await sleep(500); res.allDoneMainOpensMap = await p.isVisible('#world-map-page'); res.allDone = await levels(p);
  await p.screenshot({ path: `${out}/m-desk-worldmap-alldone.png` });
  await p.keyboard.press('Escape'); await sleep(300); res.escClosesMap = !(await p.isVisible('#world-map-page'));
  await p.screenshot({ path: `${out}/m-desk-menu-alldone.png` });
  res.errs = errs; await ctx.close();
  // 7. phone landscape + portrait
  for (const [name, dev] of [['phone-land', devices['iPhone 13 landscape']], ['phone-port', devices['iPhone 13']]]) {
    const c = await b.newContext({ ...dev }); await c.addInitScript(HOOK); const q = await c.newPage(); const e2 = []; q.on('pageerror', (e) => e2.push(e.message));
    await q.goto(URL); await ready(q); await q.evaluate((pr) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); }, PROFILE_DONE); await q.reload(); await ready(q); await sleep(800);
    if (await q.isVisible('.rotate-stay')) { await q.locator('.rotate-stay').tap(); await sleep(300); }
    await q.screenshot({ path: `${out}/m-${name}-menu.png` });
    await q.locator('#world-map-btn').tap(); await sleep(400); await q.screenshot({ path: `${out}/m-${name}-worlds.png` });
    await q.locator('.wm-card[data-world="w1"]').tap(); await sleep(400); await q.screenshot({ path: `${out}/m-${name}-w1.png` });
    res[name] = { panelFull: await q.evaluate(() => { const r = document.getElementById('wm-panel').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), vw: innerWidth, vh: innerHeight }; }), minButton: await q.$$eval('#wm-panel button', (bs) => Math.min(...bs.map((x) => x.getBoundingClientRect().height))), levels: await levels(q), errs: e2 };
    await q.locator('.wm-panel-back').tap(); await sleep(200); res[name].backToWorlds = await q.isVisible('.wm-card[data-world="w1"]');
    await c.close();
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
