// Deterministic 30 fps frame recorder for real DENAI gameplay.
// The page clock is faked (Playwright clock): each captured frame advances the
// game by exactly 1/30 s (two 60 Hz Phaser steps), then the viewport is captured.
const { chromium } = require('playwright');
const fs = require('fs');
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function open({ seed = {}, w = 1280, h = 720, dpr = 1.5 } = {}) {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr });
  await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html');
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
  await p.evaluate((seed) => { localStorage.clear(); for (const [k, v] of Object.entries(seed)) localStorage.setItem(k, v); }, seed);
  await p.reload();
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
  await sleep(600);
  const cdp = await ctx.newCDPSession(p); await cdp.send('Animation.enable');
  const r = { b, ctx, p, cdp, errs, dir: null, n: 0, faked: false };
  r.fake = async () => { if (!r.faked) { await p.clock.install(); r.faked = true; await p.clock.runFor(200); } await cdp.send('Animation.setPlaybackRate', { playbackRate: 0.22 }); };
  r.shot = (dir) => { r.dir = dir; r.n = 0; fs.rmSync(dir, { recursive: true, force: true }); fs.rmSync(`${dir}.track.jsonl`, { force: true }); fs.mkdirSync(dir, { recursive: true }); };
  // Advance n frames; capture each one when a shot is active.
  r.frames = async (n, each) => { for (let i = 0; i < n; i++) { if (each) await each(i); await p.clock.runFor(1000 / 30); if (r.dir) { const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 94, clip: { x: 0, y: 0, width: w, height: h, scale: dpr } }); fs.writeFileSync(`${r.dir}/${String(r.n++).padStart(5, '0')}.jpg`, Buffer.from(data, 'base64'));
      const tr = await p.evaluate((k) => { const s = window.__game.scene.getScenes(true)[0]; if (!s?.player) return null; const c = s.cameras.main, wv = c.worldView, z = c.zoom * k;
        const sc = (o) => (o ? [Math.round((o.x - wv.x) * z), Math.round((o.y - wv.y) * z)] : null);
        return { p: sc({ x: s.player.x, y: s.player.body.center.y }), wheel: sc(s.sluice?.wheel), meter: sc(s.sluice?.needle) }; }, dpr);
      fs.appendFileSync(`${r.dir}.track.jsonl`, JSON.stringify(tr) + '\n'); } } };
  r.idle = async (n) => { const d = r.dir; r.dir = null; await r.frames(n); r.dir = d; };
  r.down = (k) => p.keyboard.down(k); r.up = (k) => p.keyboard.up(k);
  r.tap = async (k) => { await p.keyboard.down(k); await r.frames(2); await p.keyboard.up(k); };
  r.S = (key) => `window.__game.scene.getScene('${key}')`;
  r.st = (key) => p.evaluate((k) => { const s = window.__game.scene.getScene(k), b = s.player.body; return { x: Math.round(s.player.x), bottom: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down }; }, key);
  r.tp = (key, x, feet) => p.evaluate(([k, x, feet]) => { const s = window.__game.scene.getScene(k); s.player.body.reset(x, feet - 31); s.player.body.setVelocity(0, 0); }, [key, x, feet]);
  r.closeDialogs = () => p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  r.dlgOpen = () => p.evaluate(() => !!document.getElementById('v4-dialog')?.classList.contains('open'));
  // Frame-based movement helpers (same logic as the keyboard playthrough tests).
  r.run = async (K, dir, toX, max = 600) => { const key = dir > 0 ? 'KeyD' : 'KeyA'; await r.down(key); let lastX = -1, still = 0;
    for (let i = 0; i < max; i++) { const s = await r.st(K); if ((dir > 0 && s.x >= toX) || (dir < 0 && s.x <= toX)) break;
      if (Math.abs(s.x - lastX) < 2) still++; else still = 0; lastX = s.x;
      if (still > 4 && s.grounded) { await p.keyboard.down('Space'); await r.frames(1); await p.keyboard.up('Space'); still = 0; } else await r.frames(1); }
    await r.up(key); };
  r.settle = async (K, x) => { for (let i = 0; i < 20; i++) { const s = await r.st(K); if (Math.abs(s.x - x) < 14) break; const k = s.x < x ? 'KeyD' : 'KeyA'; await r.down(k); await r.frames(1); await r.up(k); await r.frames(2); } };
  r.hop = async (K, dir, toX) => { const key = dir > 0 ? 'KeyD' : 'KeyA'; await r.down(key); await p.keyboard.down('Space'); await r.frames(1); await p.keyboard.up('Space'); let air = false;
    for (let i = 0; i < 80; i++) { const s = await r.st(K); if (!s.grounded) air = true; if (dir > 0 && s.x >= toX) await r.up(key); if (air && s.grounded) break; await r.frames(1); } await r.up(key); };
  r.climb = async (K, topFeet) => { await r.down('KeyW'); for (let i = 0; i < 200; i++) { const s = await p.evaluate((k) => { const s = window.__game.scene.getScene(k); return { c: !!s.climbing, b: Math.round(s.player.body.bottom) }; }, K); if (!s.c && s.b <= topFeet + 2) break; await r.frames(1); } await r.up('KeyW'); };
  r.closeDlg = async () => { for (let i = 0; i < 40 && (await r.dlgOpen()); i++) { const ready = await p.evaluate(() => document.getElementById('v4-dialog').classList.contains('ready')); if (ready) { await r.tap('Space'); await r.frames(4); } else await r.frames(1); } await r.frames(6); };
  r.climbAny = async (K) => { await r.down('KeyW'); let started = false; for (let i = 0; i < 220; i++) { const c = await p.evaluate((k) => !!window.__game.scene.getScene(k).climbing, K); if (c) started = true; if (started && !c) break; await r.frames(1); } await r.up('KeyW'); };
  r.journal = async (open) => { const isOpen = await p.evaluate(() => document.body.classList.contains('journal-open')); if (isOpen !== open) { await r.tap('KeyJ'); await r.frames(6); } };
  r.close = () => b.close();
  return r;
}
module.exports = { open, sleep };
