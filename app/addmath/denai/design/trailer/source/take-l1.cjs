const { open } = require('./rec.cjs'); const C = __dirname + '/cap'; const K = 'Lorong';
(async () => {
  const r = await open(); const { p } = r; const log = (m) => r.st(K).then((s) => console.log(m, JSON.stringify(s)));
  await p.click('#play-main'); await p.waitForFunction(() => window.__game.scene.getScene('Lorong').mode === 'playing');
  await r.fake(); await r.idle(10);
  r.shot(C + '/l1-start'); await r.frames(15); await r.run(K, 1, 980, 200); await r.frames(10); await log('start');
  r.dir = null; await r.run(K, 1, 2470); await r.frames(3);
  r.shot(C + '/l1-discover'); await r.frames(75); await r.closeDlg(); await r.frames(10); await log('discover');
  r.dir = null; await r.run(K, -1, 2380); await r.settle(K, 2367); await r.tap('KeyE'); await r.frames(15); await r.closeDlg();
  await r.run(K, -1, 1240); await r.settle(K, 1215);
  r.shot(C + '/l1-climb'); await r.climb(K, 1080); await r.run(K, 1, 1700, 200); await r.frames(10); await log('climb');
  r.dir = null; await r.run(K, 1, 2350); await r.settle(K, 2367);
  r.shot(C + '/l1-store'); await r.tap('KeyE'); await r.frames(20);
  for (let i = 0; i < 4; i++) { await p.click('#sp-plus'); await r.frames(7); }
  await r.frames(12); await r.tap('KeyE'); await r.frames(35); await log('store');
  r.dir = null; for (let i = 0; i < 4 && (await p.isVisible('#store-panel')); i++) { await r.tap('Escape'); await r.frames(5); }
  await r.run(K, 1, 2505); await r.settle(K, 2500); await r.frames(5);
  r.shot(C + '/l1-repair'); await r.tap('KeyE'); await r.frames(80); await r.closeDlg(); await r.frames(40); await log('repair');
  r.shot(C + '/l1-cross'); await r.run(K, 1, 3090, 200);
  for (const [edge, target] of [[3090, 3300], [3370, 3555], [3590, 3790], [3860, 4050], [4095, 4290]]) { await r.run(K, 1, edge, 200); await r.hop(K, 1, target); }
  await r.frames(10); await log('hops');
  r.dir = null; await r.run(K, 1, 5500, 900);
  r.shot(C + '/l1-finish'); await r.run(K, 1, 5745, 300); await r.frames(110); await log('finish');
  console.log('errs', r.errs, 'dialogs', await p.evaluate(() => window.__denaiDialogLog)); await r.close();
})();
