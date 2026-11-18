// Day 07 · Level 1-3 vertical slice: Takungan Lama (optional cistern under the upper ruins).
// A. Main route: walking east over the hatch keeps the player on the ruin floor (no fall, no respawn).
// B. Optional branch: S on the hatch climbs down the shaft to the cistern floor; W climbs back up.
// C. AddMath: a wrong code is refused with f(code) shown and the grille stays solid; the right
//    code (inverse of the target, same machine as the sluice) opens it.
// D. Collectible: the Kristal Kapur is collected once, stays collected after a reload and after a
//    replay (permanent, denai-l3-campaign-v1 · artifacts); the puzzle session is not changed.
// E. Corrupt / legacy collectible data never crashes the level.
// F. Phones (iPhone 13 portrait, iPhone SE landscape): ↓ / ↑ prompts, touch buttons work.
// Usage: node tests/l3-cistern-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
// PlayFab is stubbed and its host blocked.
const { chromium, devices } = require('playwright');
const V4 = require('./v4-helpers.cjs');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
const BASE_SEED = { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': L2DONE };
const S = "window.__game.scene.getScene('GerbangSongsang')";
const fails = [], errors = [], res = {};
const expect = (ok, msg) => { if (!ok) fails.push(msg); };
const section = async (name, fn) => { try { await fn(); } catch (e) { fails.push(`${name}: ${String(e.message).split('\n')[0]}`); } };
async function open(b, dev, seed, tag) {
  const ctx = await b.newContext(dev); await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`)); p.on('console', (m) => { if (m.type() === 'error' && !/net::|favicon/.test(m.text())) errors.push(`${tag}: ${m.text()}`); });
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p);
  await p.evaluate((s) => { localStorage.clear(); for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, seed); await p.reload(); await ready(p); await sleep(700);
  if (await p.isVisible('.rotate-stay')) { await p.locator('.rotate-stay').tap().catch(() => {}); await sleep(200); }
  return { ctx, p };
}
const play = async (p) => { await p.evaluate(() => document.getElementById('play-main').click()); await p.waitForFunction(() => window.__game.scene.getScene('GerbangSongsang')?.mode === 'playing', null, { timeout: 15000 }); await sleep(1200); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close())); };
const st = (p) => p.evaluate(`(() => { const s = ${S}, b = s.player.body; return { x: Math.round(s.player.x), feet: Math.round(b.bottom), grounded: b.blocked.down || b.touching.down, climbing: !!s.climbing, cp: s.run.checkpointId, cistern: { ...s.run.sluice.cistern }, puzzle: JSON.stringify(s.run.sluice.puzzle), owned: [...s.ownedArtifacts], stored: JSON.parse(localStorage.getItem('denai-l3-campaign-v1') || '{}').artifacts }; })()`);
const tp = (p, x, feet) => p.evaluate(`(() => { const s = ${S}; s.player.body.reset(${x}, ${feet} - 31); s.player.body.setVelocity(0, 0); })()`);
const prompt = (p) => p.evaluate(() => { const w = document.getElementById('world-prompt'), k = document.getElementById('world-prompt-key'); return w.hidden ? null : { key: k.hidden ? null : k.textContent, text: document.getElementById('world-prompt-text').textContent }; });
const hold = async (p, key, until, ms = 9000) => { await p.keyboard.down(key); const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(until)) break; await sleep(60); } await p.keyboard.up(key); await sleep(300); };
async function walkTo(p, x) { const s0 = await st(p), key = x > s0.x ? 'KeyD' : 'KeyA'; await p.keyboard.down(key); const t0 = Date.now(); while (Date.now() - t0 < 6000) { const s = await st(p); if (key === 'KeyD' ? s.x >= x : s.x <= x) break; await sleep(25); } await p.keyboard.up(key); await sleep(250); return st(p); }
const press = async (p, k = 'KeyE', wait = 450) => { await p.keyboard.press(k); await sleep(wait); };
const waitIdle = (p) => p.waitForFunction(() => !window.__game.scene.getScene('GerbangSongsang').sluice.busy, null, { timeout: 10000 });
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const desk = { viewport: { width: 1280, height: 720 } };
  await section('A–E desktop', async () => {
    const { ctx, p } = await open(b, desk, BASE_SEED, 'desktop'); await play(p);
    // A. main route over the hatch
    await tp(p, 1998, 1674); await sleep(500); const a = await walkTo(p, 2470);
    res.mainRoute = a; expect(a.feet === 1674 && a.cp === 'ruins' && !a.climbing, 'A: walking over the hatch stays on the ruin floor');
    await p.screenshot({ path: `${out}/1-laluan-utama-palka.png` });
    // B. down the shaft
    await tp(p, 2133, 1674); await sleep(600); res.hatchPrompt = await prompt(p);
    expect(res.hatchPrompt?.key === 'S' && /Takungan/.test(res.hatchPrompt?.text), 'B: hatch prompt shows S · Turun ke Takungan Lama');
    await p.screenshot({ path: `${out}/2-palka-gesaan.png` });
    await hold(p, 'KeyS', `(() => { const s = ${S}; return !s.climbing && s.player.body.bottom > 2040; })()`);
    res.down = await st(p); expect(res.down.feet === 2052 && res.down.cp === 'ruins', 'B: reached the cistern floor without a respawn');
    res.upPrompt = await prompt(p); expect(res.upPrompt?.key === 'W' && /Naik/.test(res.upPrompt?.text), 'B: ladder foot shows W · Naik ke runtuhan');
    await p.screenshot({ path: `${out}/3-bilik-takungan.png` });
    // C. wrong code → refused, grille still solid
    const puzzleBefore = res.down.puzzle;
    await walkTo(p, 2214); res.dialPrompt = await prompt(p);
    expect(/Pusing kod \(kini 0\)/.test(res.dialPrompt?.text || '') && res.dialPrompt?.key === 'E', 'C: dial prompt');
    await press(p); // code 1
    await walkTo(p, 2268); await press(p, 'KeyE', 300); await waitIdle(p);
    res.wrong = { bubble: await p.evaluate(`${S}.bubble?.text || ''`), s: await st(p) };
    expect(/f\(1\) = 5, bukan 9/.test(res.wrong.bubble) && !res.wrong.s.cistern.solved, 'C: wrong code refused with f(code) shown');
    await p.screenshot({ path: `${out}/4-kod-salah.png` });
    const blocked = await walkTo(p, 2420); expect(blocked.x < 2322, 'C: grille blocks the way while locked');
    // right code (base puzzle: f(x) = 2x + 3, f(3) = 9)
    await walkTo(p, 2214); await press(p); await press(p); // 1 → 3
    await walkTo(p, 2268); await press(p, 'KeyE', 300); await waitIdle(p);
    res.right = { bubble: await p.evaluate(`${S}.bubble?.text || ''`), s: await st(p) };
    expect(res.right.s.cistern.solved && /f\(3\) = 9 ✓/.test(res.right.bubble), 'C: right code opens the grille');
    expect(res.right.s.puzzle === puzzleBefore, 'C: the puzzle session is unchanged by the cistern');
    await p.screenshot({ path: `${out}/5-jeriji-terbuka.png` });
    // D. collect once
    await sleep(500); await walkTo(p, 2420); await sleep(400);
    res.collected = await st(p); expect(res.collected.owned.includes('kristal-kapur') && JSON.stringify(res.collected.stored) === '["kristal-kapur"]', 'D: Kristal Kapur collected and stored');
    await p.screenshot({ path: `${out}/6-kristal-dikutip.png` });
    await walkTo(p, 2300); await walkTo(p, 2420); res.again = await st(p);
    expect(JSON.stringify(res.again.stored) === '["kristal-kapur"]', 'D: not collected twice');
    await V4.openJournal(p); res.journalColl = await p.textContent('#qt-coll'); await p.screenshot({ path: `${out}/7-jurnal-artifak.png` }); await V4.closeJournal(p);
    expect(/Artifak 1\/1/.test(res.journalColl), 'D: Journal shows Artifak 1/1');
    // B. back up to the main route
    await walkTo(p, 2133); await hold(p, 'KeyW', `(() => { const s = ${S}; return !s.climbing && s.player.body.bottom < 1680; })()`);
    res.up = await st(p); expect(res.up.feet === 1674 && res.up.x > 2100 && res.up.x < 2170, 'B: climbed back to the hatch on the main route');
    const cont = await walkTo(p, 2470); expect(cont.feet === 1674, 'B: main route continues after returning');
    await p.screenshot({ path: `${out}/8-kembali-laluan-utama.png` });
    // D. reload → still collected; cistern state kept in the run
    await p.reload(); await ready(p); await sleep(600); await play(p);
    res.reload = await st(p); expect(res.reload.owned.includes('kristal-kapur') && res.reload.cistern.solved, 'D: collected + grille open after reload');
    res.crystalAlpha = await p.evaluate(`${S}.sluice.crystal.alpha`); expect(res.crystalAlpha < 0.5, 'D: crystal shows as already collected');
    // D. replay → new run and new puzzle session, the artifact stays in the collection
    await p.evaluate(`${S}.scene.restart({ fresh: true })`); await sleep(500); { const t0 = Date.now(); while (Date.now() - t0 < 15000 && !(await p.evaluate(`${S}?.mode === 'playing' && !!${S}.player`))) await sleep(100); } await sleep(1200);
    res.replay = await st(p); expect(res.replay.owned.includes('kristal-kapur') && !res.replay.cistern.solved && res.replay.puzzle !== res.reload.puzzle, 'D: replay keeps the artifact, resets the cistern, new puzzle');
    res.replayPlate = await p.evaluate(`${S}.children.list.filter((o) => o.type === 'Text' && /TAKUNGAN LAMA/.test(o.text)).map((o) => o.text)[0]`);
    const m = await p.evaluate(`(() => { const st = ${S}.run.sluice.puzzle.params; return st; })()`);
    expect(res.replayPlate && res.replayPlate.includes(`f(x) = ${m.rule.a}x`), 'D: plate shows the new session rule');
    await ctx.close();
  });
  await section('E corrupt data', async () => {
    for (const [name, raw] of [['json-rosak', '{bad json'], ['artifacts-bukan-senarai', JSON.stringify({ schemaVersion: 1, artifacts: 'kristal-kapur' })], ['id-asing', JSON.stringify({ schemaVersion: 1, artifacts: ['bogus', 42, null] })], ['save-lama-tanpa-medan', JSON.stringify({ schemaVersion: 1, completions: 0, run: { id: 'r', checkpointId: 'entry', coins: [], secrets: [], sluice: { setting: 0 } } })]]) {
      const { ctx, p } = await open(b, desk, { ...BASE_SEED, 'denai-l3-campaign-v1': raw }, `rosak-${name}`); await play(p);
      const s = await st(p); res[`corrupt-${name}`] = { owned: s.owned, cistern: s.cistern };
      expect(s.owned.length === 0 && s.cistern.setting === 0 && !s.cistern.solved, `E: ${name} handled`);
      await ctx.close();
    }
  });
  await section('F phones', async () => {
    for (const [name, dev] of [['iphone-13-potret', devices['iPhone 13']], ['iphone-se-landskap', devices['iPhone SE landscape']]]) {
      const { ctx, p } = await open(b, dev, BASE_SEED, name); await play(p); const r = (res[name] = {});
      await tp(p, 2133, 1674); await sleep(800); r.hatch = await prompt(p);
      expect(r.hatch?.key === '↓', `F: ${name} hatch prompt shows ↓`);
      await p.screenshot({ path: `${out}/9-${name}-palka.png` });
      // Hold a touch button: pointerdown … pointerup on the button itself (what a finger sends).
      const holdBtn = async (sel, until) => { const btn = p.locator(sel); await btn.dispatchEvent('pointerdown', { pointerId: 1, bubbles: true });
        const t0 = Date.now(); while (Date.now() - t0 < 10000 && !(await p.evaluate(until))) await sleep(60); /* poll with evaluate: the page's CSP blocks string waitForFunction */ await btn.dispatchEvent('pointerup', { pointerId: 1, bubbles: true }); await sleep(400); };
      await holdBtn('[data-hold="down"]', `(() => { const s = ${S}; return !s.climbing && s.player.body.bottom > 2040; })()`);
      r.down = await st(p); expect(r.down.feet === 2052, `F: ${name} ↓ button climbs down`);
      await tp(p, 2214, 2052); await sleep(600); r.dial = await prompt(p);
      expect(r.dial?.key === 'Guna', `F: ${name} dial prompt shows Guna`);
      await p.locator('[data-action="interact"]').tap(); await sleep(500); r.code = (await st(p)).cistern.setting;
      expect(r.code === 1, `F: ${name} Guna turns the code dial`);
      await p.screenshot({ path: `${out}/9-${name}-bilik.png` });
      await tp(p, 2133, 2052); await sleep(500);
      await holdBtn('[data-hold="up"]', `(() => { const s = ${S}; return !s.climbing && s.player.body.bottom < 1680; })()`);
      r.up = await st(p); expect(r.up.feet === 1674, `F: ${name} ↑ button climbs back`);
      await ctx.close();
    }
  });
  await b.close();
  res.errors = errors; res.fails = fails;
  console.log(JSON.stringify(res, null, 1));
  if (fails.length || errors.length) { console.error('FAIL', fails, errors); process.exit(1); }
  console.log('PASS: Level 1-3 cistern slice — main route intact, optional branch, inverse code lock, permanent Kristal Kapur, corrupt data safe, phones.');
})().catch((e) => { console.error(e); console.log(JSON.stringify({ res, fails, errors }, null, 1)); process.exit(1); });
