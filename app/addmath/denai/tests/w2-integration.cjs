// World 2 integration (Phase 4): World Map lock/unlock and launch of 2-1, status from the World 2 save,
// replay = fresh run, 1-3 finale → World 2, Learning Hub game tab and progress. PlayFab is stubbed.
// Usage: node tests/w2-integration.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const BASE = 'http://denai.test:8790';
const MAIN = `${BASE}/app/addmath/denai/main.html`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const W1_DONE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-10-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-10-01T01:00:00.000Z' } }, coinIds: [], secretIds: [], achievements: [], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const W2 = (run, extra = {}) => JSON.stringify({ schemaVersion: 1, levels: { 'w2-l1': { completions: 0, completedRuns: [], bestMs: null, coins: [], run, ...extra } } });
const panel = (p) => p.$$eval('#wm-panel .wm-level', (els) => els.map((e) => `${e.querySelector('.wm-num').textContent} ${e.querySelector('.wm-chip').textContent} [${[...e.querySelectorAll('button')].map((b) => b.textContent + (b.disabled ? '(x)' : '')).join('|')}]`));

(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK);
  await ctx.route(/playfabapi\.com/, (r) => r.fulfill({ status: 404, contentType: 'application/json', body: '{"code":404,"status":"NotFound","error":"Stub"}' }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const res = {}, fails = [], ok = (c, m) => { if (!c) fails.push(m); };
  const openW2 = async () => { await p.click('#world-map-btn'); await sleep(400); await p.click('.wm-node[data-world="w2"]').catch(() => p.click('.wm-card[data-world="w2"]')); await sleep(300); return panel(p); };
  const fresh = async (set) => { await p.goto(MAIN); await ready(p); await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, set); await p.reload(); await ready(p); await sleep(600); };

  // 1. new player: 2-1 locked behind 1-1; 2-2, 2-3 coming soon
  await fresh({});
  res.locked = await openW2();
  ok(res.locked[0].startsWith('2-1 Dikunci') && res.locked[1].startsWith('2-2 Dikunci') && res.locked[2].startsWith('2-3 Dikunci'), `new player: 2-1, 2-2, 2-3 locked: ${res.locked}`);
  res.w1Card = await p.$eval('.wm-node[data-world="w2"]', (n) => n.getAttribute('aria-label'));
  await p.screenshot({ path: `${out}/int-1-terkunci.png` });
  // 2. after 1-1: available; Main opens the 2-1 page
  await fresh({ 'denai-profile-v1': W1_DONE });
  res.open = await openW2();
  ok(res.open[0].startsWith('2-1 Tersedia') && /\[Main\]/.test(res.open[0]), `after 1-1: 2-1 available: ${res.open}`);
  await p.screenshot({ path: `${out}/int-2-tersedia.png` });
  await Promise.all([p.waitForURL(/w2-l1\.html$/), p.click('#wm-panel button[data-level="w2-l1"][data-mode="play"]')]);
  await p.waitForFunction(() => window.__w2?.scene?.player); res.launched = p.url();
  // 3. a run in progress → Sambung; finished → Selesai, Main semula = fresh run (?baru=1)
  const midRun = { id: 'r1', checkpointId: 'after-a', coins: ['c1'], solved: { A: true, B: false, C: false }, levers: { A: { a: -0.5 }, B: { h: 3, k: 2 }, C: { k: 3 } }, elapsedMs: 40000, completed: false };
  await fresh({ 'denai-profile-v1': W1_DONE, 'denai-w2-campaign-v1': W2(midRun) });
  res.running = await openW2();
  ok(res.running[0].startsWith('2-1 Dalam perjalanan') && /Sambung/.test(res.running[0]), `run in progress: ${res.running}`);
  await Promise.all([p.waitForURL(/w2-l1\.html$/), p.click('#wm-panel button[data-level="w2-l1"][data-mode="continue"]')]);
  await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(300);
  res.continued = await p.evaluate(() => ({ cp: __w2.scene.run.checkpointId, A: __w2.scene.stations[0].solved }));
  ok(res.continued.cp === 'after-a' && res.continued.A, 'Sambung resumes at after-a with A solved');
  const done = { ...midRun, id: 'r2', solved: { A: true, B: true, C: true }, levers: { A: { a: -0.5 }, B: { h: 5, k: 4 }, C: { k: 1 } }, completed: true, elapsedMs: 70000 };
  await fresh({ 'denai-profile-v1': W1_DONE, 'denai-w2-campaign-v1': W2(done, { completions: 1, completedRuns: ['r2'], bestMs: 70000 }) });
  res.done = await openW2();
  ok(res.done[0].startsWith('2-1 Selesai') && /Main semula/.test(res.done[0]), `completed: ${res.done}`);
  ok(res.done[1].startsWith('2-2 Tersedia') && /\[Main\]/.test(res.done[1]) && res.done[2].startsWith('2-3 Dikunci'), `2-1 done opens 2-2 (2-3 still locked): ${res.done}`);
  await Promise.all([p.waitForURL(/w2-l2\.html$/), p.click('#wm-panel button[data-level="w2-l2"][data-mode="play"]')]);
  await p.waitForFunction(() => window.__w2?.scene?.stations?.some((s) => s.id === 'D')); res.l22 = p.url();
  await p.goto(MAIN); await ready(p); await sleep(400); await openW2();
  await p.screenshot({ path: `${out}/int-3-selesai.png` });
  await Promise.all([p.waitForURL(/w2-l1\.html/), p.click('#wm-panel button[data-level="w2-l1"][data-mode="replay"]')]);
  await p.waitForFunction(() => window.__w2?.scene?.player); await sleep(300);
  res.replay = await p.evaluate(() => ({ url: location.search, cp: __w2.scene.run.checkpointId, solved: Object.values(__w2.scene.run.solved).some(Boolean), completions: __w2.store.load().levels['w2-l1'].completions }));
  ok(res.replay.url === '' && res.replay.cp === 'entry' && !res.replay.solved && res.replay.completions === 1, `replay: fresh run, records kept ${JSON.stringify(res.replay)}`);
  // 4. the 2-1 page: Menu returns to the DENAI menu
  await Promise.all([p.waitForURL(/main\.html$/), p.click('.w2-menu')]); await ready(p);
  res.menuBack = true;
  // 5. 1-3 finale offers World 2
  await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.scene.start('GerbangSongsang', { fresh: true }); }); await sleep(2500);
  await p.evaluate(() => { const s = window.__game.scene.getScene('GerbangSongsang'); s.run.sluice.open = true; s.run.checkpointId = 'gate-court'; s.finish?.(); }).catch((e) => errs.push('finish:' + e.message));
  await sleep(1200);
  res.finale = await p.evaluate(() => ({ open: document.getElementById('complete').open, next: document.getElementById('lv-next')?.hidden === false ? document.getElementById('lv-next').textContent : null, teaser: document.querySelector('#complete .teaser-title')?.textContent }));
  ok(res.finale.open && res.finale.next === 'Ke Dunia 2' && /Jejak Lengkung/.test(res.finale.teaser), `1-3 finale → World 2: ${JSON.stringify(res.finale)}`);
  await p.screenshot({ path: `${out}/int-4-penamat-1-3.png` });
  if (res.finale.next) { await Promise.all([p.waitForURL(/w2-l1\.html$/), p.click('#lv-next')]); res.finaleNav = p.url(); }
  // 6. Learning Hub: World 2 mission + record. The hub's CSP upgrades plain http on any host except
  //    localhost, so it is opened on localhost with this player's saves copied over (same data).
  const saves = await p.evaluate(() => Object.fromEntries(Object.entries(localStorage)));
  const HUB = 'http://localhost:8790';
  await p.goto(`${HUB}/denai/hub/`); await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, saves);
  await p.goto(`${HUB}/denai/hub/#/main`); await p.waitForSelector('.world h3', { timeout: 15000 }).catch(() => {}); await sleep(500);
  res.hubGame = await p.evaluate(() => ({ worlds: [...document.querySelectorAll('.world h3')].map((h) => h.textContent), tags: [...document.querySelectorAll('.world .tag')].map((t) => t.textContent), l21: !!document.querySelector('a[href="/app/addmath/denai/w2-l1.html"]'), rec: [...document.querySelectorAll('.level')].map((l) => l.textContent.replace(/\s+/g, ' ').slice(0, 60)) }));
  ok(res.hubGame.l21 && res.hubGame.rec.some((t) => t.startsWith('2-1')) && res.hubGame.rec.some((t) => t.startsWith('2-2')), `hub game tab lists 2-1 and 2-2: ${JSON.stringify(res.hubGame)}`);
  await p.screenshot({ path: `${out}/int-5-hub-game.png`, fullPage: true });
  await p.goto(`${HUB}/denai/hub/#/bab/t4-2`); await p.waitForFunction(() => document.body.textContent.includes('Misi 2-1') || document.querySelector('.path-actions'), null, { timeout: 15000 }).catch(() => {}); await sleep(500);
  res.hubChapter = await p.evaluate(() => document.body.textContent.includes('Misi 2-1'));
  ok(res.hubChapter, 'hub chapter 2 shows the 2-1 mission link');
  await p.goto(`${HUB}/denai/hub/#/kemajuan`); await p.waitForSelector('#h-game', { timeout: 15000 }).catch(() => {}); await sleep(500);
  res.hubProgress = await p.evaluate(() => [...document.querySelectorAll('#h-game ~ p b, .game-recs li')].map((e) => e.textContent.replace(/\s+/g, ' ').slice(0, 70)));
  ok(res.hubProgress.some((t) => /Dunia 2 Lembah Batu Kapur/.test(t)), `hub progress shows World 2: ${res.hubProgress}`);
  res.errs = errs; ok(!errs.length, `no page errors: ${errs}`);
  await b.close();
  console.log(JSON.stringify(res, null, 1));
  console.log(fails.length ? `w2-integration: FAIL\n - ${fails.join('\n - ')}` : 'w2-integration: PASS');
  process.exitCode = fails.length ? 1 : 0;
})();
