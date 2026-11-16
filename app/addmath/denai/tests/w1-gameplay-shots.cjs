// Gameplay screenshots at the normal camera (real zoom, player placed on the route).
// Usage: node tests/w1-gameplay-shots.cjs <outdir> [desk|phone]
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.', mode = process.argv[3] || 'desk';
const CAPTURE = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const SPOTS = { Lorong: [400, 1000, 1450, 2000, 3060, 3550, 4455, 4950, 5650], Jambatan: [500, 1450, 2350, 3050, 3700, 4650], GerbangSongsang: [300, 1500, 2800, 3520, 4600, 5150] };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext(mode === 'phone' ? { ...devices['iPhone 13 landscape'] } : { viewport: { width: 1280, height: 760 } });
  await ctx.addInitScript(CAPTURE);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await p.waitForTimeout(2500);
  const res = [];
  for (const key of Object.keys(SPOTS)) {
    if (key === 'Lorong') { await p.click('#play-main'); await p.waitForTimeout(2500); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); }
    else await p.evaluate(async (key) => {
      const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(key);
      await new Promise((r) => setTimeout(r, 2500));
      const s = g.scene.getScene(key); s.mode = 'playing'; s.physics?.world?.resume();
      document.querySelectorAll('dialog[open]').forEach((d) => d.close());
      for (const id of ['welcome', 'loading']) { const el = document.getElementById(id); if (el) el.hidden = true; }
    }, key);
    for (const x of SPOTS[key]) {
      const info = await p.evaluate(async ({ key, x }) => {
        const s = window.__game.scene.getScene(key);
        const tops = s.solids.getChildren().filter((o) => !o.getData('oneWay') && o.body.left <= x && o.body.right >= x).map((o) => o.body.top);
        const top = Math.min(...tops);
        s.player.body.reset(x, top - 31); s.player.body.setVelocity(0, 0);
        const cam = s.cameras.main; cam.centerOn(x + 85, top - 31 - (s.followOffsetY ?? 100));
        await new Promise((r) => setTimeout(r, 900));
        return { x, top, scrollX: Math.round(cam.scrollX), zoom: +cam.zoom.toFixed(3), bg: s.bgLayer?.scrollFactorX, theme: s.bgTheme };
      }, { key, x });
      await p.screenshot({ path: `${out}/${mode}-${key}-${x}.png` });
      res.push({ key, ...info });
    }
  }
  console.log(JSON.stringify({ res, errs })); await b.close();
})();
