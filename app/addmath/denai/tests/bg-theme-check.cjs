// Background theme check: World 1 scenes draw ONE Kenney set (forest) only;
// the snow set is rendered separately here (test-only, no gameplay path).
// Usage: node tests/bg-theme-check.cjs <outDir> [port]   (server at repo root)
const { chromium } = require('playwright');
const [out = '.', port = '8790'] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAPTURE = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const HIDE = () => addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'body *:not(canvas):not(#game):not(.game-frame):not(.game-stage):not(.shell){visibility:hidden!important} #game,#game canvas,.game-frame,.game-stage,.shell{visibility:visible!important}'; document.head.append(st); });
// Frames of each set in tilemap-backgrounds_packed (8 columns).
const SNOW = new Set([0, 1, 2, 3, 8, 9, 10, 11, 16, 17, 18, 19]), FOREST = new Set([6, 7, 14, 15, 22, 23]);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(CAPTURE); await ctx.addInitScript(HIDE);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(`http://localhost:${port}/app/addmath/denai/main.html`); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await sleep(2500);
  const res = {};
  for (const key of ['Lorong', 'Jambatan', 'GerbangSongsang']) {
    res[key] = await p.evaluate(async (key) => {
      const g = window.__game; if (!g.scene.isActive(key)) { g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(key); await new Promise((r) => setTimeout(r, 2500)); }
      const s = g.scene.getScene(key), frames = new Set();
      s.children.list.forEach((o) => (o.list || [o]).forEach((c) => { if (c.texture?.key === 'kpp_bg_atlas') frames.add(+c.frame.name); }));
      const layers = s.children.list.filter((o) => o.list?.some((c) => c.texture?.key === 'kpp_bg_atlas')).length;
      return { theme: s.bgTheme, layers, frames: [...frames].sort((a, b) => a - b), camBg: s.cameras.main.backgroundColor.rgba };
    }, key);
    res[key].onlyForest = res[key].frames.every((f) => FOREST.has(f));
    res[key].noSnow = !res[key].frames.some((f) => SNOW.has(f));
  }
  // Snow, test-only: rebuild the background of 1-2 with the snow set.
  res.snow = await p.evaluate(async () => {
    const m = await import('/app/addmath/denai/src/v14/environment.js'), g = window.__game;
    g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start('Jambatan'); await new Promise((r) => setTimeout(r, 2500));
    const s = window.__game.scene.getScene('Jambatan'), bd = s.physics.world.bounds;
    m.buildBackground(s, { width: bd.width, floor: bd.y + bd.height }, 0, 'snow'); s.cameras.main.setBackgroundColor(s.bgColor);
    s.physics.world.pause(); s.cameras.main.stopFollow(); s.cameras.main.centerOn(bd.width * .3, s.player.y - 120);
    const frames = new Set(); s.bgLayer.list.forEach((c) => frames.add(+c.frame.name));
    return { theme: s.bgTheme, frames: [...frames].sort((a, b) => a - b) };
  });
  res.snow.onlySnow = res.snow.frames.every((f) => SNOW.has(f));
  await sleep(500); await p.screenshot({ path: `${out}/snow-ujian-1-2.png` });
  res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
  const ok = ['Lorong', 'Jambatan', 'GerbangSongsang'].every((k) => res[k].theme === 'forest' && res[k].layers === 1 && res[k].onlyForest) && res.snow.onlySnow && !errs.length;
  process.exit(ok ? 0 : 1);
})();
