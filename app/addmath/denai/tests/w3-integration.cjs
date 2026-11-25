// World 3 integration: World Map lock/unlock (3-1 after 2-3, then in order), launch of 3-1 from the map,
// the main menu button continuing into World 3, and the all-done state. PlayFab is stubbed.
// Usage: node tests/w3-integration.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
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
  const openW3 = async () => { await p.click('#world-map-btn'); await sleep(400); await p.click('.wm-node[data-world="w3"]').catch(() => p.click('.wm-card[data-world="w3"]')); await sleep(300); return panel(p); };
  const fresh = async (set) => { await p.goto(MAIN); await ready(p); await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, set); await p.reload(); await ready(p); await sleep(600); };
  const W1ALL = { 'denai-profile-v1': W1_DONE, 'denai-campaign-v1': JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1 } } }), 'denai-l3-campaign-v1': JSON.stringify({ schemaVersion: 1, completions: 1 }) };
  const W2ALL = JSON.stringify({ schemaVersion: 1, levels: Object.fromEntries(['w2-l1', 'w2-l2', 'w2-l3'].map((id) => [id, { completions: 1, completedRuns: ['r'], bestMs: 90000, coins: [], run: null }])) });
  // 1. World 2 not finished: 3-1 … 3-4 locked
  await fresh(W1ALL);
  res.locked = await openW3();
  ok(res.locked.length === 4 && res.locked.every((r) => /Dikunci/.test(r)), `before 2-3: World 3 locked: ${res.locked}`);
  await p.screenshot({ path: `${out}/w3int-1-terkunci.png` });
  // 2. after 2-3: the main button continues into 3-1; the map shows 3-1 available
  await fresh({ ...W1ALL, 'denai-w2-campaign-v1': W2ALL });
  res.main = await p.evaluate(() => ({ main: document.getElementById('play-main').textContent, sub: document.getElementById('play-main-sub').textContent }));
  ok(res.main.sub === 'Level 3-1 · Tiga Injap', `after World 2 the main button points at 3-1: ${JSON.stringify(res.main)}`);
  res.open = await openW3();
  ok(res.open[0].startsWith('3-1 Tersedia') && res.open.slice(1).every((r) => /Dikunci/.test(r)), `after 2-3: 3-1 available, rest locked: ${res.open}`);
  await p.screenshot({ path: `${out}/w3int-2-tersedia.png` });
  await Promise.all([p.waitForURL(/w3-l1\.html$/), p.click('#wm-panel button[data-level="w3-l1"][data-mode="play"]')]);
  await p.waitForFunction(() => window.__w3?.scene?.player); res.launched = p.url();
  // 3. 3-1 … 3-3 finished: 3-4 next; all four finished → main button says every world is done
  const W3 = (n) => JSON.stringify({ schemaVersion: 1, levels: Object.fromEntries(['w3-l1', 'w3-l2', 'w3-l3', 'w3-l4'].slice(0, n).map((id) => [id, { completions: 1, completedRuns: ['r'], bestMs: 80000, coins: [], run: null }])) });
  await fresh({ ...W1ALL, 'denai-w2-campaign-v1': W2ALL, 'denai-w3-campaign-v1': W3(3) });
  res.main34 = await p.evaluate(() => document.getElementById('play-main-sub').textContent);
  ok(res.main34 === 'Level 3-4 · Loji Optimum', `3-4 next: ${res.main34}`);
  await fresh({ ...W1ALL, 'denai-w2-campaign-v1': W2ALL, 'denai-w3-campaign-v1': W3(4) });
  res.mainAll = await p.evaluate(() => document.getElementById('play-main-sub').textContent);
  ok(/Dunia 1–3 selesai/.test(res.mainAll), `all done: ${res.mainAll}`);
  res.done = await openW3();
  ok(res.done.every((r) => /Selesai/.test(r)), `all four completed on the map: ${res.done}`);
  await b.close();
  ok(!errs.length, `page errors: ${errs.join(' | ')}`);
  console.log(JSON.stringify(res, null, 1));
  console.log(fails.length ? `w3-integration: FAIL\n - ${fails.join('\n - ')}` : 'w3-integration: PASS');
  process.exit(fails.length ? 1 : 0);
})();
