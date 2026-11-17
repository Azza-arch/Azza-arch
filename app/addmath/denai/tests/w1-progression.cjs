// World 1 full progression (Fasa F).
// A. FRESH profile, one persistent browser profile, nothing seeded:
//    World Map statuses → l1-playthrough → map → l2-playthrough → map →
//    l3-playthrough → map + main menu ("Dunia 1 selesai") → replay 1-2 from the
//    World Map (mission reset, completions kept).
// B. EXISTING profile from the previous course (old saves for all three levels:
//    1-1 bridge built at cp-gate, legacy achievements; 1-2 final station solved
//    at the exit; 1-3 three seals lit at the far bank): map statuses, continue
//    each level from the World Map — the mandatory mission is already done,
//    survives respawn (R) and reload — and finish each level.
// Usage: node tests/w1-progression.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const out = path.resolve(process.argv[2] || '.');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = () => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const ARGS = ['--host-resolver-rules=MAP denai.test 127.0.0.1'];
const ready = (p) => p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
async function page(dir) {
  const ctx = await chromium.launchPersistentContext(dir, { viewport: { width: 1280, height: 720 }, args: ARGS });
  await ctx.addInitScript(HOOK); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = ctx.pages()[0] || await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html'); await ready(p); await sleep(600);
  return { ctx, p, errs };
}
const mapState = async (p) => {
  await p.evaluate(() => document.getElementById('world-map-btn').click()); await sleep(600);
  const r = await p.evaluate(() => [...document.querySelectorAll('.wm-level')].map((li) => ({ title: li.querySelector('.wm-title')?.textContent, chip: li.querySelector('.wm-chip')?.textContent, note: li.querySelector('.wm-note')?.textContent || '', actions: [...li.querySelectorAll('button[data-level]')].map((b) => `${b.dataset.level}:${b.dataset.mode}${b.disabled ? '(x)' : ''}`) })));
  return r;
};
const closeMap = (p) => p.evaluate(() => document.getElementById('wm-back').click());
const playthrough = (name, dir) => {
  const o = path.join(out, name); fs.mkdirSync(o, { recursive: true });
  const raw = execFileSync('node', [path.join(__dirname, `${name}.cjs`), o], { env: { ...process.env, W1_PROFILE_DIR: dir }, timeout: 600000 }).toString();
  return JSON.parse(raw);
};
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-10-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-10-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama', 'tepat-sekali', 'tiga-cara'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const OLD_L1 = JSON.stringify({ schemaVersion: 2, layoutVersion: 2, levelId: 'denai-bab1-functions-v14-slice', runId: 'old-run', runSeed: 1, missions: { lift: 'A' }, attempts: { lift: { wrong: 0, correct: 1 } }, eligible: false, explore: false, startedAt: '2026-11-01T00:00:00.000Z', checkpointId: 'cp-gate', solvedGateIds: ['lift'], cClues: [], collectedCoinIds: ['start-reward'], discoveredSecretIds: [], phase1Reviewed: true, completed: false, bInput: 3, bLastTrial: null, dialogue: { seen: [], pending: [] }, elapsedMs: 50000 });
const solved = { input: 2, order: 'gf', revision: 4, receivers: { fg: true, gf: true }, last: null, route: null, history: {}, drives: {} };
const OLD_L2 = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['old-done'], coins: ['l2-coin-1'], secrets: [], bestMs: 200000, run: { id: 'old-l2-run', checkpointId: 'exit', coins: ['l2-coin-1'], secrets: [], puzzles: { twins: solved, final: solved }, elapsedMs: 90000, completed: false } } } });
const OLD_L3 = JSON.stringify({ schemaVersion: 1, completions: 0, completedRuns: [], coins: ['l3-coin-3'], secrets: ['inverse-tablet'], bestMs: null, run: { id: 'old-l3', checkpointId: 'far-bank', coins: ['l3-coin-3'], secrets: ['inverse-tablet'], puzzle: { version: 2, output: 15, seals: { 13: true, 7: true, 15: true }, revision: 9, steps: [], actuator: 6, demoSeen: true, applied: null }, elapsedMs: 90000, completed: false } });
const MISSION = {
  Lorong: (s) => ({ repaired: !!s.run?.quest?.repaired, liftBody: !!s.gateBodies?.lift, cp: s.checkpointId ?? s.run?.checkpointId }),
  Jambatan: (s) => ({ delivered: !!s.run.workshop.delivered, bridge: !!s.workshop.bridgeArt, cp: s.run.checkpointId }),
  GerbangSongsang: (s) => ({ open: !!s.run.sluice.open, stones: s.sluice.stoneBodies.length, cp: s.run.checkpointId }),
};
const GOALS = { Lorong: [5751, 1188], Jambatan: [4698, 1188], GerbangSongsang: [5292, 1566] };
(async () => {
  const res = { A: {}, B: {} };
  // ── A. Fresh profile ──
  const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'denai-w1-a-'));
  { const { ctx, p, errs } = await page(dirA); res.A.mapFresh = await mapState(p); res.A.mainFresh = await p.textContent('#play-main-sub').catch(() => null); res.A.errs0 = errs; await ctx.close(); }
  const l1 = playthrough('l1-playthrough', dirA);
  res.A.l1 = { finished: l1.finished?.completed ?? l1.finished, seconds: l1.seconds, errs: l1.errs };
  { const { ctx, p } = await page(dirA); res.A.mapAfterL1 = await mapState(p); await ctx.close(); }
  const l2 = playthrough('l2-playthrough', dirA);
  res.A.l2 = { main: l2.mainLabel, kicker: l2.finished.kicker, completions: l2.finished.store.completions, seconds: l2.seconds, errs: l2.errs };
  { const { ctx, p } = await page(dirA); res.A.mapAfterL2 = await mapState(p); await ctx.close(); }
  const l3 = playthrough('l3-playthrough', dirA);
  res.A.l3 = { main: l3.mainLabel, kicker: l3.finished.kicker, completions: l3.finished.store.completions, seconds: l3.seconds, errs: l3.errs, afterFinish: l3.afterFinish };
  { const { ctx, p, errs } = await page(dirA);
    res.A.mapFinal = await mapState(p); await p.screenshot({ path: `${out}/A-peta-dunia-selesai.png` }); await closeMap(p); await sleep(400);
    res.A.mainFinal = await p.textContent('#play-main-sub');
    res.A.profile = await p.evaluate(() => { const pr = JSON.parse(localStorage.getItem('denai-profile-v1')); return { achievements: pr.achievements, adventuresCompleted: pr.adventuresCompleted, l1: pr.levels['w1-l1'] }; });
    // Replay 1-2 from the World Map: mission reset, completions kept.
    await mapState(p); await p.evaluate(() => document.querySelector('button[data-level="w1-l2"][data-mode="replay"]').click());
    await p.waitForFunction(() => window.__game.scene.getScene('Jambatan')?.mode === 'playing', null, { timeout: 15000 }); await sleep(1500);
    res.A.replayL2 = await p.evaluate(() => { const s = window.__game.scene.getScene('Jambatan'); return { workshop: { ...s.run.workshop }, cp: s.run.checkpointId, completions: JSON.parse(localStorage.getItem('denai-campaign-v1')).levels['w1-l2'].completions }; });
    res.A.errsEnd = errs; await ctx.close(); }
  // ── B. Existing profile with previous-course saves ──
  const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'denai-w1-b-'));
  { const { ctx, p } = await page(dirB);
    await p.evaluate(([pr, a, b2, c]) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); localStorage.setItem('denai-save-v14', a); localStorage.setItem('denai-campaign-v1', b2); localStorage.setItem('denai-l3-campaign-v1', c); }, [PROFILE, OLD_L1, OLD_L2, OLD_L3]);
    await ctx.close(); }
  for (const [lvl, key] of [['w1-l1', 'Lorong'], ['w1-l2', 'Jambatan'], ['w1-l3', 'GerbangSongsang']]) {
    const { ctx, p, errs } = await page(dirB);
    const map = await mapState(p);
    const mode = map.find((m) => m.actions.some((a) => a.startsWith(`${lvl}:continue`))) ? 'continue' : map.find((m) => m.actions.some((a) => a.startsWith(`${lvl}:play`))) ? 'play' : 'replay';
    await p.evaluate(([lvl, mode]) => document.querySelector(`button[data-level="${lvl}"][data-mode="${mode}"]`).click(), [lvl, mode]);
    await p.waitForFunction((k) => window.__game.scene.getScene(k)?.mode === 'playing', key, { timeout: 15000 }); await sleep(1500);
    await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
    const first = await p.evaluate(`(${MISSION[key].toString()})(window.__game.scene.getScene('${key}'))`);
    await p.screenshot({ path: `${out}/B-${key}-sambung.png` });
    await p.keyboard.press('KeyR'); await sleep(1200);
    const afterRespawn = await p.evaluate(`(${MISSION[key].toString()})(window.__game.scene.getScene('${key}'))`);
    await p.evaluate((k) => window.__game.scene.getScene(k).writeSave?.(), key); await p.reload(); await ready(p); await sleep(500);
    await p.evaluate(() => document.getElementById('play-main')); // main menu after reload
    const map2 = await mapState(p); await p.evaluate(([lvl]) => { const b = document.querySelector(`button[data-level="${lvl}"][data-mode="continue"]`) || document.querySelector(`button[data-level="${lvl}"][data-mode="replay"]`); b.click(); }, [lvl]);
    await p.waitForFunction((k) => window.__game.scene.getScene(k)?.mode === 'playing', key, { timeout: 15000 }); await sleep(1500);
    const afterReload = await p.evaluate(`(${MISSION[key].toString()})(window.__game.scene.getScene('${key}'))`);
    // Finish: go to the goal (the mandatory mission is already done in the save).
    await p.evaluate(([k, x, feet]) => { const s = window.__game.scene.getScene(k); if (k === 'Lorong') s.elapsed = Math.max(s.elapsed || 0, 151000); s.player.body.reset(x, feet - 31); s.player.body.setVelocity(0, 0); }, [key, ...GOALS[key]]);
    await sleep(3500);
    const finished = await p.evaluate(() => ({ dialog: document.getElementById('complete').open, kicker: document.querySelector('#complete .victory-kicker')?.textContent }));
    res.B[key] = { mapStatus: map.find((m) => m.actions.some((a) => a.startsWith(lvl)))?.chip, mode, first, afterRespawn, afterReload, finished, errs };
    await ctx.close();
  }
  { const { ctx, p } = await page(dirB);
    res.B.mapFinal = await mapState(p); res.B.mainFinal = await (async () => { await closeMap(p); await sleep(300); return p.textContent('#play-main-sub'); })();
    res.B.profile = await p.evaluate(() => { const pr = JSON.parse(localStorage.getItem('denai-profile-v1')); return { achievements: pr.achievements, l1: pr.levels['w1-l1'] }; });
    await p.screenshot({ path: `${out}/B-menu-akhir.png` }); await ctx.close(); }
  console.log(JSON.stringify(res, null, 1));
})();
