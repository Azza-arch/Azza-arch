// Day 04 · browser check: a seeded puzzle variant keeps its numbers across a
// page reload in all three levels, and the numbers on screen are the session's.
// Usage: node tests/puzzle-reload-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
// PlayFab is stubbed and its host blocked (no network writes).
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const URL = 'http://denai.test:8790/app/addmath/denai/main.html';
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = (completions) => JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: completions, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
// Texts drawn in a Phaser scene that match a pattern (what the player reads).
const texts = (p, key, re) => p.evaluate(([k, src]) => { const r = new RegExp(src); const all = []; const walk = (list) => list.forEach((o) => { if (o.type === 'Text') all.push(o); if (o.list) walk(o.list); }); walk(window.__game.scene.getScene(k).children.list); return all.filter((o) => r.test(o.text)).map((o) => o.text); }, [key, re]);
const startScene = (p, key, data) => p.evaluate(([k, d]) => { document.querySelectorAll('dialog[open]').forEach((x) => x.close()); window.__game.scene.getScene('Lorong').scene.start(k, d); }, [key, data]);
const waitPlaying = (p, key) => p.waitForFunction((k) => window.__game.scene.getScene(k)?.mode === 'playing' && window.__game.scene.getScene(k).run, key, { timeout: 15000 });

(async () => {
  const browser = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error' && !/net::|favicon/.test(m.text())) errs.push(m.text()); });
  const reload = async () => { await p.reload(); await ready(p); await sleep(600); };
  await p.goto(URL); await ready(p);
  await p.evaluate(([pr, l2]) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); localStorage.setItem('denai-campaign-v1', l2); localStorage.setItem('denai-l1-last-variant', 'K3'); }, [PROFILE(2), L2DONE]);
  await reload();
  const res = {}; const fails = [];
  const expect = (ok, msg) => { if (!ok) fails.push(msg); };

  // ── 1-2: replay → generated machines; reload → same machines on the plates.
  await startScene(p, 'Jambatan', { fresh: true }); await waitPlaying(p, 'Jambatan'); await sleep(500);
  const w1 = await p.evaluate(() => { const s = window.__game.scene.getScene('Jambatan'); s.run.workshop.runs = 1; s.writeSave(); return JSON.parse(JSON.stringify(s.run.workshop)); });
  const plates1 = await texts(p, 'Jambatan', '\\(x\\) =|Stok:');
  await p.screenshot({ path: `${out}/l2-variant.png` });
  await reload(); await startScene(p, 'Jambatan', {}); await waitPlaying(p, 'Jambatan'); await sleep(500);
  const w2 = await p.evaluate(() => JSON.parse(JSON.stringify(window.__game.scene.getScene('Jambatan').run.workshop)));
  const plates2 = await texts(p, 'Jambatan', '\\(x\\) =|Stok:');
  res.l2 = { session: w1.puzzle, plates: plates1, sameAfterReload: JSON.stringify(w1) === JSON.stringify(w2) && JSON.stringify(plates1) === JSON.stringify(plates2) };
  const P2 = w1.puzzle.params;
  expect(w1.puzzle.seed !== null, 'l2 replay has a seeded session');
  expect(res.l2.sameAfterReload, 'l2 session/plates change after reload');
  expect(plates1.some((t) => t.includes(`f(x) = ${P2.f.a}x`)) && plates1.some((t) => t.includes(`g(x) = x − ${-P2.g.b}`)) && plates1.includes(`Stok: ${P2.input} komponen`), 'l2 plates show the session numbers');
  expect(w2.runs === 1, 'l2 progress kept');

  // ── 1-3: replay → generated meter; reload → same meter mark, cave plate, setting.
  await startScene(p, 'GerbangSongsang', { fresh: true }); await waitPlaying(p, 'GerbangSongsang'); await sleep(500);
  const s1 = await p.evaluate(() => { const s = window.__game.scene.getScene('GerbangSongsang'); s.run.sluice.setting = 3; s.run.sluice.tests = 1; s.writeSave(); return JSON.parse(JSON.stringify(s.run.sluice)); });
  const marks1 = await texts(p, 'GerbangSongsang', 'TANDA ASAL|INJAP GUA');
  await reload(); await startScene(p, 'GerbangSongsang', {}); await waitPlaying(p, 'GerbangSongsang'); await sleep(500);
  const s2 = await p.evaluate(() => JSON.parse(JSON.stringify(window.__game.scene.getScene('GerbangSongsang').run.sluice)));
  const marks2 = await texts(p, 'GerbangSongsang', 'TANDA ASAL|INJAP GUA');
  res.l3 = { session: s1.puzzle, marks: marks1, sameAfterReload: JSON.stringify(s1) === JSON.stringify(s2) && JSON.stringify(marks1) === JSON.stringify(marks2) };
  expect(s1.puzzle.seed !== null, 'l3 replay has a seeded session');
  expect(res.l3.sameAfterReload, 'l3 session/marks change after reload');
  expect(marks1.includes(`TANDA ASAL ${s1.puzzle.params.target}`) && marks1.some((t) => t.endsWith(`perlu bacaan ${s1.puzzle.params.cave}`)), 'l3 meter/cave plate show the session numbers');
  expect(s2.setting === 3 && s2.tests === 1, 'l3 progress kept');

  // ── 1-1: a replay (profile has completions, last list K3) → a seeded price list;
  // the receipt shows it; a refused purchase, a reload and the store shows the same list.
  await p.evaluate(() => { document.querySelectorAll('dialog[open]').forEach((x) => x.close()); window.__game.scene.getScene('GerbangSongsang').scene.start('Lorong'); });
  await ready(p).catch(() => {}); await sleep(800);
  await p.evaluate(() => { localStorage.removeItem('denai-save-v14'); });
  await reload();
  const openStore = async () => {
    await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); if (!s.run) s.startRun(); else s.startRun(); document.querySelectorAll('dialog[open]').forEach((x) => x.close()); });
    await sleep(600);
    await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); Object.assign(s.run.quest, { found: true, key: true }); s.supply?.key?.destroy?.(); s.player.body.reset(2367, 1242 - 31); s.player.body.setVelocity(0, 0); });
    await sleep(700); await p.click('#game'); await p.keyboard.press('KeyE'); await sleep(700);
    return p.textContent('#sp-receipt');
  };
  const q1 = await p.evaluate(() => { const s = window.__game.scene.getScene('Lorong'); s.startRun(); return JSON.parse(JSON.stringify(s.run.quest)); });
  const receipt1 = await openStore();
  await p.click('#sp-minus'); await p.click('#sp-minus'); await p.click('#sp-minus'); await p.click('#sp-minus'); // x = 1 → refused (short)
  await p.click('#sp-buy'); await sleep(200); const refused = await p.textContent('#sp-msg');
  await p.screenshot({ path: `${out}/l1-variant-store.png` });
  await p.evaluate(() => window.__game.scene.getScene('Lorong').writeSave());
  await reload();
  await p.evaluate(() => { document.querySelectorAll('dialog[open]').forEach((x) => x.close()); window.__game.scene.getScene('Lorong').continueFromSave(); });
  await sleep(800);
  const q2 = await p.evaluate(() => JSON.parse(JSON.stringify(window.__game.scene.getScene('Lorong').run.quest)));
  const receipt2 = await openStore();
  const P1 = q1.puzzle.params;
  res.l1 = { session: q1.puzzle, receipt: receipt1, refused, sameAfterReload: JSON.stringify(q1.puzzle) === JSON.stringify(q2.puzzle) && receipt1 === receipt2 };
  expect(q1.puzzle.seed !== null, 'l1 replay has a seeded session');
  expect(receipt1.includes(`RM${P1.price} sebatang + RM${P1.delivery} hantaran`), 'l1 receipt shows the session numbers');
  expect(res.l1.sameAfterReload, 'l1 price list changes after reload');
  expect(/tak cukup/.test(refused), 'l1 refused purchase explains why');

  res.errors = errs; res.fails = fails;
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
  if (fails.length || errs.length) { console.error('FAIL', fails, errs); process.exit(1); }
  console.log('PASS: seeded variants in 1-1, 1-2, 1-3 keep their numbers across reload and show them on screen.');
})().catch((e) => { console.error(e); process.exit(1); });
