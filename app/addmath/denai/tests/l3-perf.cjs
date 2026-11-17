// Level 1-3 performance probe. Measures frame pacing (rAF intervals) and splits
// each frame into Phaser render time vs everything else, at several spots of
// the level, on a desktop profile and a phone profile with CPU throttling.
// Ablations (phone, throttled) isolate suspected costs before anything is cut:
//   coinsStatic   – coin spin animations stopped
//   waterStatic   – water-surface frame timer stopped
//   culled        – objects outside the camera view hidden (draw-call count)
//   burst         – 10 coin-pickup effects fired during the window
// Usage: node tests/l3-perf.cjs <outdir> [scene] [quick]
// (python3 -m http.server 8790 at the repo root). Headless Chromium: Canvas 2D,
// no GPU; numbers are relative, not a promise for a real phone.
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const SCENE = process.argv[3] || 'GerbangSongsang';
const QUICK = process.argv[4] === 'quick';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const SPOTS = { GerbangSongsang: [['mula', 300, 1728], ['runtuhan', 1500, 1404], ['halaman-mesin', 2862, 1620], ['gerbang', 5000, 1566]] }[SCENE];

async function open(b, opts) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html');
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  await p.evaluate((k) => { const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(k, { fresh: true }); }, SCENE);
  await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  // Instrument: time spent inside the renderer per frame.
  await p.evaluate(() => { const r = window.__game.renderer, orig = r.render.bind(r); window.__rt = 0; r.render = (...a) => { const t = performance.now(); orig(...a); window.__rt += performance.now() - t; }; });
  return { ctx, p, errs };
}
async function sample(p, frames, spot, ablation) {
  return p.evaluate(async ({ frames, spot, ablation, SCENE }) => {
    const g = window.__game, s = g.scene.getScene(SCENE), cam = s.cameras.main;
    const [name, x, feet] = spot;
    s.player.body.reset(x, feet - 31); s.player.body.setVelocity(0, 0); cam.centerOn(x, feet - 190);
    const undo = [];
    if (ablation === 'coinsStatic') for (const c of s.coinViews || []) { if (c.art.anims?.isPlaying) { c.art.anims.pause(); undo.push(() => c.art.anims.resume()); } }
    if (ablation === 'waterStatic') { const evs = s.time._active.filter((e) => e.loop); evs.forEach((e) => { e.paused = true; undo.push(() => { e.paused = false; }); }); }
    for (let i = 0; i < 30; i++) await new Promise((r) => requestAnimationFrame(r));
    if (ablation === 'culled') { const v = cam.worldView, m = 120; for (const o of s.children.list) { if (!o.visible || o === s.player || o.scrollFactorX !== 1) continue; const b = o.getBounds?.(); if (b && (b.right < v.x - m || b.x > v.right + m || b.bottom < v.y - m || b.y > v.bottom + m)) { o.setVisible(false); undo.push(() => o.setVisible(true)); } } }
    const list = s.children.list, visible = list.filter((o) => o.visible).length;
    const v = cam.worldView; const inView = list.filter((o) => { if (!o.visible) return false; if (o.scrollFactorX !== 1) return true; const b = o.getBounds?.(); return b && !(b.right < v.x || b.x > v.right || b.bottom < v.y || b.y > v.bottom); }).length;
    const t = [], rts = []; let last = performance.now(); window.__rt = 0;
    for (let i = 0; i < frames; i++) {
      if (ablation === 'burst' && i % 12 === 0 && i < 120) { const fx = await import('/app/addmath/denai/src/v14/feel.js'); fx.coinPickup(s, x + (i % 5) * 20, feet - 60, { reduced: false }); }
      await new Promise((r) => requestAnimationFrame(r)); const n = performance.now(); t.push(n - last); last = n; rts.push(window.__rt); window.__rt = 0;
    }
    undo.forEach((f) => f());
    const sorted = [...t].sort((a, b) => a - b), q = (k) => +sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * k))].toFixed(1);
    const mean = t.reduce((a, b) => a + b, 0) / t.length, rMean = rts.reduce((a, b) => a + b, 0) / rts.length;
    return { spot: name, ablation, frames, fps: +(1000 / mean).toFixed(1), medianMs: q(.5), p95Ms: q(.95), p99Ms: q(.99), long33: t.filter((x) => x > 33.4).length, renderMs: +rMean.toFixed(2), objects: list.length, visible, inView, tweens: s.tweens.getTweens().length, emitters: list.filter((o) => o.type === 'ParticleEmitter').length, canvas: [g.canvas.width, g.canvas.height], zoom: cam.zoom };
  }, { frames, spot, ablation, SCENE });
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const res = { scene: SCENE, browser: b.version(), note: 'headless Chromium, Canvas 2D renderer (Phaser.CANVAS), software raster', profiles: {} };
  const N = QUICK ? 120 : 240;
  const profiles = [
    ['desktop-1280x720', { viewport: { width: 1280, height: 720 } }, 1],
    ['iphone13-landskap-cpu4x', { ...devices['iPhone 13 landscape'] }, 4],
    ['iphone13-potret-cpu4x', { ...devices['iPhone 13'] }, 4],
  ];
  for (const [name, opts, cpu] of profiles) {
    const { ctx, p, errs } = await open(b, opts);
    if (cpu > 1) { const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
    const rows = [];
    for (const spot of SPOTS) rows.push(await sample(p, N, spot, 'base'));
    if (name.startsWith('iphone13-landskap')) {
      const spot = SPOTS.find((s) => s[0] === 'halaman-mesin');
      for (const a of ['coinsStatic', 'waterStatic', 'culled', 'burst']) rows.push(await sample(p, N, spot, a));
      rows.push(await sample(p, N, spot, 'base'));
      await p.screenshot({ path: `${out}/perf-${name}.png` });
    }
    res.profiles[name] = { cpuThrottle: cpu, rows, errs };
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
