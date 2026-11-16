// Render the whole map of every built level (camera zoom 1, no follow, UI hidden).
const { chromium } = require('playwright');
const out = process.argv[2];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAPTURE = () => {
  let P;
  Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => {
    P = v; const G = v.Game;
    v.Game = class extends G { constructor(c) { super(c); window.__game = this; } };
  } });
};
async function frame(page, sceneKey, file) {
  const info = await page.evaluate(async (key) => {
    const g = window.__game; let s = g.scene.getScene(key);
    if (key && !g.scene.isActive(key)) { g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(key); await new Promise((r) => setTimeout(r, 2500)); s = g.scene.getScene(key); }
    if (!key) s = g.scene.getScenes(true)[0];
    s.physics?.world?.pause();
    const b = s.physics.world.bounds; const cam = s.cameras.main;
    cam.stopFollow(); cam.removeBounds?.(); cam.setBounds(); cam.useBounds = false;
    return { key: s.scene.key, x: b.x, y: b.y, w: b.width, h: b.height };
  }, sceneKey);
  // fit the full width into a 3200px wide shot; height covers the playable band
  const W = 3200, zoom = W / info.w, top = info.y + (info.h > 900 ? info.h * 0.35 : 0), H = Math.round((info.y + info.h - top) * zoom);
  await page.setViewportSize({ width: W, height: Math.max(400, H) }); await sleep(800);
  await page.evaluate(({ key, zoom, top, w }) => {
    const g = window.__game, s = key ? g.scene.getScene(key) : g.scene.getScenes(true)[0];
    g.scale.setGameSize(innerWidth, innerHeight); g.scale.refresh();
    const cam = s.cameras.main; cam.stopFollow(); cam.useBounds = false; cam.setZoom(zoom);
    cam.setScroll(0, 0); cam.centerOn(w / 2, top + innerHeight / zoom / 2);
  }, { key: info.key, zoom, top, w: info.w });
  await sleep(700);
  await page.screenshot({ path: `${out}/${file}` });
  return { ...info, zoom: +zoom.toFixed(3) };
}
(async () => {
  const b = await chromium.launch(); const res = [];
  const ctx = await b.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addInitScript(CAPTURE);
  await ctx.addInitScript(() => addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'body *:not(canvas):not(#game):not(.game-frame):not(.game-stage):not(.shell){visibility:hidden!important} #game,#game canvas,.game-frame,.game-stage,.shell{visibility:visible!important} .shell,.game-stage,.game-frame{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;padding:0!important;margin:0!important}'; document.head.append(st); }));
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await sleep(2500);
  res.push(await frame(p, null, 'peta-1-1.png'));
  res.push(await frame(p, 'Jambatan', 'peta-1-2.png'));
  res.push(await frame(p, 'GerbangSongsang', 'peta-1-3.png'));
  const p2 = await ctx.newPage(); await p2.goto('http://localhost:8790/app/addmath/denai/lab-w2.html'); await p2.waitForFunction(() => window.__lab?.scene); await sleep(1500);
  await p2.evaluate(() => { const s = __lab.scene; s.a = -0.5; s.lock(); s.refresh(); });
  res.push(await frame(p2, null, 'peta-2-1-stesen-a.png'));
  console.log(JSON.stringify({ res, errs })); await b.close();
})();
