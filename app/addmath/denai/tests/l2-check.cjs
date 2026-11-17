// Level 1-2 (World 1 V3) checks beyond the keyboard playthrough:
// A. migration of previous-course 1-2 runs (final station solved / only the
//    first one) ; B. replay resets the workshop, keeps completions;
// C. phone (touch "Guna"): demo run, swap on the upper deck, success, in
//    landscape and portrait screenshots.
// Usage: node tests/l2-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium, devices } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const S = "window.__game.scene.getScene('Jambatan')";
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const solved = { input: 2, order: 'gf', revision: 4, receivers: { fg: true, gf: true }, last: null, route: null, history: {}, drives: {} };
const open0 = { input: 2, order: 'fg', revision: 0, receivers: { fg: false, gf: false }, last: null, route: null, history: {}, drives: {} };
const OLD_RUN = (twins, final, cp) => JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 0, completedRuns: [], coins: ['l2-coin-1'], secrets: [], bestMs: null, run: { id: 'old-l2-run', checkpointId: cp, coins: ['l2-coin-1'], secrets: [], puzzles: { twins, final }, elapsedMs: 90000, completed: false } } } });
async function open(b, opts, seed) {
  const ctx = await b.newContext(opts); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  await p.evaluate((seed) => { localStorage.clear(); for (const [k, v] of Object.entries(seed || {})) localStorage.setItem(k, v); }, seed); await p.reload(); await ready(p); await sleep(700);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap(); await sleep(200); }
  return { ctx, p, errs };
}
const play = async (p) => { await p.evaluate(() => document.getElementById('play-main').click()); await p.waitForFunction(() => window.__game.scene.getScene('Jambatan')?.mode === 'playing', null, { timeout: 15000 }); await sleep(900); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); };
const tp = (p, x, feet) => p.evaluate(`(() => { const s = ${S}; s.player.body.reset(${x}, ${feet} - 31); s.player.body.setVelocity(0, 0); })()`);
const state = (p) => p.evaluate(`({ w: { ...${S}.run.workshop }, cp: ${S}.run.checkpointId, bridge: !!${S}.workshop.bridgeArt, coins: [...${S}.run.coins] })`);
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] }); const res = {};
  const desk = { viewport: { width: 1280, height: 720 } };
  // A1. Previous course, final station solved → workshop delivered, bridge stands, checkpoint kept.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': OLD_RUN(solved, solved, 'exit') });
    await play(p); res.migratedDone = { ...(await state(p)), errs };
    // the finish works straight away
    await tp(p, 4698, 1188); await sleep(2500); res.migratedFinish = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, store: JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].completions }));
    // B. Replay resets the workshop, keeps completions and coins
    await p.evaluate(() => document.getElementById('lv-replay').click()); await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
    res.replay = { ...(await state(p)), completions: await p.evaluate(() => JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].completions), lifetimeCoins: await p.evaluate(() => JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].coins) };
    await ctx.close(); }
  // A2. Previous course, only the first station → fresh workshop, checkpoint and coin kept.
  { const { ctx, p, errs } = await open(b, desk, { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': OLD_RUN(solved, open0, 'secret-bank') });
    await play(p); res.migratedOpen = { ...(await state(p)), errs }; await ctx.close(); }
  // C. Phone, touch only.
  for (const [name, dev] of [['landskap', devices['iPhone 13 landscape']], ['potret', devices['iPhone 13']]]) {
    const { ctx, p, errs } = await open(b, { ...dev }, { 'denai-profile-v1': PROFILE });
    await play(p); const guna = async () => { await p.locator('[data-action="interact"]').tap(); await sleep(300); };
    await tp(p, 3440, 1242); await sleep(1000); await p.screenshot({ path: `${out}/telefon-${name}-1-bengkel.png` });
    await V4.closeDialogue(p, { tap: true }); // V4: discovery dialogue (touch buttons return after it)
    const visible = await p.isVisible('[data-action="interact"]');
    await guna(); await sleep(3400); await p.screenshot({ path: `${out}/telefon-${name}-2-hasil6.png` });
    await tp(p, 3214, 1026); await sleep(900); await guna(); await sleep(700); await p.screenshot({ path: `${out}/telefon-${name}-3-tukar.png` });
    await tp(p, 3440, 1242); await sleep(900); await guna(); await sleep(3600); await p.screenshot({ path: `${out}/telefon-${name}-4-jambatan.png` });
    await V4.closeDialogue(p, { tap: true, wait: 2500 });
    res[`phone_${name}`] = { gunaVisible: visible, ...(await state(p)), tracker: await p.evaluate(() => { const r = document.getElementById('quest-pin').getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.right), Math.round(r.bottom), innerWidth, innerHeight]; }), errs };
    await ctx.close();
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
