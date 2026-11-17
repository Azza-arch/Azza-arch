// Real Journal UI (hint 3 open) captured at 2.5x device scale for a crisp still.
const { open } = require('./rec.cjs'); const K = 'GerbangSongsang';
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
(async () => {
  const r = await open({ seed: { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': L2DONE }, dpr: 2.5 }); const { p } = r;
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('GerbangSongsang')?.mode === 'playing', null, { timeout: 15000 });
  await new Promise((z) => setTimeout(z, 1500)); await r.fake(); await r.idle(20); await r.closeDialogs();
  await r.tp(K, 2592, 1620); await r.idle(30); await r.run(K, 1, 2640, 200); await r.idle(70); await r.closeDlg();
  await r.journal(true); await r.idle(15); for (let i = 0; i < 3; i++) { await p.click('#qt-hint'); await r.idle(22); } await r.idle(30);
  await p.locator('#quest-tracker').screenshot({ path: 'out/journal-hint3@2.5x.png', animations: 'disabled' });
  console.log(await p.locator('#quest-tracker').boundingBox(), r.errs); await r.close();
})();
