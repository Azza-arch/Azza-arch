// Level 1-3 (World 1 V3) full playthrough with real keyboard input only:
// stream + ruins (platforming) → machine yard: flooded channel discovered →
// torn note → valve 3 → flow: reading 9 (too low, gate lifts a little) →
// deliberate fall into the flood (respawn keeps the valve) → reload + continue
// keeps it → valve 6 → reading 15 (too high, safety valve sprays) → wheel wraps
// 0 … 5 → reading 13: gate lifts, water drops, stones emerge → hop across the
// stones (collision sampled) → arch walk: cave plate 4 → wrong → plate 6 →
// chest opens, 2 coins + secret → gate court → automatic finish → reload.
// Usage: node tests/l3-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const S = "window.__game.scene.getScene('GerbangSongsang')";
const st = (p) => p.evaluate(`(() => { const s = ${S}, b = s.player.body; return { x: Math.round(s.player.x), bottom: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down, mode: s.mode, climbing: !!s.climbing }; })()`);
const sl = (p) => p.evaluate(`({ ...${S}.run.sluice, cave: { ...${S}.run.sluice.cave }, cp: ${S}.run.checkpointId, busy: ${S}.sluice.busy })`);
async function run(p, dir, toX, maxMs = 25000) {
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
async function settle(p, x) { for (let i = 0; i < 30; i++) { const s = await st(p); if (Math.abs(s.x - x) < 10) break; const k = s.x < x ? 'KeyD' : 'KeyA'; await p.keyboard.down(k); await sleep(40); await p.keyboard.up(k); await sleep(90); } return st(p); }
async function hop(p, dir, toX) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; await p.keyboard.down(key); await p.keyboard.press('Space'); let air = false; const t0 = Date.now();
  while (Date.now() - t0 < 2500) { const s = await st(p); if (!s.grounded) air = true; if (dir > 0 && s.x >= toX) await p.keyboard.up(key); if (air && s.grounded) break; await sleep(20); }
  await p.keyboard.up(key); await sleep(200); return st(p);
}
async function climbUp(p) { await p.keyboard.down('KeyW'); const t0 = Date.now(); let started = false; while (Date.now() - t0 < 8000) { const s = await st(p); if (s.climbing) started = true; if (started && !s.climbing) break; await sleep(30); } await p.keyboard.up('KeyW'); await sleep(250); return st(p); }
// Gaps on the ground route (edge of one ledge → start of the next).
const GAPS = [[648, 702], [1296, 1350], [1890, 1944], [2484, 2538], [4050, 4104]];
async function travel(p, toX) {
  for (const [edge, land] of GAPS) {
    const s = await st(p); if (s.x >= edge || edge >= toX) continue;
    await run(p, 1, edge - 70); await settle(p, edge - 22); await hop(p, 1, land + 30);
  }
  return run(p, 1, toX);
}
const press = async (p, k = 'KeyE', wait = 350) => { await p.keyboard.press(k); await sleep(wait); };
const waitIdle = (p) => p.waitForFunction(() => !window.__game.scene.getScene('GerbangSongsang').sluice.busy, null, { timeout: 15000 });
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
const play = async (p) => { await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('GerbangSongsang')?.mode === 'playing', null, { timeout: 15000 }); await sleep(900); await p.evaluate(() => { document.querySelectorAll('dialog[open]').forEach((d) => d.close()); document.getElementById('game')?.focus?.(); }); };

(async () => {
  // W1_PROFILE_DIR (Fasa F): run in a persistent browser profile and keep its saves, so
  // l1 → l2 → l3 playthroughs chain into one real World 1 progression.
  const PERSIST = process.env.W1_PROFILE_DIR;
  const ctx = PERSIST ? await chromium.launchPersistentContext(PERSIST, { viewport: { width: 1280, height: 720 }, args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }) : await (await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] })).newContext({ viewport: { width: 1280, height: 720 } });
  const b = { close: () => (PERSIST ? ctx.close() : ctx.browser().close()) }; await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/net::|favicon/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  if (!PERSIST) { await p.evaluate(([pr, l2]) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); localStorage.setItem('denai-campaign-v1', l2); }, [PROFILE, L2DONE]); await p.reload(); await ready(p); } await sleep(800);
  const log = { mainLabel: await p.textContent('#play-main-sub') };
  await play(p); const t0 = Date.now();
  // 1. Stream, ruins, upper ruins → machine yard (ground route, jumps where needed).
  log.toYard = await travel(p, 2580); await sleep(1500);
  await p.screenshot({ path: `${out}/1-pintu-air-ditemui.png` });
  log.discovered = { dialogue: await V4.closeDialogue(p), tracker: await p.textContent('#qt-text'), w: await sl(p) };
  // 2. Torn maintenance note.
  await run(p, 1, 2730); await settle(p, 2760); await press(p); await p.screenshot({ path: `${out}/2-catatan.png` }); log.note = { dialogue: await V4.closeDialogue(p), noteRead: (await sl(p)).noteRead };
  // 3. Valve to 3, flow → 9 (too low).
  await settle(p, 2862); for (let i = 0; i < 3; i++) await press(p, 'KeyE', 500);
  log.valve3 = (await sl(p)).setting;
  await run(p, 1, 3040); await settle(p, 3060); await press(p, 'KeyE', 2300);
  await p.screenshot({ path: `${out}/3-bacaan-9-rendah.png` }); await waitIdle(p);
  log.low = { w: await sl(p), bubble: await p.evaluate(`${S}.bubble?.text`) };
  // 4. Deliberate fall into the flooded channel: respawn, valve kept.
  log.fall = await run(p, 1, 3330, 4000); await sleep(1600); log.afterFall = { at: await st(p), w: await sl(p) };
  // 5. Reload + continue keeps it.
  await p.evaluate(`${S}.writeSave()`); await p.reload(); await ready(p); await sleep(700); await play(p);
  log.afterReload = { at: await st(p), w: await sl(p) };
  // 6. Valve 6 → 15 (too high, spray).
  const s6 = await st(p); await run(p, s6.x < 2862 ? 1 : -1, 2862); await settle(p, 2862);
  for (let i = 0; i < 3; i++) await press(p, 'KeyE', 500);
  await run(p, 1, 3040); await settle(p, 3060); await press(p, 'KeyE', 2000);
  await p.screenshot({ path: `${out}/4-bacaan-15-tinggi.png` }); await waitIdle(p);
  log.high = { w: await sl(p), bubble: await p.evaluate(`${S}.bubble?.text`) };
  // 7. Wheel wraps 6 → 0 → … → 5; flow → 13: the sluice opens.
  await run(p, -1, 2880); await settle(p, 2862);
  await press(p, 'KeyE', 500); log.wrap = (await sl(p)).setting;
  for (let i = 0; i < 5; i++) await press(p, 'KeyE', 500);
  await p.screenshot({ path: `${out}/5-injap-5.png` });
  await run(p, 1, 3040); await settle(p, 3060); await press(p, 'KeyE', 2700);
  await p.screenshot({ path: `${out}/6-air-surut.png` }); await waitIdle(p); await sleep(1800);
  log.completion = await V4.closeDialogue(p, { wait: 4000 }); // V4: completion dialogue + stamp
  log.open = { w: await sl(p), tracker: await p.textContent('#qt-text'), waterY: await p.evaluate(`${S}.sluice.waterY`) };
  await sleep(1200); log.math = await V4.readMath(p);
  await p.screenshot({ path: `${out}/7-ringkasan.png` });
  // 8. Hop across the stones, sampling the feet.
  await run(p, 1, 3200); await settle(p, 3222);
  const feet = []; const sampler = setInterval(async () => { try { const s = await st(p); if (s.grounded && s.x > 3262 && s.x < 3434) feet.push(s.bottom); } catch {} }, 25);
  log.stone1 = await hop(p, 1, 3285); await settle(p, 3294); log.stone2 = await hop(p, 1, 3395); await settle(p, 3402); log.bank = await hop(p, 1, 3490);
  clearInterval(sampler); log.stoneFeet = { samples: feet.length, min: Math.min(...feet), max: Math.max(...feet) };
  await p.screenshot({ path: `${out}/8-batu-loncatan.png` });
  // 9. Waterfall bank → gate approach → ladder → arch walk (cave valve).
  log.toLadder = await travel(p, 4560); await settle(p, 4590); log.climb = await climbUp(p);
  await sleep(1200); log.afterClimb = (await sl(p)).cave.setting; // ladder lands on plate 3
  await settle(p, 4374 + 4 * 54 + 27); await sleep(800); log.plate4 = (await sl(p)).cave.setting;
  // Crossing plates 5–6 at speed changes nothing.
  await run(p, 1, 4770); log.walkedAcross = (await sl(p)).cave.setting; await settle(p, 4779); await press(p, 'KeyE', 1200);
  await p.screenshot({ path: `${out}/9-injap-gua-salah.png` }); await sleep(800);
  log.caveWrong = (await sl(p)).cave;
  await run(p, -1, 4740); await settle(p, 4374 + 6 * 54 + 27); await sleep(800); log.plate6 = (await sl(p)).cave.setting;
  await run(p, 1, 4770); await settle(p, 4779); await press(p, 'KeyE', 1400);
  log.caveSolved = (await sl(p)).cave;
  await run(p, -1, 4360); await settle(p, 4347); await sleep(400);
  await p.screenshot({ path: `${out}/10-peti-rahsia.png` });
  await press(p); log.secret = { dialogue: await V4.closeDialogue(p), secrets: await p.evaluate(`[...${S}.run.secrets]`) };
  log.coinsAfterCave = await p.evaluate(`${S}.run.coins.filter((id) => id === 'l3-coin-21' || id === 'l3-coin-22')`);
  // 10. Off the walk to the gate court → automatic finish.
  log.toGoal = await run(p, 1, 5292); await sleep(2600);
  log.finished = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, kicker: document.querySelector('#complete .victory-kicker').textContent, quote: document.getElementById('destination-reaction').textContent, store: JSON.parse(localStorage.getItem('denai-l3-campaign-v1')) }));
  log.finished.store = { completions: log.finished.store.completions, coins: log.finished.store.coins.length, secrets: log.finished.store.secrets };
  log.seconds = Math.round((Date.now() - t0) / 1000);
  await p.screenshot({ path: `${out}/11-tamat.png` });
  await p.reload(); await ready(p); await sleep(800); log.afterFinish = { main: await p.textContent('#play-main-sub') };
  log.errs = errs; console.log(JSON.stringify(log, null, 1)); await b.close();
})();
