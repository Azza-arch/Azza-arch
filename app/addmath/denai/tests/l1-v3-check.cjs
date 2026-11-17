// World 1 V3 · Level 1-1 checks beyond the keyboard playthrough:
// A. replay variants (K2, K3) with their own prices/budgets and refusals;
// B. migration of previous-course saves (bridge built / not built) and of
//    legacy achievements; C. replay resets the quest but keeps achievements;
// D. phone (touch "Guna" button) screenshots; E. hut/key close-up.
// Usage: node tests/l1-v3-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const L = (fn, arg) => [`(${fn})(window.__game.scene.getScene('Lorong'), ${JSON.stringify(arg ?? null)})`];
const ev = (p, fn, arg) => p.evaluate(...L(fn, arg));
const PROFILE = (achievements, completions = 1) => JSON.stringify({ schemaVersion: 1, createdAt: '2026-10-01T00:00:00.000Z', levels: { 'w1-l1': { completions, firstCompletedAt: '2026-10-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements, adventuresCompleted: completions, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const OLD_SAVE = (solved, cp) => JSON.stringify({ schemaVersion: 2, layoutVersion: 2, levelId: 'denai-bab1-functions-v14-slice', runId: 'old-run', runSeed: 1, missions: { lift: 'A' }, attempts: { lift: { wrong: 0, correct: 1 } }, eligible: false, explore: false, startedAt: '2026-11-01T00:00:00.000Z', checkpointId: cp, solvedGateIds: solved ? ['lift'] : [], cClues: [], collectedCoinIds: ['start-reward'], discoveredSecretIds: [], phase1Reviewed: solved, completed: false, bInput: solved ? 3 : null, bLastTrial: null, dialogue: { seen: [], pending: [] }, elapsedMs: 50000 });
async function open(b, opts, seed) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  await p.evaluate((seed) => { localStorage.clear(); for (const [k, v] of Object.entries(seed || {})) localStorage.setItem(k, v); }, seed); await p.reload(); await ready(p); await sleep(700);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  return { ctx, p, errs };
}
const play = async (p) => { const sub = await p.textContent('#play-main-sub'); if (/1-1/.test(sub)) await p.evaluate(() => document.getElementById('play-main').click()); else { await p.evaluate(() => document.getElementById('world-map-btn').click()); await sleep(400); await p.evaluate(() => document.querySelector('#wm-panel button[data-level="w1-l1"]').click()); } await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing'); await sleep(700); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); };
const teleport = (p, x, feet) => ev(p, (s, a) => { s.player.body.reset(a.x, a.feet - 31); s.player.body.setVelocity(0, 0); }, { x, feet });
const interact = async (p) => { await p.keyboard.press('KeyE'); await sleep(450); };
async function buyFlow(p, tries) { // key in hand: open the store and try each x in order
  await ev(p, (s) => { s.run.quest.key = true; s.run.quest.found = true; s.supply.key.destroy?.(); });
  await teleport(p, 2367, 1242); await sleep(700); await p.click('#game'); await interact(p); await sleep(400);
  const res = { receipt: await p.textContent('#sp-receipt'), tries: [] };
  for (const x of tries) {
    const cur = Number(await p.textContent('#sp-qty')); for (let i = cur; i < x; i++) await p.click('#sp-plus'); for (let i = cur; i > x; i--) await p.click('#sp-minus');
    await p.click('#sp-buy'); await sleep(200); res.tries.push({ x, total: await p.textContent('#sp-total'), msg: await p.textContent('#sp-msg') });
  }
  res.quest = await ev(p, (s) => ({ ...s.run.quest })); return res;
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  const desk = { viewport: { width: 1280, height: 720 } };
  // A. Replay variants: K1 last used → K2; then K3.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-profile-v1': PROFILE(['jejak-pertama']), 'denai-l1-last-variant': 'K1' });
    await play(p); res.K2 = await buyFlow(p, [6, 5]);
    await ctx.close(); res.K2.errs = errs; }
  { const { ctx, p, errs } = await open(b, desk, { 'denai-profile-v1': PROFILE(['jejak-pertama']), 'denai-l1-last-variant': 'K2' });
    await play(p); res.K3 = await buyFlow(p, [6, 4, 5]);
    await p.screenshot({ path: `${out}/variasi-K3.png` }); await ctx.close(); res.K3.errs = errs; }
  // B. Migration: old course, bridge already built → stays built; legacy achievements kept.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-profile-v1': PROFILE(['jejak-pertama', 'tepat-sekali', 'tiga-cara']), 'denai-save-v14': OLD_SAVE(true, 'cp-gate') });
    await play(p);
    res.migratedBuilt = await ev(p, (s) => ({ quest: { ...s.run.quest }, lift: s.solvedGates.has('lift'), body: !!s.gateBodies.lift, at: [Math.round(s.player.x), Math.round(s.player.body.bottom)], keyLeft: s.supply.key.active }));
    await ev(p, (s) => { s.solvedGates.add('lift'); s.elapsed = 151000; s.player.body.reset(5751, 1157); }); await sleep(3500);
    res.legacyAchievements = await p.evaluate(() => JSON.parse(localStorage.getItem('denai-profile-v1')).achievements);
    res.journalLegacy = await p.evaluate(() => { const l = []; document.querySelectorAll('#collection-achievements li,#complete li').forEach((x) => l.push(x.textContent)); return l; });
    // C. Replay from the World Map resets the quest, keeps the achievements.
    await p.evaluate(() => document.getElementById('complete').close()); await p.evaluate(() => window.__game.scene.getScene('Lorong').returnToMenu()); await sleep(1500);
    await p.click('#world-map-btn'); await sleep(400); await p.click('#wm-panel button[data-level="w1-l1"]'); await sleep(2500);
    await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
    res.replay = await ev(p, (s) => ({ quest: { ...s.run.quest }, lift: s.solvedGates.has('lift'), keyBack: s.supply.key.active, doorClosed: s.supply.door[0].visible, achievements: JSON.parse(localStorage.getItem('denai-profile-v1')).achievements }));
    res.migrationErrs = errs; await ctx.close(); }
  // B2. Old course, bridge NOT built → the new mission starts at discovery.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-save-v14': OLD_SAVE(false, 'cp-rise1') });
    await play(p); res.migratedOpen = await ev(p, (s) => ({ quest: { ...s.run.quest }, lift: s.solvedGates.has('lift'), at: [Math.round(s.player.x), Math.round(s.player.body.bottom)], coin: s.collectedCoinIds.has('start-reward') }));
    // E. hut + key close-up (desktop)
    await teleport(p, 1300, 1080); await sleep(900); await ev(p, (s) => { const c = s.cameras.main; c.stopFollow(); c.centerOn(1404, 1010); }); await sleep(300);
    await p.screenshot({ path: `${out}/pondok-kunci.png` }); res.migratedErrs = errs; await ctx.close(); }
  // D. Phone (landscape, touch): discovery, locked door, store, repair.
  { const { ctx, p, errs } = await open(b, { ...devices['iPhone 13 landscape'] }, {});
    await play(p); const tapGuna = async () => { await p.locator('[data-action="interact"]').tap(); await sleep(500); };
    await teleport(p, 2470, 1242); await sleep(1200); await p.screenshot({ path: `${out}/telefon-1-jambatan.png` });
    res.phoneDiscovery = await V4.closeDialogue(p, { tap: true }); // V4: discovery dialogue, closed by tapping it
    await teleport(p, 2367, 1242); await sleep(800); await tapGuna(); await p.screenshot({ path: `${out}/telefon-2-berkunci.png` });
    await ev(p, (s) => { s.run.quest.key = true; s.supply.key.destroy(); }); await tapGuna(); await sleep(400);
    for (let i = 1; i < 5; i++) await p.locator('#sp-plus').tap();
    await p.screenshot({ path: `${out}/telefon-3-stor.png` }); await p.locator('#sp-buy').tap(); await sleep(300);
    await p.screenshot({ path: `${out}/telefon-4-dibeli.png` });
    await teleport(p, 2500, 1242); await sleep(900); await tapGuna(); await sleep(1800);
    await p.screenshot({ path: `${out}/telefon-5-siap.png` }); res.phoneCompletion = await V4.closeDialogue(p, { tap: true, wait: 2500 });
    res.phone = { quest: await ev(p, (s) => ({ ...s.run.quest })), lift: await ev(p, (s) => s.solvedGates.has('lift')), trackerBox: await p.evaluate(() => { const r = document.getElementById('quest-pin').getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), innerWidth, innerHeight]; }), errs };
    await ctx.close(); }
  // F. Ladder top: release W a few px before the top → steps onto the arch (no hang).
  { const { ctx, p, errs } = await open(b, desk, {});
    await play(p); await teleport(p, 1215, 1404); await sleep(600); await p.click('#game');
    await p.keyboard.down('KeyW'); const t0 = Date.now();
    while (Date.now() - t0 < 6000) { const b2 = await ev(p, (s) => Math.round(s.player.body.bottom)); if (b2 <= 1084) break; await sleep(15); }
    await p.keyboard.up('KeyW'); const atRelease = await ev(p, (s) => ({ bottom: Math.round(s.player.body.bottom), climbing: !!s.climbing })); await sleep(400);
    const after = await ev(p, (s) => ({ bottom: Math.round(s.player.body.bottom), climbing: !!s.climbing, grounded: s.player.body.blocked.down || s.player.body.touching.down }));
    await p.keyboard.down('KeyD'); await sleep(500); await p.keyboard.up('KeyD'); const moved = await ev(p, (s) => Math.round(s.player.x));
    res.ladderTop = { atRelease, after, movedRightTo: moved, errs }; await ctx.close(); }
  // G. Store panel on phones: no overlap with pause / touch controls / tracker, fully on screen.
  res.storeLayout = {};
  for (const [name, dev] of [['landskap', devices['iPhone 13 landscape']], ['potret', devices['iPhone 13']], ['se-landskap', { viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true }]]) {
    const { ctx, p } = await open(b, dev, {}); await play(p);
    await ev(p, (s) => { Object.assign(s.run.quest, { found: true, key: true }); s.supply.key.destroy(); }); await teleport(p, 2367, 1242); await sleep(800);
    await p.locator('[data-action="interact"]').tap(); await sleep(600);
    res.storeLayout[name] = await p.evaluate(() => { const r = (id) => { const e = document.getElementById(id); if (!e || !e.offsetParent && getComputedStyle(e).position !== 'fixed') return null; const b = e.getBoundingClientRect(); return b.width ? b : null; };
      const hit = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom; const st = r('store-panel');
      const btns = [...document.querySelectorAll('#touch-controls button')].filter((x) => x.offsetParent).map((x) => x.getBoundingClientRect());
      return { store: st && [Math.round(st.left), Math.round(st.top), Math.round(st.right), Math.round(st.bottom)], onScreen: st && st.left >= 0 && st.top >= 0 && st.right <= innerWidth && st.bottom <= innerHeight, hitPause: hit(st, r('pause')), hitTouch: btns.some((b) => hit(st, b)), trackerHidden: !r('quest-tracker'), minButton: Math.min(...[...document.querySelectorAll('#store-panel button')].map((x) => x.getBoundingClientRect().height)) }; });
    await p.screenshot({ path: `${out}/stor-${name}.png` }); await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
