// Level 1-1 (Phase C) · optional riverside sawmill that builds the fishing jetty.
// Applied maths: g(b) = 3b − 1 usable planks from b logs (3 planks per log,
// 1 lost as the cutting offcut). The jetty needs exactly 11 planks → b = 4.
// Pure helpers are exported for tests; the scene parts only add art, a prompt
// and (when solved) one one-way platform + one ladder. No save schema change:
// the jetty is an optional shortcut and is rebuilt each session.
import {JETTY,SAWMILL} from '../level.js';
import {notify} from '../presentation.js';

export const SAWMILL_TARGET = JETTY.planks; // 11
export const MAX_LOGS = 6;
export const sawmillPlanks = (b) => 3 * b - 1;
export function sawmillFeedback(b) {
  const planks = sawmillPlanks(b), diff = planks - SAWMILL_TARGET;
  const sum = `g(${b}) = 3(${b}) − 1 = ${planks} papan`;
  if (diff === 0) return { planks, diff, done: true, text: `${sum} · tepat! Jeti siap.` };
  if (diff < 0) return { planks, diff, done: false, text: `${sum} · kurang ${-diff}: jeti belum sampai ke tebing` };
  return { planks, diff, done: false, text: `${sum} · lebih ${diff}: papan lebihan disusun di tepi` };
}
export const nextLogs = (b) => (b % MAX_LOGS) + 1;

const TEXT = { fontFamily: 'Arial, sans-serif', fontStyle: 'bold', color: '#fff1cf', stroke: '#3d493c', strokeThickness: 3, align: 'center' };

export function buildSawmill(s) {
  const tile = s.tile, x = SAWMILL.x, feet = SAWMILL.feet;
  // Sawmill: a plank bench on two legs, a log pile and a sign. All on the far bank.
  for (const px of [x - 40, x + 40]) tile(89, px - 27, feet - 36, 10.4, 54, 36);
  tile(48, x - 54, feet - 54, 10.5, 54, 18); tile(50, x, feet - 54, 10.5, 54, 18);          // saw bench (2 tiles, inside the bank)
  tile(7, x - 84, feet - 54, 10.45); tile(8, x + 30, feet - 72, 10.6);                     // logs waiting by the bench
  // One sign above the bench (high enough to clear the player and the prompt).
  // The chosen b lives in the prompt; the result is a short screen notice,
  // and the planks themselves appear on the jetty — no floating text near
  // the player, the lever or the ladder.
  const board = s.add.text(x - 27, feet - 200, 'KILANG PAPAN · g(b) = 3b − 1\njeti perlu 11 papan', { ...TEXT, fontSize: '13px' }).setOrigin(.5, 1).setDepth(15);
  const lever = tile(64, SAWMILL.leverX - 27, SAWMILL.leverFeet - 54, 11);
  // Old jetty posts already stand in the water; the deck is missing.
  const pw = JETTY.width / JETTY.planks;
  for (const px of [JETTY.x + 27, JETTY.x + JETTY.width / 2, JETTY.x + JETTY.width - 27]) for (let y = JETTY.y + 18; y < 1566; y += 54) tile(89, px - 27, y, 6.5, 54, Math.min(54, 1566 - y));
  const planks = Array.from({ length: JETTY.planks }, (_, i) => tile(49, JETTY.x + i * pw, JETTY.y, 10, pw, 18).setVisible(false));
  const extras = Array.from({ length: sawmillPlanks(MAX_LOGS) - SAWMILL_TARGET }, (_, i) => tile(49, x - 27, feet - 60 - i * 6, 10.6, 54, 6).setVisible(false)); // leftovers stacked on the bench
  s.sawmill = { b: 0, built: false, board, planks, extras, lever, last: '' };
}

function showPlanks(s, n, built) {
  const m = s.sawmill;
  m.planks.forEach((p, i) => p.setVisible(i < Math.min(n, SAWMILL_TARGET)).setAlpha(built ? 1 : .55));
  m.extras.forEach((p, i) => p.setVisible(i < Math.max(0, n - SAWMILL_TARGET)));
}

export function sawmillPrompt(s, onGround, touch) {
  const m = s.sawmill; s.sawmillReady = null; if (!m || m.built || !onGround) return null;
  const at = (x, feet, r) => Math.abs(s.player.x - x) < r && Math.abs(s.player.body.bottom - feet) < 8;
  const key = touch ? 'Guna' : 'E';
  if (at(SAWMILL.x, SAWMILL.feet, 110)) { s.sawmillReady = 'mill'; return { key, text: m.b ? `b = ${m.b} kayu balak · tukar` : 'Muat kayu balak', x: SAWMILL.x - 27, y: SAWMILL.feet - 112 }; }
  if (at(SAWMILL.leverX, SAWMILL.leverFeet, 60)) { s.sawmillReady = 'lever'; return { key, text: m.b ? `Hantar ${m.b} kayu balak ke jeti` : 'Muat kayu balak di kilang dahulu', x: SAWMILL.leverX, y: SAWMILL.leverFeet - 110 }; }
  return null;
}

// Step 1 at the mill: choose b (no result shown yet; the player predicts g(b)).
// Step 2 at the lever: the planks are cut and laid; the result is visible.
export function useSawmill(s, { audio, SFX } = {}) {
  const m = s.sawmill; if (!m || m.built) return;
  if (s.sawmillReady === 'mill') {
    m.b = nextLogs(m.b); showPlanks(s, 0, false);
    notify(`b = ${m.b} kayu balak dimuat. Berapa papan? Tarik tuil di kepala jeti.`);
    return;
  }
  if (s.sawmillReady === 'lever' && m.b) {
    const fb = sawmillFeedback(m.b);
    m.lever.setFrame(66); s.time?.delayedCall?.(500, () => m.lever.setFrame(64));
    m.last = fb.text; notify(fb.text, 2);
    showPlanks(s, fb.planks, false);
    if (fb.done) buildJetty(s, { audio, SFX });
  }
}

export function buildJetty(s, { audio, SFX } = {}) {
  const m = s.sawmill; if (m.built) return;
  m.built = true; showPlanks(s, SAWMILL_TARGET, true); m.lever.setFrame(66);
  s.platform({ id: JETTY.id, x: JETTY.x, y: JETTY.y, width: JETTY.width });
  s.platform(JETTY.landing); s.deck(JETTY.landing); // ladder top step onto the rest cliff
  const l = JETTY.ladder;
  for (let y = l.top; y < l.bottom; y += 54) s.tile(71, l.x - 27, y, 13, 54, Math.min(54, l.bottom - y));
  const z = s.add.zone(l.x, (l.top + l.bottom) / 2, 56, l.bottom - l.top + 72); s.physics.add.existing(z, true); z.setData('ladder', l); s.ladderZones.push(z);
  if (SFX && audio) SFX.checkpoint(audio);
}
