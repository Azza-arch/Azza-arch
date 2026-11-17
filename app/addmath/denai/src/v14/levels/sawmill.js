// Level 1-1 · riverside sawmill and fishing jetty (World 1 V3, decision D1).
// The sawmill's maths question (g(b) = 3b − 1) is retired: Level 1-1 has one
// applied-maths mission (the Stor Kayu purchase). The sawmill stays as set
// dressing and the jetty is already built: an optional route to a coin.
import {JETTY,SAWMILL} from '../level.js';

export function buildSawmill(s) {
  const tile = s.tile, x = SAWMILL.x, feet = SAWMILL.feet;
  for (const px of [x - 40, x + 40]) tile(89, px - 27, feet - 36, 10.4, 54, 36);
  tile(48, x - 54, feet - 54, 10.5, 54, 18); tile(50, x, feet - 54, 10.5, 54, 18);          // saw bench
  tile(7, x - 84, feet - 54, 10.45); tile(8, x + 30, feet - 72, 10.6);                     // logs by the bench
  const pw = JETTY.width / JETTY.planks;
  for (const px of [JETTY.x + 27, JETTY.x + JETTY.width / 2, JETTY.x + JETTY.width - 27]) for (let y = JETTY.y + 18; y < 1566; y += 54) tile(89, px - 27, y, 6.5, 54, Math.min(54, 1566 - y));
  const planks = Array.from({ length: JETTY.planks }, (_, i) => tile(49, JETTY.x + i * pw, JETTY.y, 10, pw, 18));
  s.sawmill = { built: false, planks };
  buildJetty(s);
}

export function buildJetty(s, { audio, SFX } = {}) {
  const m = s.sawmill; if (m.built) return;
  m.built = true;
  s.platform({ id: JETTY.id, x: JETTY.x, y: JETTY.y, width: JETTY.width });
  s.platform(JETTY.landing); s.deck(JETTY.landing); // ladder top step onto the rest cliff
  const l = JETTY.ladder;
  for (let y = l.top; y < l.bottom; y += 54) s.tile(71, l.x - 27, y, 13, 54, Math.min(54, l.bottom - y));
  const z = s.add.zone(l.x, (l.top + l.bottom) / 2, 56, l.bottom - l.top + 72); s.physics.add.existing(z, true); z.setData('ladder', l); s.ladderZones.push(z);
}
