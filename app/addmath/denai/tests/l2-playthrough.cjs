// Level 1-2 (World 1 V3) full playthrough with real keyboard input only:
// river posts (platforming) → workshop → demonstration run (B first: 5→3→6,
// not enough, components return) → reload + continue keeps it → ladder to the
// upper deck → swap machine order → deliberate fall (respawn keeps state) →
// run again (A first: 5→10→8) → bridge built → cross (collision sampled) →
// automatic finish → reload.
// Usage: node tests/l2-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const S = "window.__game.scene.getScene('Jambatan')";
const st = (p) => p.evaluate(`(() => { const s = ${S}, b = s.player.body; return { x: Math.round(s.player.x), bottom: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down, mode: s.mode, climbing: !!s.climbing }; })()`);
const ws = (p) => p.evaluate(`({ ...${S}.run.workshop, cp: ${S}.run.checkpointId })`);
async function run(p, dir, toX, maxMs = 20000) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; let last = await st(p), lastT = Date.now(); const t0 = Date.now(); let respawns = 0, prevX = last.x;
  await p.keyboard.down(key);
  while (Date.now() - t0 < maxMs) {
    const s = await st(p); if ((dir > 0 && s.x >= toX) || (dir < 0 && s.x <= toX)) break;
    if (Math.abs(s.x - prevX) > 400) respawns++; prevX = s.x;
    if (Math.abs(s.x - last.x) > 3) { last = s; lastT = Date.now(); } else if (Date.now() - lastT > 160 && s.grounded) { await p.keyboard.press('Space'); lastT = Date.now(); }
    await sleep(30);
  }
  await p.keyboard.up(key); await sleep(250); return { ...(await st(p)), respawns };
}
async function settle(p, x) { for (let i = 0; i < 24; i++) { const s = await st(p); if (Math.abs(s.x - x) < 12) break; const k = s.x < x ? 'KeyD' : 'KeyA'; await p.keyboard.down(k); await sleep(45); await p.keyboard.up(k); await sleep(90); } return st(p); }
async function hop(p, dir, toX) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; await p.keyboard.down(key); await p.keyboard.press('Space'); let air = false; const t0 = Date.now();
  while (Date.now() - t0 < 2500) { const s = await st(p); if (!s.grounded) air = true; if (dir > 0 && s.x >= toX) await p.keyboard.up(key); if (air && s.grounded) break; await sleep(20); }
  await p.keyboard.up(key); await sleep(200); return st(p);
}
async function climbUp(p) { await p.keyboard.down('KeyW'); const t0 = Date.now(); let started = false; while (Date.now() - t0 < 6000) { const s = await st(p); if (s.climbing) started = true; if (started && !s.climbing) break; await sleep(30); } await p.keyboard.up('KeyW'); await sleep(250); return st(p); }
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });

(async () => {
  // W1_PROFILE_DIR (Fasa F): run in a persistent browser profile and keep its saves, so
  // l1 → l2 → l3 playthroughs chain into one real World 1 progression.
  const PERSIST = process.env.W1_PROFILE_DIR;
  const ctx = PERSIST ? await chromium.launchPersistentContext(PERSIST, { viewport: { width: 1280, height: 720 }, args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }) : await (await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] })).newContext({ viewport: { width: 1280, height: 720 } });
  const b = { close: () => (PERSIST ? ctx.close() : ctx.browser().close()) }; await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/net::|favicon/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  if (!PERSIST) { await p.evaluate((pr) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); }, PROFILE); await p.reload(); await ready(p); } await sleep(800);
  const log = { mainLabel: await p.textContent('#play-main-sub') };
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('Jambatan')?.mode === 'playing', null, { timeout: 15000 }); await sleep(800); await p.evaluate(() => document.getElementById('game')?.focus?.());
  const t0 = Date.now();
  // 1. Entry → garden → over the first gap → warehouse.
  // Run up short of each edge, then step to it: full-speed momentum under CPU load can carry the bot over.
  await run(p, 1, 900); log.toGap1 = await settle(p, 950); log.gap1 = await hop(p, 1, 1110);
  await run(p, 1, 1750); log.toPosts = await settle(p, 1815);
  await p.screenshot({ path: `${out}/1-batu-loncatan.png` });
  // 2. River posts: low post → high post → upper deck.
  log.post1 = await hop(p, 1, 1915); log.post2 = await hop(p, 1, 2060); log.deck = await hop(p, 1, 2200);
  // 3. On to the workshop (island and secret bank gaps).
  await run(p, 1, 2420); log.toGap3 = await settle(p, 2462); log.gap3 = await hop(p, 1, 2640);
  await run(p, 1, 2740); log.toGap4 = await settle(p, 2784); log.gap4 = await hop(p, 1, 2960);
  log.toYard = await run(p, 1, 3420); await sleep(800);
  log.introDialogue = await V4.closeDialogue(p); // V4: discovery dialogue
  log.intro = { tracker: await p.textContent('#qt-text'), pin: await p.textContent('#quest-pin-text'), w: await ws(p) };
  await settle(p, 3440); await p.screenshot({ path: `${out}/2-bengkel-ditemui.png` });
  // 4. Demonstration run (B first).
  await p.keyboard.press('KeyE'); await sleep(1100); await p.screenshot({ path: `${out}/3-larian-demo.png` }); await sleep(2600);
  log.demo = { w: await ws(p), counter: await p.evaluate(`${S}.workshop.counter.text`), tracker: await p.textContent('#qt-text'), bridge: await p.evaluate(`!!${S}.workshop.bridgeArt`) };
  await p.screenshot({ path: `${out}/4-hasil-6.png` });
  // 5. Reload + continue keeps the run.
  await p.evaluate(`${S}.writeSave()`); await p.reload(); await ready(p); await sleep(700);
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('Jambatan')?.mode === 'playing', null, { timeout: 15000 }); await sleep(800); await p.evaluate(() => document.getElementById('game')?.focus?.());
  log.afterReload = { w: await ws(p), at: await st(p) };
  // 6. Up to the order lever: back to the secret-bank ladder, canopy, upper deck.
  const s0 = await st(p); if (s0.x > 3060) { await run(p, -1, 3060); } await settle(p, 3024);
  log.climb = await climbUp(p);
  log.toCanopyEdge = await run(p, 1, 3112); log.toDeck = await hop(p, 1, 3214); await settle(p, 3214);
  await p.keyboard.press('KeyE'); await sleep(900);
  log.swapped = await ws(p); await p.screenshot({ path: `${out}/5-tukar-susunan.png` });
  // 7. Deliberate fall into the unbuilt gap: respawn keeps the new order.
  log.dropToRise = await run(p, 1, 3500); log.fall = await run(p, 1, 3960, 5000); await sleep(1500);
  log.afterFall = { at: await st(p), w: await ws(p) };
  // 8. Run again (A first) → 8 → bridge.
  const s1 = await st(p); await run(p, s1.x < 3440 ? 1 : -1, 3440); await settle(p, 3440);
  await p.keyboard.press('KeyE'); await sleep(1200); await p.screenshot({ path: `${out}/6-larian-betul.png` }); await sleep(2800);
  log.completion = await V4.closeDialogue(p, { wait: 3000 }); // V4: completion dialogue + stamp
  log.success = { w: await ws(p), counter: await p.evaluate(`${S}.workshop.counter.text`), tracker: await p.textContent('#qt-text') };
  await sleep(1200); log.math = await V4.readMath(p);
  await p.screenshot({ path: `${out}/7-jambatan-siap.png` });
  // 9. Cross the new bridge, sampling the feet.
  await p.keyboard.down('KeyD'); const samples = []; const tc = Date.now();
  while (Date.now() - tc < 8000) { const s = await st(p); if (s.x > 3910 && s.x < 4190) samples.push(s.bottom); if (s.x >= 4300) break; await sleep(25); }
  await p.keyboard.up('KeyD'); log.cross = { samples: samples.length, minFeet: Math.min(...samples), maxFeet: Math.max(...samples), at: await st(p) };
  // 10. Exit → automatic finish.
  log.toGoal = await run(p, 1, 4690); await sleep(2500);
  log.finished = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, kicker: document.querySelector('#complete .victory-kicker').textContent, quote: document.getElementById('destination-reaction').textContent, store: JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'] }));
  log.seconds = Math.round((Date.now() - t0) / 1000);
  await p.screenshot({ path: `${out}/8-tamat.png` });
  await p.reload(); await ready(p); await sleep(800); log.afterFinish = { main: await p.textContent('#play-main-sub') };
  log.errs = errs; console.log(JSON.stringify(log, null, 1)); await b.close();
})();
