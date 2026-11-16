// Level 1-1 (Phase C) focused checks with real physics and real keyboard input.
// Usage: node tests/l1-redesign-check.cjs <screenshot dir>   (server on :8790 at the repo root)
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const CAPTURE = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const S = () => window.__game.scene.getScene('Lorong');

async function st(p) { return p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'), b = s.player.body; return { x: Math.round(s.player.x), bottom: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down, climbing: !!s.climbing }; }); }
async function tp(p, x, feet) { await p.evaluate(([x, feet]) => { const s = window.__game.scene.getScene('Lorong'); s.player.body.reset(x, feet - 31); s.player.body.setVelocity(0, 0); s.climbing = null; s.player.body.setAllowGravity(true); }, [x, feet]); await sleep(350); }
async function run(p, dir, toX, maxMs = 15000) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; const trace = []; let last = await st(p), lastT = Date.now(), t0 = Date.now();
  await p.keyboard.down(key);
  while (Date.now() - t0 < maxMs) {
    const s = await st(p); trace.push([s.x, s.bottom]);
    if ((dir > 0 && s.x >= toX) || (dir < 0 && s.x <= toX)) break;
    if (Math.abs(s.x - last.x) > 3) { last = s; lastT = Date.now(); }
    else if (Date.now() - lastT > 160 && s.grounded) { await p.keyboard.press('Space'); lastT = Date.now(); }
    await sleep(30);
  }
  await p.keyboard.up(key); await sleep(250);
  const end = await st(p); return { end, ms: Date.now() - t0, reached: dir > 0 ? end.x >= toX : end.x <= toX, minBottom: Math.min(...trace.map((q) => q[1])), maxBottom: Math.max(...trace.map((q) => q[1])), trace };
}
async function climb(p, key, ms = 4000) { await p.keyboard.down(key); const t0 = Date.now(); let s; while (Date.now() - t0 < ms) { s = await st(p); if (!s.climbing && Date.now() - t0 > 400) break; await sleep(40); } await p.keyboard.up(key); await sleep(300); return st(p); }
async function hop(p, dir, toX, maxMs = 2500) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; await p.keyboard.down(key); await p.keyboard.press('Space'); const t0 = Date.now(); let air = false, s;
  while (Date.now() - t0 < maxMs) { s = await st(p); if (!s.grounded) air = true; if ((dir > 0 && s.x >= toX) || (dir < 0 && s.x <= toX)) { await p.keyboard.up(key); } if (air && s.grounded) break; await sleep(20); }
  await p.keyboard.up(key); await sleep(200); return st(p);
}
async function E(p) { await p.keyboard.press('KeyE'); await sleep(250); }

(async () => {
  const b = await chromium.launch(); const res = {};
  const ctx = await b.newContext({ viewport: { width: 1280, height: 760 }, deviceScaleFactor: 1 }); await ctx.addInitScript(CAPTURE);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/playfab|net::/i.test(m.text())) errs.push(m.text()); });
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await sleep(2000);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await sleep(2000);
  await p.click('#start'); await sleep(2500);
  await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.click('#game'); await sleep(200);
  // A. main route from the spawn over the hill, through the root lane, up the steps, over the plank stack, to the machine
  res.mainToYard = await run(p, 1, 1820); res.mainToYard.trace = undefined;
  await p.screenshot({ path: `${out}/g-yard.png` });
  res.mainToMachine = await run(p, 1, 2440); res.mainToMachine.trace = undefined;
  await p.screenshot({ path: `${out}/g-machine.png` });
  // F. main maths machine still opens from its lever
  await E(p); await sleep(400);
  res.machinePanel = await p.evaluate(() => [...document.querySelectorAll('section,dialog,[role=dialog]')].some((e) => !e.hidden && e.offsetParent !== null && /fungsi|papan|f\(x\)/i.test(e.textContent || '') && e.getBoundingClientRect().height > 80));
  await p.keyboard.press('Escape'); await sleep(300); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.mode = 'playing'; s.physics.world.resume(); s.input.keyboard.enabled = true; for (const id of ['mechanism']) { const e = document.getElementById(id); if (e) e.hidden = true; } });
  // B. optional arch: ladder in the shaft → arch top → drop to the yard (return loop G1)
  await tp(p, 1215, 1404); res.archLadderTop = await climb(p, 'KeyW');
  await p.screenshot({ path: `${out}/g-arch-top.png` });
  res.archWalk = await run(p, 1, 1700); res.archWalk.trace = res.archWalk.trace.filter((q) => q[0] > 1300 && q[0] < 1600).slice(0, 3);
  // C. house veranda
  await tp(p, 135, 1296); res.houseLadder = await climb(p, 'KeyW'); res.houseVeranda = await run(p, -1, 50, 3000); res.houseVeranda.trace = undefined;
  await p.screenshot({ path: `${out}/g-house.png` });
  // D. sawmill + jetty: one wrong attempt (b = 3), then the right one (b = 4)
  await tp(p, 3060, 1242); await E(p); await E(p); await E(p);
  res.millAfter3 = await p.evaluate(() => window.__game.scene.getScene('Lorong').sawmill.b);
  await tp(p, 3375, 1296); await E(p); await sleep(300);
  res.leverWrong = await p.evaluate(() => { const m = window.__game.scene.getScene('Lorong').sawmill; return { text: m.last, built: m.built, shown: m.planks.filter((q) => q.visible).length }; });
  await p.screenshot({ path: `${out}/g-jetty-wrong.png` });
  await tp(p, 3060, 1242); await E(p);
  await tp(p, 3375, 1296); await E(p); await sleep(400);
  res.leverRight = await p.evaluate(() => { const m = window.__game.scene.getScene('Lorong').sawmill; return { text: m.last, built: m.built, shown: m.planks.filter((q) => q.visible).length }; });
  res.jettyWalk = await run(p, 1, 3690, 6000); res.jettyWalk.trace = undefined;
  await p.screenshot({ path: `${out}/g-jetty-built.png` });
  res.jettyLadder = await climb(p, 'KeyW');
  res.pierCoin = await p.evaluate(() => window.__game.scene.getScene('Lorong').collectedCoinIds.has('pier-high'));
  // G2 return: rest cliff → back west over pier-1 and cliff-1 to the far bank
  await run(p, -1, 3740, 2000);
  const r1 = await hop(p, -1, 3560); await run(p, -1, 3500, 1500); const r2 = await hop(p, -1, 3330); const r3 = await hop(p, -1, 3110);
  res.returnWest = [r1, r2, r3];
  // E. rope bridge from the top treehouse deck to the ridge deck on the crown, then down
  await tp(p, 4470, 1026); res.ropeBridge = await run(p, 1, 4990, 6000); res.ropeBridge.trace = undefined;
  await p.screenshot({ path: `${out}/g-rope-bridge.png` });
  res.ropeDown = await run(p, 1, 5060, 4000); res.ropeDown.trace = undefined;
  // H. save round trip
  res.save = await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.writeSave?.(); const raw = JSON.parse(localStorage.getItem('denai-save-v14') || 'null'); return raw && { schema: raw.schemaVersion, layout: raw.layoutVersion, coins: raw.collectedCoinIds, cp: raw.checkpointId }; });
  res.errs = errs; await ctx.close();
  // touch: phone, hold → and tap Guna at the sawmill
  const pc = await b.newContext({ ...require('playwright').devices['iPhone 13 landscape'] }); await pc.addInitScript(CAPTURE);
  const pp = await pc.newPage(); await pp.goto('http://localhost:8790/app/addmath/denai/main.html'); await pp.waitForFunction(() => window.__game?.scene?.getScenes(true).length); await sleep(2000);
  await pp.locator('#start').tap(); await sleep(2500); await pp.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  const x0 = await pp.evaluate(() => window.__game.scene.getScene('Lorong').player.x);
  const hold = pp.locator('[data-hold="right"]'); await hold.dispatchEvent('pointerdown', { pointerId: 1 }); await sleep(500); await hold.dispatchEvent('pointerup', { pointerId: 1 }); await sleep(200);
  res.touchMoved = Math.round(await pp.evaluate(() => window.__game.scene.getScene('Lorong').player.x) - x0);
  await pp.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.player.body.reset(3060, 1211); }); await sleep(900);
  await pp.locator('[data-action="interact"]').tap(); await sleep(400);
  res.touchMill = await pp.evaluate(() => window.__game.scene.getScene('Lorong').sawmill.b);
  await pp.screenshot({ path: `${out}/g-phone-sawmill.png` });
  await pc.close(); await b.close();
  console.log(JSON.stringify(res, null, 1));
})();
