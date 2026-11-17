const { open } = require('./rec.cjs'); const C = __dirname + '/cap'; const K = 'GerbangSongsang';
const PROFILE = JSON.stringify({ schemaVersion: 1, createdAt: '2026-11-01T00:00:00.000Z', levels: { 'w1-l1': { completions: 1, firstCompletedAt: '2026-11-01T00:00:00.000Z', best: null } }, coinIds: [], secretIds: [], achievements: ['jejak-pertama'], adventuresCompleted: 1, mastered: { variants: [], types: [] }, recentVariants: { lift: [] }, migrated: ['records-v14', 'run-v1'] });
const L2DONE = JSON.stringify({ schemaVersion: 1, levels: { 'w1-l2': { completions: 1, completedRuns: ['seed'], coins: [], secrets: [], bestMs: 60000, run: null } } });
(async () => {
  const r = await open({ seed: { 'denai-profile-v1': PROFILE, 'denai-campaign-v1': L2DONE } }); const { p } = r; const log = (m) => r.st(K).then((s) => console.log(m, JSON.stringify(s)));
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('GerbangSongsang')?.mode === 'playing', null, { timeout: 15000 });
  await new Promise((z) => setTimeout(z, 1500)); await r.fake(); await r.idle(20); await r.closeDialogs();
  r.shot(C + '/l3-start'); await r.frames(10); await r.run(K, 1, 1400, 32); await r.up('KeyD'); await r.frames(12); await log('start');
  r.dir = null; await r.tp(K, 2592, 1620); await r.idle(30); await log('tp');
  r.shot(C + '/l3-arrive'); await r.run(K, 1, 2640, 200); await r.frames(70); await log('pre-dlg'); await r.closeDlg(); await log('arrive');
  r.shot(C + '/l3-hints'); await r.journal(true); await r.frames(15);
  for (let i = 0; i < 3; i++) { await p.click('#qt-hint'); await r.frames(22); }
  await r.frames(20); await r.journal(false); await r.frames(5);
  r.shot(C + '/l3-valve-wrong'); await r.run(K, 1, 2850, 120); await r.settle(K, 2862); await r.frames(6);
  for (let i = 0; i < 3; i++) { await r.tap('KeyE'); await r.frames(14); }
  await r.run(K, 1, 3050, 120); await r.settle(K, 3060); await r.tap('KeyE'); await r.frames(90);
  await p.waitForFunction(() => !window.__game.scene.getScene('GerbangSongsang').sluice.busy).catch(() => {}); await log('wrong');
  r.shot(C + '/l3-valve-right'); await r.run(K, -1, 2875, 120); await r.settle(K, 2862); await r.frames(6);
  for (let i = 0; i < 2; i++) { await r.tap('KeyE'); await r.frames(16); }
  await r.run(K, 1, 3050, 120); await r.settle(K, 3060); await r.frames(4); await r.tap('KeyE'); await r.frames(170); await log('right');
  r.shot(C + '/l3-victory-dlg'); await r.frames(30); await r.closeDlg(); await r.frames(50);
  r.shot(C + '/l3-math'); await r.journal(true); await r.frames(10); await p.click('#qt-math'); await r.frames(60); await r.journal(false); await r.frames(5);

  console.log('errs', r.errs, await p.evaluate(() => window.__denaiDialogLog)); await r.close();
})();
