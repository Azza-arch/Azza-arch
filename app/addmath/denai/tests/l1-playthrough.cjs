// Level 1-1 (World 1 V3) full playthrough with real keyboard input only:
// damaged bridge → locked store → ladder to the old hut → key → reload/continue
// keeps the key → shortcut drop → open store → two refused purchases (no money
// lost) → buy 5 → fall into the gap (respawn keeps the planks) → install planks
// → cross (collision sampled) → Tebing Berliku hops → automatic finish → reload.
// Usage: node tests/l1-playthrough.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const st = (p) => p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'), b = s.player.body; return { x: Math.round(s.player.x), bottom: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down, mode: s.mode, climbing: !!s.climbing }; });
const quest = (p) => p.evaluate(() => ({ ...window.__game.scene.getScene('Lorong').run.quest }));
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
async function settle(p, x) { for (let i = 0; i < 20; i++) { const s = await st(p); if (Math.abs(s.x - x) < 14) break; const k = s.x < x ? 'KeyD' : 'KeyA'; await p.keyboard.down(k); await sleep(45); await p.keyboard.up(k); await sleep(90); } return st(p); }
async function hop(p, dir, toX) {
  const key = dir > 0 ? 'KeyD' : 'KeyA'; await p.keyboard.down(key); await p.keyboard.press('Space'); let air = false; const t0 = Date.now();
  while (Date.now() - t0 < 2500) { const s = await st(p); if (!s.grounded) air = true; if (dir > 0 && s.x >= toX) await p.keyboard.up(key); if (air && s.grounded) break; await sleep(20); }
  await p.keyboard.up(key); await sleep(150); return st(p);
}
// Hold W until the ladder lets go at the top (it releases only while W is still held).
async function climbUp(p, topFeet) { await p.keyboard.down('KeyW'); const t0 = Date.now(); while (Date.now() - t0 < 6000) { const s = await st(p); if (!s.climbing && s.bottom <= topFeet + 2) break; await sleep(30); } await p.keyboard.up('KeyW'); await sleep(200); return st(p); }
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });

(async () => {
  // W1_PROFILE_DIR (Fasa F): run in a persistent browser profile and keep its saves, so
  // l1 → l2 → l3 playthroughs chain into one real World 1 progression.
  const PERSIST = process.env.W1_PROFILE_DIR;
  const ctx = PERSIST ? await chromium.launchPersistentContext(PERSIST, { viewport: { width: 1280, height: 720 }, args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }) : await (await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] })).newContext({ viewport: { width: 1280, height: 720 } });
  const b = { close: () => (PERSIST ? ctx.close() : ctx.browser().close()) }; await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/net::|favicon/.test(m.text())) errs.push(m.text()); });
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p); if (!PERSIST) { await p.evaluate(() => localStorage.clear()); await p.reload(); await ready(p); } await sleep(1000);
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing'); await p.click('#game');
  const t0 = Date.now(), log = {};
  // 1. Explore to the bridge: the mission appears only there.
  log.beforeBridge = (await quest(p)).found;
  log.toBridge = await run(p, 1, 2470); await sleep(900);
  await p.screenshot({ path: `${out}/1-jambatan-rosak.png` }); // V4: discovery dialogue
  log.discovery = await V4.closeDialogue(p);
  log.found = { quest: (await quest(p)).found, tracker: await p.textContent('#qt-text'), pin: await p.textContent('#quest-pin-text') };
  // 2. Locked store.
  await run(p, -1, 2380); await settle(p, 2367); await p.keyboard.press('KeyE'); await sleep(500);
  log.locked = { doorTried: (await quest(p)).doorTried, door: (await quest(p)).door, tracker: await p.textContent('#qt-text') };
  await p.screenshot({ path: `${out}/2-stor-berkunci.png` });
  // 3. Hint ladder (optional help, 3 levels).
  log.hints = await V4.readHints(p, 3); // V4: hints live in the Journal
  // 4. Back west, down to the root lane, up the root ladder, along the arch to the hut.
  log.toLadder = await run(p, -1, 1240); await settle(p, 1215);
  log.climb = await climbUp(p, 1080);
  log.toKey = await run(p, 1, 1435); await sleep(300);
  log.key = (await quest(p)).key;
  if (!log.key) throw new Error('key not collected on the first visit: ' + JSON.stringify(await st(p)));
  await p.screenshot({ path: `${out}/3-jumpa-kunci.png` });
  // 5. Reload + continue: the key must survive.
  await p.evaluate(() => window.__game.scene.getScene('Lorong').writeSave()); await p.reload(); await ready(p); await sleep(800);
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing'); await p.click('#game'); await sleep(500);
  log.afterReload = { key: (await quest(p)).key, keySprite: await p.evaluate(() => window.__game.scene.getScene('Lorong').supply.key.active), at: await st(p) };
  // From the restored checkpoint, take the arch again and use the shortcut drop.
  const s0 = await st(p);
  if (s0.x > 1300) { await run(p, -1, 1240); await settle(p, 1215); }
  else { await run(p, 1, 1240); await settle(p, 1215); }
  await climbUp(p, 1080); log.shortcutRun = await run(p, 1, 1700); await sleep(300);
  log.shortcut = (await quest(p)).shortcut;
  log.toDoor = await run(p, 1, 2350); await settle(p, 2367);
  await p.keyboard.press('KeyE'); await sleep(800);
  log.opened = { door: (await quest(p)).door, panel: await p.isVisible('#store-panel'), receipt: await p.textContent('#sp-receipt') };
  // 6. Purchases: 4 planks (too few), 7 planks (over budget), then 5 with E.
  const set = async (n) => { const cur = Number(await p.textContent('#sp-qty')); for (let i = cur; i < n; i++) await p.click('#sp-plus'); for (let i = cur; i > n; i--) await p.click('#sp-minus'); };
  await set(4); log.total4 = await p.textContent('#sp-total'); await p.click('#sp-buy'); await sleep(200); log.buy4 = { msg: await p.textContent('#sp-msg'), bought: (await quest(p)).bought };
  await set(7); log.total7 = await p.textContent('#sp-total'); await p.click('#sp-buy'); await sleep(200); log.buy7 = { msg: await p.textContent('#sp-msg'), bought: (await quest(p)).bought };
  await set(5); log.total5 = await p.textContent('#sp-total'); await p.screenshot({ path: `${out}/4-pembelian-sebelum.png` });
  await p.click('#game'); await p.keyboard.press('KeyE'); await sleep(400);
  log.buy5 = { msg: await p.textContent('#sp-msg'), quest: await quest(p), inv: await p.textContent('#qt-inv') };
  await p.screenshot({ path: `${out}/4-pembelian-papan.png` });
  // 7. Fall into the gap on purpose: respawn keeps the purchase.
  await sleep(1500); await run(p, 1, 2700, 6000); await sleep(1500);
  log.afterFall = { at: await st(p), planks: (await quest(p)).planks, bought: !!(await quest(p)).bought };
  // 8. Back to the bridge edge and install.
  const sf = await st(p); log.backToBridge = await run(p, sf.x < 2505 ? 1 : -1, 2505); await settle(p, 2500);
  await p.keyboard.press('KeyE'); await sleep(1800);
  await p.screenshot({ path: `${out}/5-jambatan-siap.png` }); // V4: completion dialogue
  log.completion = await V4.closeDialogue(p, { wait: 2500 });
  log.repaired = { quest: await quest(p), lift: await p.evaluate(() => window.__game.scene.getScene('Lorong').solvedGates.has('lift')), tracker: await p.textContent('#qt-text') };
  await sleep(1200); log.mathLine = await V4.readMath(p);
  // 9. Cross: sample the feet over the repaired deck.
  await p.keyboard.down('KeyD'); const samples = []; const tc = Date.now();
  while (Date.now() - tc < 6000) { const s = await st(p); if (s.x > 2560 && s.x < 2840) samples.push(s.bottom); if (s.x >= 3090) break; await sleep(25); }
  await p.keyboard.up('KeyD'); await sleep(200);
  log.cross = { samples: samples.length, minFeet: Math.min(...samples), maxFeet: Math.max(...samples), at: await st(p) };
  // 10. Tebing Berliku hops and the finish (unchanged level section).
  log.hops = [];
  for (const [edge, target] of [[3090, 3300], [3370, 3555], [3590, 3790], [3860, 4050], [4095, 4290]]) { await run(p, 1, edge, 4000); log.hops.push(await hop(p, 1, target)); }
  log.toGoal = await run(p, 1, 5745); await sleep(2500);
  log.finished = await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); return { mode: s.mode, completed: s.levelCompleted, panel: document.getElementById('complete').open, achievements: JSON.parse(localStorage.getItem('denai-profile-v1')).achievements, best: JSON.parse(localStorage.getItem('denai-profile-v1')).levels['w1-l1'].best }; });
  log.seconds = Math.round((Date.now() - t0) / 1000);
  log.dialogues = await V4.dialogLog(p);
  await p.screenshot({ path: `${out}/6-tamat.png` });
  await p.reload(); await ready(p); await sleep(1000);
  log.afterFinishReload = { main: await p.textContent('#play-main'), quest: await p.evaluate(() => JSON.parse(localStorage.getItem('denai-save-v14')).quest) };
  log.errs = errs; console.log(JSON.stringify(log, null, 1)); await b.close();
})();
