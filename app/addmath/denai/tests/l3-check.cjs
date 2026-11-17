// Level 1-3 (World 1 V3) checks beyond the keyboard playthrough:
// A. migration of previous-course runs (3 seals lit / partial);
// B. replay resets the sluice, keeps completions and lifetime coins/secrets;
// C. hints (3 levels) and the tracker; D. reduced motion;
// E. phone (touch "Guna" only): landscape + portrait screenshots, layout overlap.
// Usage: node tests/l3-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const S = "window.__game.scene.getScene('GerbangSongsang')";
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
const seals = (on) => ({ version: 2, output: 15, seals: { 13: on, 7: on, 15: on }, revision: 9, steps: [], actuator: 6, demoSeen: true, applied: null });
const OLD = (on, cp) => JSON.stringify({ schemaVersion: 1, completions: 0, completedRuns: [], coins: ['l3-coin-3'], secrets: ['inverse-tablet'], bestMs: null, run: { id: 'old-l3', checkpointId: cp, coins: ['l3-coin-3'], secrets: ['inverse-tablet'], puzzle: seals(on), elapsedMs: 90000, completed: false } });
async function open(b, opts, seed) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  await p.evaluate((seed) => { localStorage.clear(); for (const [k, v] of Object.entries(seed || {})) localStorage.setItem(k, v); }, { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': L2DONE, ...seed }); await p.reload(); await ready(p); await sleep(700);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  return { ctx, p, errs };
}
const play = async (p) => { await p.evaluate(() => document.getElementById('play-main').click()); await p.waitForFunction(() => window.__game.scene.getScene('GerbangSongsang')?.mode === 'playing', null, { timeout: 15000 }); await sleep(900); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); };
const tp = (p, x, feet) => p.evaluate(`(() => { const s = ${S}; s.player.body.reset(${x}, ${feet} - 31); s.player.body.setVelocity(0, 0); })()`);
const state = (p) => p.evaluate(`({ s: { ...${S}.run.sluice, cave: { ...${S}.run.sluice.cave } }, cp: ${S}.run.checkpointId, stones: ${S}.sluice.stoneBodies.length, waterY: ${S}.sluice.waterY, coins: [...${S}.run.coins], secrets: [...${S}.run.secrets] })`);
const waitIdle = (p) => p.waitForFunction(() => !window.__game.scene.getScene('GerbangSongsang').sluice.busy, null, { timeout: 15000 });
const rect = (p, sel) => p.evaluate((sel) => { const e = document.querySelector(sel); if (!e || e.hidden || getComputedStyle(e).display === 'none') return null; const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom) }; }, sel);
const overlap = (a, b) => !!(a && b && a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b);
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  const desk = { viewport: { width: 1280, height: 720 } };
  // A1. Previous course, all three seals lit → the sluice is open, stones stand, checkpoint kept, finish works.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-l3-campaign-v1': OLD(true, 'far-bank') });
    await play(p); res.migratedDone = { ...(await state(p)), errs };
    await p.evaluate(`${S}.cameras.main.centerOn(3348, 1500)`); await p.screenshot({ path: `${out}/migrasi-pintu-terbuka.png` });
    await tp(p, 5292, 1566); await sleep(2600);
    res.migratedFinish = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, completions: JSON.parse(localStorage.getItem('denai-l3-campaign-v1')).completions }));
    // B. Replay from the victory card resets the sluice, keeps completions and lifetime coins/secrets.
    await p.evaluate(() => document.getElementById('lv-replay').click()); await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
    const L = await p.evaluate(() => JSON.parse(localStorage.getItem('denai-l3-campaign-v1')));
    res.replay = { ...(await state(p)), completions: L.completions, lifetimeCoins: L.coins, lifetimeSecrets: L.secrets };
    await ctx.close(); }
  // A2. Previous course, seals not all lit → fresh sluice; coin and earned secret kept; checkpoint falls back.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-l3-campaign-v1': OLD(false, 'machine') });
    await play(p); res.migratedOpen = { ...(await state(p)), errs }; await ctx.close(); }
  // C. Hints + tracker; wrong test shows a reading-specific hint.
  { const { ctx, p, errs } = await open(b, desk, {});
    await play(p); await tp(p, 2620, 1620); await sleep(900);
    const hints = []; for (let i = 0; i < 3; i++) { await p.click('#qt-hint'); hints.push(await p.textContent('#qt-hint-text')); }
    await p.screenshot({ path: `${out}/petunjuk-3.png` });
    await tp(p, 2862, 1620); await sleep(400); await p.keyboard.press('KeyE'); await sleep(500); // valve 1 → reading 5
    await tp(p, 3060, 1620); await sleep(400); await p.keyboard.press('KeyE'); await waitIdle(p);
    await p.click('#qt-hint'); const retry = await p.textContent('#qt-hint-text');
    res.hints = { hints, retry, inv: await p.textContent('#qt-inv'), errs }; await ctx.close(); }
  // D. Reduced motion: opening is instant, no spin, no errors.
  { const { ctx, p, errs } = await open(b, { ...desk, reducedMotion: 'reduce' }, {});
    await play(p); await tp(p, 2862, 1620); await sleep(400);
    for (let i = 0; i < 5; i++) { await p.keyboard.press('KeyE'); await sleep(150); }
    await tp(p, 3060, 1620); await sleep(400); await p.keyboard.press('KeyE'); await waitIdle(p); await sleep(300);
    res.reduced = { ...(await state(p)), coinsSpinning: await p.evaluate(`${S}.coinViews.filter((c) => c.art.anims?.isPlaying).length`), errs }; await ctx.close(); }
  // E. Phone, touch only.
  for (const [name, dev] of [['landskap', devices['iPhone 13 landscape']], ['potret', devices['iPhone 13']]]) {
    const { ctx, p, errs } = await open(b, { ...dev }, {});
    await play(p); const guna = async (w = 300) => { await p.locator('[data-action="interact"]').tap(); await sleep(w); };
    const layout = async () => { const tr = await rect(p, '#quest-tracker'), pause = await rect(p, '#pause'), wp = await rect(p, '#world-prompt'), btns = await p.evaluate(() => [...document.querySelectorAll('#touch-controls button')].filter((x) => x.offsetParent).map((x) => { const r = x.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; })); return { tracker: tr, trackerHitsPause: overlap(tr, pause), trackerHitsTouch: btns.some((x) => overlap(tr, x)), promptHitsTouch: btns.some((x) => overlap(wp, x)), viewport: await p.evaluate(() => [innerWidth, innerHeight]) }; };
    await tp(p, 2700, 1620); await sleep(1400); await p.screenshot({ path: `${out}/telefon-${name}-1-ditemui.png` });
    const l1 = await layout();
    await tp(p, 2862, 1620); await sleep(600); const gunaVisible = await p.isVisible('[data-action="interact"]');
    for (let i = 0; i < 3; i++) await guna(450);
    await tp(p, 3060, 1620); await sleep(500); await guna(2300); await p.screenshot({ path: `${out}/telefon-${name}-2-bacaan9.png` }); await waitIdle(p);
    const l2 = await layout();
    await tp(p, 2862, 1620); await sleep(500); await guna(450); await guna(450);
    await tp(p, 3060, 1620); await sleep(500); await guna(2600); await p.screenshot({ path: `${out}/telefon-${name}-3-air-surut.png` }); await waitIdle(p); await sleep(1500);
    await p.locator('#qt-math').tap(); await sleep(300); await p.screenshot({ path: `${out}/telefon-${name}-4-cara-kira.png` });
    await tp(p, 4374 + 6 * 54 + 27, 1242); await sleep(1300); await tp(p, 4779, 1242); await sleep(500); await guna(1500);
    await p.screenshot({ path: `${out}/telefon-${name}-5-injap-gua.png` });
    res[`phone_${name}`] = { gunaVisible, ...(await state(p)), layoutStart: l1, layoutAfterTest: l2, errs };
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
