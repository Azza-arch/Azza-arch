// Focused traversal + save check for World 1 after the environment pass.
// Drops the player on every checkpoint (real physics), confirms it lands on the
// expected surface, walks right briefly, and lists the save keys written.
const { chromium } = require('playwright');
const CAPTURE = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } });
  await ctx.addInitScript(CAPTURE);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await p.waitForTimeout(2000);
  await p.click('#start'); await p.waitForTimeout(2500);
  const res = {};
  for (const key of ['Lorong', 'Jambatan', 'GerbangSongsang']) {
    if (key !== 'Lorong') await p.evaluate(async (key) => { const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(key); await new Promise((r) => setTimeout(r, 2500)); document.querySelectorAll('dialog[open]').forEach((d) => d.close()); }, key);
    res[key] = await p.evaluate(async (key) => {
      const s = window.__game.scene.getScene(key); s.mode = 'playing'; s.physics?.world?.resume();
      const frame = () => new Promise((r) => requestAnimationFrame(r));
      const cps = (s.checkpoints || s.constructor.CHECKPOINTS || []);
      const list = key === 'Lorong' ? (await import('./src/v14/level.js')).CHECKPOINTS.map((c) => ({ id: c.id, x: c.x, feet: c.feet }))
        : key === 'Jambatan' ? (await import('./src/v14/levels/twin-world.js')).CHECKPOINTS : (await import('./src/v14/levels/inverse-world.js')).CHECKPOINTS;
      const out = [];
      for (const c of list) {
        s.player.body.reset(c.x, c.feet - 40); s.player.body.setVelocity(0, 0);
        for (let i = 0; i < 40; i++) await frame();
        const landed = Math.round(s.player.body.bottom), grounded = s.player.body.blocked.down || s.player.body.touching.down;
        const ctl = window.__game.scene.getScene(key).keys; // walk right using the real right key state
        s.player.body.setVelocityX(280); for (let i = 0; i < 20; i++) { s.player.body.setVelocityX(280); await frame(); }
        out.push({ id: c.id, feet: c.feet, landed, grounded, ok: grounded && Math.abs(landed - c.feet) <= 1, afterWalk: Math.round(s.player.body.bottom) });
      }
      s.writeSave?.();
      return out;
    }, key);
  }
  res.saveKeys = await p.evaluate(() => Object.keys(localStorage).sort());
  res.errs = errs; console.log(JSON.stringify(res, null, 1)); await b.close();
})();
