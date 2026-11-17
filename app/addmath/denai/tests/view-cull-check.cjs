// View culling (core/view-cull.js) must not change what the player sees.
// For each World 1 level, the same camera spots are captured with culling ON
// and OFF (window.__DENAI_NO_CULL__) under reduced motion, and compared pixel
// by pixel — before and after the level's mission state changes that move or
// reveal objects (1-1 bridge repaired + crate pushed; 1-2 machines swapped +
// bridge built; 1-3 sluice opened + cave chest). Also reports how many
// managed images moved and were released (always drawn).
// Usage: node tests/view-cull-check.cjs <outdir>   (python3 -m http.server 8790 at the repo root)
const { chromium } = require('playwright');
const out = process.argv[2] || '.';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HOOK = (nocull) => { window.__DENAI_PLAYFAB_TEST_STUB__ = true; if (nocull) window.__DENAI_NO_CULL__ = true; let P; Object.defineProperty(window, 'Phaser', { configurable: true, get: () => P, set: (v) => { P = v; const G = v.Game; v.Game = class extends G { constructor(c) { super(c); window.__game = this; } }; } }); };
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: [], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const LEVELS = { Lorong: 6000, Jambatan: 4900, GerbangSongsang: 5616 };
const STATE = {
  Lorong: `(async () => { const s = window.__game.scene.getScene('Lorong'); const m = await import('/app/addmath/denai/src/v14/levels/supply-quest.js');
    Object.assign(s.run.quest, { found: true, key: true, door: true, bought: { x: 5, total: 26 }, planks: 5 }); s.questReady = 'repair'; m.useQuest(s, {});
    s.crate?.body?.reset(s.crateStart.x + 160, s.crateStart.y); await new Promise((r) => setTimeout(r, 2500)); return { repaired: s.run.quest.repaired }; })()`,
  Jambatan: `(async () => { const s = window.__game.scene.getScene('Jambatan'); const m = await import('/app/addmath/denai/src/v14/levels/workshop-line.js');
    s.run.workshop.order = 'AB'; s.workshop.place('AB', true); m.buildBridge(s, true); s.run.workshop.delivered = true; await new Promise((r) => setTimeout(r, 2000)); return { delivered: true }; })()`,
  GerbangSongsang: `(async () => { const s = window.__game.scene.getScene('GerbangSongsang'); const m = await import('/app/addmath/denai/src/v14/levels/sluice-line.js');
    s.run.sluice.setting = 5; s.sluiceReady = 'flow'; m.useSluice(s, {}); for (let i = 0; i < 200 && s.sluice.busy; i++) await new Promise((r) => requestAnimationFrame(r));
    s.run.sluice.cave = { setting: 6, tries: 1, solved: true }; s.sluice.chest.setFrame(11); s.revealCave(); await new Promise((r) => setTimeout(r, 1500)); return { open: s.run.sluice.open }; })()`,
};
async function capture(b, key, nocull) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' }); await ctx.addInitScript(HOOK, nocull); await ctx.route(/playfabapi\.com/, (r) => r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://denai.test:8790/app/addmath/denai/main.html');
  await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 });
  await p.evaluate((pr) => { localStorage.clear(); localStorage.setItem('denai-profile-v1', pr); localStorage.setItem('denai-campaign-v1', JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['x'], coins: [], secrets: [], bestMs: 1, run: null } } })); }, PROFILE);
  if (key === 'Lorong') { await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForFunction(() => window.__game?.scene?.getScene('Lorong')?.player && !document.getElementById('welcome').hidden, null, { timeout: 30000 }); await p.evaluate(() => document.getElementById('play-main').click()); await p.waitForFunction(() => window.__game.scene.getScene('Lorong')?.mode === 'playing', null, { timeout: 15000 }); }
  else await p.evaluate((k) => { const g = window.__game; g.scene.getScenes(true).forEach((x) => x.scene.stop()); g.scene.start(k, { fresh: true }); }, key);
  await sleep(2800); await p.evaluate(() => document.querySelectorAll('dialog[open]').forEach((d) => d.close()));
  const shots = [];
  const sweep = async (tag) => {
    const xs = []; for (let x = 300; x < LEVELS[key]; x += 520) xs.push(x);
    for (const x of xs) {
      await p.evaluate(([k, x]) => { const s = window.__game.scene.getScene(k), cam = s.cameras.main; const top = s.routePlatforms.filter((b) => !b.getData('oneWay') && b.body && x >= b.body.left && x <= b.body.right).map((b) => b.body.top).sort((a, b) => a - b)[0] ?? 1200;
        s.player.body.reset(x, top - 31); s.player.body.setVelocity(0, 0); s.physics.world.pause(); cam.stopFollow(); cam.centerOn(x, top - 190); s.bubble?.destroy?.(); }, [key, x]);
      await sleep(250); await p.evaluate(() => { for (const id of ['notice', 'quest-tracker', 'world-prompt', 'store-panel']) { const e = document.getElementById(id); if (e) e.style.visibility = 'hidden'; } });
      const buf = await p.locator('#game canvas').screenshot(); shots.push({ name: `${tag}-${x}`, buf });
      await p.evaluate((k) => window.__game.scene.getScene(k).physics.world.resume(), key);
    }
  };
  await sweep('awal');
  const state = await p.evaluate(STATE[key]);
  await sweep('misi');
  const cull = await p.evaluate((k) => { const v = window.__game.scene.getScene(k).viewCull; return v ? { managed: v.count(), released: v.released() } : null; }, key);
  await ctx.close(); return { shots, errs, state, cull };
}
(async () => {
  const b = await chromium.launch({ args: ['--host-resolver-rules=MAP denai.test 127.0.0.1'] });
  const fs = require('fs'); const res = {};
  for (const key of Object.keys(LEVELS)) {
    const off = await capture(b, key, true), on = await capture(b, key, false);
    const diffs = [];
    for (let i = 0; i < off.shots.length; i++) {
      const same = Buffer.compare(off.shots[i].buf, on.shots[i].buf) === 0;
      if (!same) { diffs.push(off.shots[i].name); fs.writeFileSync(`${out}/${key}-${off.shots[i].name}-off.png`, off.shots[i].buf); fs.writeFileSync(`${out}/${key}-${off.shots[i].name}-on.png`, on.shots[i].buf); }
    }
    res[key] = { views: off.shots.length, identical: off.shots.length - diffs.length, diffs, state: on.state, cull: on.cull, errs: [...off.errs, ...on.errs] };
  }
  await b.close(); console.log(JSON.stringify(res, null, 1));
})();
