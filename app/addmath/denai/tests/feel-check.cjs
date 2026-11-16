// Game Feel V2 checks: coin spin frames, single collection + saved ids,
// reduced motion, pooled particles, cleanup across scene restarts, and a
// throttled-phone frame-rate sample. PlayFab is never contacted.
// Usage: node tests/feel-check.cjs <outdir> [port]   (python3 -m http.server <port> at the repo root)
const { chromium, devices } = require('playwright');
const [out = '.', port = '8790'] = process.argv.slice(2);
const PAGE = `http://denai.test:${port}/app/addmath/denai/main.html`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
async function open(b, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, ...opts }); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(PAGE); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden); await sleep(600);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  await p.evaluate(() => document.getElementById('play-main').click()); await sleep(2300); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  return { ctx, p, errs };
}
const go = async (p, k) => { await p.evaluate((k) => { const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(k); }, k); await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); };
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  { const { ctx, p, errs } = await open(b);
    // 1-1: coins animate between the two real coin frames, out of phase
    res.l1Coins = await p.evaluate(async () => { const s = window.__game.scene.getScene('Lorong'); const coins = s.collectibles.filter((c) => c.anims); const seen = new Set(); for (let i = 0; i < 30; i++) { coins.forEach((c) => seen.add(c.frame.name)); await new Promise((r) => setTimeout(r, 50)); } return { animated: coins.filter((c) => c.anims.isPlaying).length, total: s.collectibles.length, frames: [...seen].sort(), key: coins[0]?.anims.currentAnim?.key, desync: new Set(coins.map((c) => c.anims.currentFrame?.index + ':' + Math.round(c.anims.accumulator / 100))).size > 1 }; });
    // single collection: stand on a coin for 30 frames, then again
    res.l1Collect = await p.evaluate(async () => { const s = window.__game.scene.getScene('Lorong'); const c = s.collectibles.find((o) => o.active && o.anims); const id = c.getData('id'); const before = s.coinsFound;
      for (let k = 0; k < 2; k++) { s.player.body.reset(c.x, c.y); for (let i = 0; i < 30; i++) await new Promise((r) => requestAnimationFrame(r)); }
      const save = JSON.parse(localStorage.getItem('denai-save-v14') || 'null'), prof = JSON.parse(localStorage.getItem('denai-profile-v1'));
      return { id, delta: s.coinsFound - before, inRun: s.collectedCoinIds.has(id), inSave: save?.collectedCoinIds.includes(id), inProfile: prof.coinIds.includes(id), emitters: s.children.list.filter((o) => o.type === 'ParticleEmitter').length }; });
    // 1-2: coins spin, pickup once, checkpoint chime + spring, bridge planks drop but collide immediately
    await go(p, 'Jambatan');
    res.l2 = await p.evaluate(async () => { const s = window.__game.scene.getScene('Jambatan'), raf = () => new Promise((r) => requestAnimationFrame(r)); const m = await import('/app/addmath/denai/src/v14/levels/twin-world.js');
      const v = s.coinViews.find((c) => c.art.visible); const playing = s.coinViews.filter((c) => c.art.anims?.isPlaying).length;
      for (let k = 0; k < 2; k++) { s.player.body.reset(v.def.x, v.def.y + 20); for (let i = 0; i < 20; i++) await raf(); }
      const coinTimes = s.run.coins.filter((id) => id === v.def.id).length, stored = JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].coins.includes(v.def.id);
      s.player.body.reset(1188 + 30, 1260); for (let i = 0; i < 40; i++) await raf(); const cpArt = s.checkpointArts[1];
      s.openBridge(m.STATIONS[0]); const plankTweens = s.tweens.getTweens().length; const deck = s.bridges.twins.length;
      const body = s.solids?.getChildren?.().find((o) => o.body && Math.abs(o.body.top - 1296) < 1 && o.body.left >= 1836 && o.body.left < 2160);
      return { playing, total: s.coinViews.length, coinTimes, stored, cp: s.run.checkpointId, cpFrame: cpArt.frame.name, plankTweens, deck, bridgeBodyNow: !!body }; });
    // restart → pooled emitter is recreated without errors
    await p.evaluate(() => window.__game.scene.getScene('Jambatan').scene.restart({ fresh: true })); await sleep(2500);
    res.l2AfterRestart = await p.evaluate(async () => { const s = window.__game.scene.getScene('Jambatan'); const f = await import('/app/addmath/denai/src/v14/feel.js'); for (let i = 0; i < 40; i++) f.burst(s, 500, 1200, 6, 0xffffff, false); return { emitters: s.children.list.filter((o) => o.type === 'ParticleEmitter').length, alive: s.__feelEmitter?.getAliveParticleCount?.() }; });
    // 1-3: seals pop only when newly lit; restore does not replay
    await go(p, 'GerbangSongsang');
    res.l3 = await p.evaluate(async () => { const s = window.__game.scene.getScene('GerbangSongsang'); const n0 = s.tweens.getTweens().length; s.run.puzzle.seals[13] = true; s.updateGate(); const n1 = s.tweens.getTweens().length; s.updateGate(); const n2 = s.tweens.getTweens().length; s.run.puzzle.seals[7] = true; s.run.puzzle.seals[15] = true; s.updateGate(); return { popTweens: n1 - n0, repeatCallTweens: n2 - n1, bridge: s.bridgeArt.length, coinsPlaying: s.coinViews.filter((c) => c.art.anims?.isPlaying).length }; });
    res.errs = errs; await ctx.close(); }
  // reduced motion: no spin, no particles, no plank tweens; state still updates
  { const { ctx, p, errs } = await open(b, { reducedMotion: 'reduce' });
    res.reduced = await p.evaluate(async () => { const s = window.__game.scene.getScene('Lorong'); const c = s.collectibles.find((o) => o.anims); const playing = s.collectibles.filter((o) => o.anims?.isPlaying).length; const before = s.coinsFound; s.player.body.reset(c.x, c.y); for (let i = 0; i < 20; i++) await new Promise((r) => requestAnimationFrame(r)); return { playing, frame: c.frame.name, collected: s.coinsFound - before, emitters: s.children.list.filter((o) => o.type === 'ParticleEmitter').length }; });
    await go(p, 'Jambatan');
    res.reducedL2 = await p.evaluate(async () => { const s = window.__game.scene.getScene('Jambatan'); const m = await import('/app/addmath/denai/src/v14/levels/twin-world.js'); const n0 = s.tweens.getTweens().length; s.openBridge(m.STATIONS[0]); return { tweens: s.tweens.getTweens().length - n0, deck: s.bridges.twins.length, alpha: s.bridges.twins[0].alpha }; });
    res.reducedErrs = errs; await ctx.close(); }
  // throttled phone frame rate (CPU ×4), 1-2 with every coin on screen spinning
  { const { ctx, p, errs } = await open(b, { ...devices['iPhone 13 landscape'] });
    await go(p, 'Jambatan'); const cdp = await ctx.newCDPSession(p); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await p.evaluate(() => { const s = window.__game.scene.getScene('Jambatan'); s.cameras.main.stopFollow(); s.cameras.main.setZoom(.5).centerOn(2400, 1200); });
    await sleep(1500);
    res.phoneFps = await p.evaluate(async () => { const g = window.__game, t = []; let last = performance.now(); for (let i = 0; i < 180; i++) { await new Promise((r) => requestAnimationFrame(r)); const n = performance.now(); t.push(n - last); last = n; } t.sort((a, b) => a - b); return { median: +(1000 / t[90]).toFixed(1), p95ms: +t[171].toFixed(1), loopFps: +g.loop.actualFps.toFixed(1) }; });
    await p.screenshot({ path: `${out}/feel-phone-throttled.png` }); res.phoneErrs = errs; await ctx.close(); }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
