// UI consistency across every level (1-1 … 3-4): one camera zoom per screen size (desktop, phone
// landscape, phone with the browser bar) and World 1's shell everywhere (HUD plaque, pause button and
// card, victory card; on phones the touch pad). Fails if any level drifts from the others.
// Usage: node tests/ui-consistency.cjs   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const { devices } = require('playwright');
const BASE = 'http://denai.test:8790';
const MAIN = `${BASE}/app/addmath/denai/main.html`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const W1_DONE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-10-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-10-01T01:00:00.000Z' } }, coinIds: [], secretIds: [], achievements: [], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const W2 = (run, extra = {}) => JSON.stringify({ schemaVersion: 1, levels: { 'w2-l1': { completions: 0, completedRuns: [], bestMs: null, coins: [], run, ...extra } } });
const panel = (p) => p.$$eval('#wm-panel .wm-level', (els) => els.map((e) => `${e.querySelector('.wm-num').textContent} ${e.querySelector('.wm-chip').textContent} [${[...e.querySelectorAll('button')].map((b) => b.textContent + (b.disabled ? '(x)' : '')).join('|')}]`));


const W1ALL = { 'denai-profile-v1': W1_DONE, 'denai-campaign-v1': JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1 } } }), 'denai-l3-campaign-v1': JSON.stringify({ schemaVersion: 1, completions: 1 }) };
const W2ALL = JSON.stringify({ schemaVersion: 1, levels: Object.fromEntries(['w2-l1', 'w2-l2', 'w2-l3'].map((id) => [id, { completions: 1, completedRuns: ['r'], bestMs: 90000, coins: [], run: null }])) });
const MEASURE = () => {
  const sc = window.__w3?.scene ?? window.__w2?.scene ?? window.__game?.scene.getScenes(true).find((s) => s.player);
  const cam = sc.cameras.main, vis = sc.visual ?? sc.player;
  const ui = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 30 && r.height > 14 && cs.visibility !== 'hidden' && cs.display !== 'none' && +cs.opacity > 0.05 && (e.matches('section,aside,dialog,[class*=hud],[class*=tools],[class*=touch],[class*=menu],button,a,header,[id*=hud],[class*=panel],[class*=quest],[class*=cue]')); })
    .map((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { tag: e.tagName.toLowerCase(), id: e.id, cls: String(e.className).slice(0, 40), text: (e.innerText || '').replace(/\s+/g, ' ').slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), font: cs.fontFamily.split(',')[0], fs: cs.fontSize, bg: cs.backgroundColor, border: cs.borderTopWidth + ' ' + cs.borderTopColor, radius: cs.borderTopLeftRadius }; })
    .filter((u, i, a) => a.findIndex((v) => v.x === u.x && v.y === u.y && v.w === u.w) === i).slice(0, 40);
  return { scene: sc.scene.key, zoom: +cam.zoom.toFixed(3), view: { w: Math.round(cam.width / cam.zoom), h: Math.round(cam.height / cam.zoom) }, canvas: { w: cam.width, h: cam.height }, playerPx: Math.round((vis.displayHeight || 60) * cam.zoom), bg: cam.backgroundColor ? cam.backgroundColor.rgba : null, ui };
};
const LEVELS = ['w1-l1', 'w1-l2', 'w1-l3', 'w2-l1', 'w2-l2', 'w2-l3', 'w3-l1', 'w3-l2', 'w3-l3', 'w3-l4'];
// the shared shell every level must show (World 1's UI): plaque, pause, pause card, victory card; on phones the touch pad
const SHELL = () => {
  const vis = (sel) => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
  const has = (sel) => !!document.querySelector(sel);
  return { plaque: vis('.masthead .hud-plaque'), pause: vis('#pause'), pauseCard: has('dialog#paused .pause-actions'), victory: has('dialog#complete .victory-panel .victory-stats'), touchJump: vis('.touch-controls .jump'), touchLeft: vis('.touch-controls [data-hold="left"]') };
};
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const fails = [], ok = (c, m) => { if (!c) fails.push(m); }, res = {};
  for (const [dev, opts] of [['desktop', { viewport: { width: 1280, height: 760 } }], ['phone', { ...devices['iPhone 13 landscape'] }], ['short', { ...devices['iPhone 13 landscape'], viewport: { width: 750, height: 300 } }]]) {
    const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK);
    await ctx.route(/playfabapi\.com/, (r) => r.fulfill({ status: 404, contentType: 'application/json', body: '{"code":404}' }));
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto(MAIN); await ready(p).catch(() => {});
    await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, { ...W1ALL, 'denai-w2-campaign-v1': W2ALL });
    const zooms = {};
    for (const id of LEVELS) {
      if (id.startsWith('w1')) {
        await p.goto(MAIN); await ready(p); await sleep(500);
        await p.click('#world-map-btn'); await sleep(400); await p.click('.wm-node[data-world="w1"]').catch(() => p.click('.wm-card[data-world="w1"]')); await sleep(300);
        await p.click(`#wm-panel button[data-level="${id}"][data-mode="replay"]`); await sleep(3000);
        for (const sel of ['dialog[open] button', '.dialogue-ui button']) { const d = await p.$(sel); if (d) { await d.click().catch(() => {}); await sleep(400); } }
      } else {
        await p.goto(`${BASE}/app/addmath/denai/${id}.html${dev !== 'desktop' ? '?touch' : ''}`); await p.waitForFunction(() => (window.__w2 ?? window.__w3)?.scene?.player, null, { timeout: 20000 }); await sleep(1000);
      }
      const m = await p.evaluate(MEASURE), shell = await p.evaluate(SHELL);
      zooms[id] = m.zoom; res[`${dev}:${id}`] = { zoom: m.zoom, playerPx: m.playerPx, ...shell };
      ok(shell.plaque && shell.pause && shell.pauseCard && shell.victory, `${dev} ${id}: World 1 shell ${JSON.stringify(shell)}`);
      if (dev !== 'desktop') ok(shell.touchJump && shell.touchLeft, `${dev} ${id}: touch pad ${JSON.stringify(shell)}`);
    }
    const z = new Set(Object.values(zooms)); ok(z.size === 1, `${dev}: one zoom for every level ${JSON.stringify(zooms)}`);
    ok(!errs.length, `${dev}: page errors ${errs.join(' | ')}`);
    await ctx.close();
  }
  await b.close();
  console.log(JSON.stringify(res));
  console.log(fails.length ? `ui-consistency: FAIL\n - ${fails.join('\n - ')}` : 'ui-consistency: PASS');
  process.exit(fails.length ? 1 : 0);
})();
