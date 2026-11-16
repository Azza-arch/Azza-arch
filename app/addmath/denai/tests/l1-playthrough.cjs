// Level 1-1 complete playthrough after the Phase C redesign: keyboard movement, the real
// machine UI (one wrong output first, then the right one), the Tebing Berliku hops, the finish,
// then reload + Continue to check the save. Usage: node tests/l1-playthrough.cjs <outdir>
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const st = (p) => p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'), b = s.player.body; return { x: Math.round(s.player.x), bottom: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down, mode: s.mode }; });
async function run(p, dir, toX, maxMs = 20000) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; let last = await st(p), lastT = Date.now(); const t0 = Date.now(); let respawns = 0, prevX = last.x;
  await p.keyboard.down(key);
  while (Date.now() - t0 < maxMs) {
    const s = await st(p); if ((dir > 0 && s.x >= toX) || (dir < 0 && s.x <= toX)) break;
    if (Math.abs(s.x - prevX) > 400) respawns++; prevX = s.x;
    if (Math.abs(s.x - last.x) > 3) { last = s; lastT = Date.now(); } else if (Date.now() - lastT > 160 && s.grounded) { await p.keyboard.press('Space'); lastT = Date.now(); }
    await sleep(30);
  }
  await p.keyboard.up(key); await sleep(200); return { ...(await st(p)), respawns };
}
async function hop(p, dir, toX) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; await p.keyboard.down(key); await p.keyboard.press('Space'); let air = false; const t0 = Date.now();
  while (Date.now() - t0 < 2500) { const s = await st(p); if (!s.grounded) air = true; if ((dir > 0 && s.x >= toX)) await p.keyboard.up(key); if (air && s.grounded) break; await sleep(20); }
  await p.keyboard.up(key); await sleep(150); return st(p);
}
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1280, height: 760 } }); await ctx.addInitScript(HOOK);
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8790/app/addmath/denai/main.html'); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player); await p.evaluate(() => localStorage.clear()); await p.reload();
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player); await sleep(1500);
  await p.click('#start'); await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing'); await p.click('#game');
  const t0 = Date.now(), log = {};
  log.toMachine = await run(p, 1, 2470);
  await p.keyboard.press('KeyE'); await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'mechanism');
  const c = await p.evaluate(() => { const v = window.__game.scene.getScene('Lorong').mission; const outs = v.type === 'find-rule' ? v.options.map((r) => r.a * v.input + r.b) : [0, 1, 2, 3, 4].map((x) => v.rule.a * x + v.rule.b); return { short: outs.findIndex((x) => x > 0 && x < 7), right: outs.indexOf(7), outs, id: v.id }; });
  log.mission = c;
  await p.locator(`[data-token="${c.right}"]`).click(); await p.locator('#dial-test').click(); await p.locator('#puzzle-go').click();
  await p.waitForFunction(() => { const s = window.__game.scene.getScene('Lorong'); return s.solvedGates.has('lift') && s.mode === 'playing'; }, null, { timeout: 15000 });
  await sleep(1500); await p.click('#game');
  log.bridge = await run(p, 1, 3090);
  await p.screenshot({ path: `${out}/p-far-bank.png` });
  log.hops = [];
  for (const [edge, target] of [[3090, 3300], [3370, 3555], [3590, 3790], [3860, 4050], [4095, 4290]]) { await run(p, 1, edge, 4000); log.hops.push(await hop(p, 1, target)); }
  log.toGoal = await run(p, 1, 5745);
  for (let i = 0; i < 20; i++) { const s = await st(p); if (Math.abs(s.x - 5751) < 30 && s.bottom === 1188) break; await p.keyboard.down(s.x < 5751 ? 'KeyD' : 'KeyA'); await sleep(40); await p.keyboard.up('KeyD'); await p.keyboard.up('KeyA'); await sleep(80); }
  await sleep(400); await p.keyboard.press('KeyE'); await sleep(2500);
  log.finished = await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); return { mode: s.mode, completed: s.levelCompleted ?? null }; });
  log.seconds = Math.round((Date.now() - t0) / 1000);
  await p.screenshot({ path: `${out}/p-finish.png` });
  log.save = await p.evaluate(() => { const r = JSON.parse(localStorage.getItem('denai-save-v14') || 'null'); return r && { completed: r.completed, cp: r.checkpointId, gates: r.solvedGateIds, coins: r.collectedCoinIds.length }; });
  await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player); await sleep(1500);
  log.continueVisible = await p.isVisible('#continue-btn');
  log.errs = errs; console.log(JSON.stringify(log, null, 1)); await b.close();
})();
