// World 1 performance probe (Fasa F). Same method for all three levels so the
// numbers are comparable: frame pacing from requestAnimationFrame intervals and
// the time spent inside Phaser's renderer, per spot, standing and running.
// Profiles: desktop 1280×720 (no throttle); iPhone 13 landscape and portrait
// with CPU ×4 throttling (Chrome DevTools Protocol). Headless Chromium has no
// GPU: Canvas 2D is rasterised in software, so absolute numbers are a stress
// proxy for a slow phone, not a promise for a real one.
// Ablations (iPhone landscape, first spot): coin spin stopped, water/loop
// timers paused, a burst of 10 pickup effects, culling disabled (?nocull).
// Usage: node tests/w1-perf.cjs <outdir> [Lorong|Jambatan|GerbangSongsang|all] [nocull] [quick]
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const WHICH = process.argv[3] || 'all';
const NOCULL = process.argv.includes('nocull');
const N = process.argv.includes('quick') ? 120 : 240;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = (nocull) => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; if (nocull) window.__DENAI_NO_CULL__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const SPOTS = { Lorong: [400, 1450, 3060, 4950], Jambatan: [500, 1500, 3440, 4500], GerbangSongsang: [300, 1500, 2862, 5000] };
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: [], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });

async function open(b, opts, key) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK, NOCULL); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html');
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  if (key === 'Lorong') {
    await p.evaluate(() => { localStorage.clear(); }); await p.reload();
    await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
    if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
    await p.evaluate(() => document.getElementById('play-main').click());
    await p.waitForFunction(() => window.__game.scene.getScene('Lorong')?.mode === 'playing', null, { timeout: 15000 });
  } else {
    await p.evaluate((pr) => localStorage.setItem('denai-profile-v1', pr), PROFILE);
    await p.evaluate((k) => { const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(k, { fresh: true }); }, key);
  }
  await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.evaluate(() => { const r = window.__game.renderer, orig = r.render.bind(r); window.__rt = 0; r.render = (...a) => { const t = performance.now(); orig(...a); window.__rt += performance.now() - t; }; });
  return { ctx, p, errs };
}
async function sample(p, key, x, ablation, run) {
  return p.evaluate(async ({ key, x, ablation, run, N }) => {
    const g = window.__game, s = g.scene.getScene(key), cam = s.cameras.main, raf = () => new Promise((r) => requestAnimationFrame(r));
    // Stand on the solid ground under x.
    const ground = s.routePlatforms.filter((b) => !b.getData('oneWay') && b.body && x >= b.body.left && x <= b.body.right).map((b) => b.body.top).sort((a, b) => a - b)[0] ?? 1200;
    s.player.body.reset(x, ground - 31); s.player.body.setVelocity(0, 0); cam.centerOn(x, ground - 190);
    const undo = [];
    if (ablation === 'coinsStatic') for (const c of [...(s.coinViews || []).map((v) => v.art), ...(s.collectibles || [])]) if (c?.anims?.isPlaying) { c.anims.pause(); undo.push(() => c.anims.resume()); }
    if (ablation === 'timersPaused') s.time._active.filter((e) => e.loop).forEach((e) => { e.paused = true; undo.push(() => { e.paused = false; }); });
    for (let i = 0; i < 30; i++) await raf();
    const t = [], rts = []; let last = performance.now(); window.__rt = 0; const x0 = s.player.x;
    for (let i = 0; i < N; i++) {
      if (run) s.player.body.setVelocityX(240);
      if (ablation === 'burst' && i % 12 === 0 && i < 120) { const fx = await import('/app/addmath/denai/src/v14/feel.js'); fx.coinPickup(s, s.player.x + (i % 5) * 20, s.player.y - 40, { reduced: false }); }
      await raf(); const n = performance.now(); t.push(n - last); last = n; rts.push(window.__rt); window.__rt = 0;
    }
    if (run) s.player.body.setVelocityX(0);
    undo.forEach((f) => f());
    const sorted = [...t].sort((a, b) => a - b), q = (k) => +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * k))].toFixed(1);
    const mean = t.reduce((a, b) => a + b, 0) / t.length, rMean = rts.reduce((a, b) => a + b, 0) / rts.length, rs = [...rts].sort((a, b) => a - b);
    const cull = s.viewCull?.stats?.();
    return { spot: x, mode: run ? 'lari' : 'diam', ablation, frames: N, meanMs: +mean.toFixed(1), medianMs: q(.5), p95Ms: q(.95), p99Ms: q(.99), maxMs: q(1), over33: t.filter((v) => v > 33.4).length, over50: t.filter((v) => v > 50).length, fps: +(1000 / mean).toFixed(1), renderMeanMs: +rMean.toFixed(2), renderP95Ms: +rs[Math.floor(rs.length * .95)].toFixed(2), moved: Math.round(s.player.x - x0), objects: s.children.list.length, drawn: cull ? cull.reduce((n, c) => n + c.drawn, 0) : null, managed: cull ? cull.reduce((n, c) => n + c.objects, 0) : null, culling: !!s.viewCull };
  }, { key, x, ablation, run, N });
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const res = { browser: b.version(), renderer: null, culling: !NOCULL, framesPerSample: N, note: 'headless Chromium, software Canvas 2D; CPU throttling via CDP', levels: {} };
  const profiles = [['desktop-1280x720', { viewport: { width: 1280, height: 720 } }, 1], ['iphone13-landskap-cpu4x', { ...devices['iPhone 13 landscape'] }, 4], ['iphone13-potret-cpu4x', { ...devices['iPhone 13'] }, 4]];
  for (const key of WHICH === 'all' ? Object.keys(SPOTS) : [WHICH]) {
    res.levels[key] = {};
    for (const [name, opts, cpu] of profiles) {
      const { ctx, p, errs } = await open(b, opts, key);
      res.renderer ??= await p.evaluate(() => ({ type: window.__game.config.renderType, canvas: window.__game.renderer.type === 1 ? 'CANVAS' : 'WEBGL' }));
      if (cpu > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
      const rows = [];
      for (const x of SPOTS[key]) rows.push(await sample(p, key, x, 'base', false));
      rows.push(await sample(p, key, SPOTS[key][0], 'base', true));
      if (name.startsWith('iphone13-landskap')) for (const a of ['coinsStatic', 'timersPaused', 'burst']) rows.push(await sample(p, key, SPOTS[key][1], a, false));
      if (name.startsWith('iphone13-landskap')) await p.screenshot({ path: `${out}/perf-${key}-${NOCULL ? 'tanpa' : 'dengan'}-cull.png` });
      res.levels[key][name] = { cpuThrottle: cpu, rows, errs };
      await ctx.close();
    }
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
