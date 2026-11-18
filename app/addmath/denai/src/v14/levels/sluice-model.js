// Level 1-3 (World 1 V3) · "Pulihkan Pintu Air Lama" — pure model (no DOM).
// The old sluice is calibrated as f(x) = 2x + 3: x is the valve setting
// (0…6, one notch at a time), f(x) the meter reading (game units, not a law of
// fluid flow). The original reading painted on the meter is 13, so the player
// must recover the setting that produced it: f⁻¹(13) = (13 − 3) ÷ 2 = 5.
// Optional second valve (cave channel): its meter is broken, the plate says
// "bacaan 15", so the setting has to be worked out: f⁻¹(15) = 6.
// Day 03: rule, domain and targets come from the puzzle definitions
// 'w1.l3.sluice.main' / 'w1.l3.cave.main'; maths in puzzles/models/inverse.js.
// Exports keep their previous names and values (saves store setting/readings).
import { puzzleById } from '../puzzles/index.js';
import * as inverseModel from '../puzzles/models/inverse.js';
export const DEFINITION = puzzleById('w1.l3.sluice.main'), CAVE_DEFINITION = puzzleById('w1.l3.cave.main');
const P = DEFINITION.parameters;
export const DOMAIN = Object.freeze(inverseModel.domainOf(P));
export const TARGET = P.target, CAVE_TARGET = CAVE_DEFINITION.parameters.target;
export const reading = (x) => inverseModel.forward(P, x);
export const inverse = (y) => (y - P.rule.b) / P.rule.a;
export const inverseSteps = (y) => inverseModel.inverseSteps(P, y);

export function newSluice() {
  return { setting: 0, tests: 0, lastReading: null, open: false, noteRead: false, cave: { setting: null, tries: 0, solved: false } };
}
// One notch clockwise; past 6 the wheel comes back to 0.
export const turnValve = (s) => (s.open ? s : { ...s, setting: (s.setting + 1) % DOMAIN.length });
// Open the flow at the current setting. Nothing is lost on a wrong reading:
// the gate falls back and the player can turn the wheel again.
export function testFlow(s) {
  if (s.open) return { state: s, reading: TARGET, result: 'open' };
  const r = reading(s.setting), result = r === TARGET ? 'open' : r < TARGET ? 'low' : 'high';
  return { state: { ...s, tests: Math.min(s.tests + 1, 999), lastReading: r, open: result === 'open' }, reading: r, result };
}
export const readNote = (s) => (s.noteRead ? s : { ...s, noteRead: true });
// Cave valve: the setting is chosen by standing on a numbered plate.
export const stepPlate = (s, n) => (s.cave.solved || !DOMAIN.includes(n) || s.cave.setting === n ? s : { ...s, cave: { ...s.cave, setting: n } });
export function pullCave(s) {
  const c = s.cave;
  if (c.solved) return { state: s, result: 'solved' };
  if (c.setting === null) return { state: s, result: 'none' };
  const ok = reading(c.setting) === CAVE_TARGET;
  // A wrong pull spits water back and resets the plates; no other cost.
  return { state: { ...s, cave: { setting: ok ? c.setting : null, tries: Math.min(c.tries + 1, 999), solved: ok } }, result: ok ? 'solved' : 'wrong', reading: reading(c.setting) };
}
export const sluiceStep = (s) => (!s ? 'none' : s.open ? 'done' : s.tests === 0 ? 'investigate' : 'retry');

const int = (v, lo, hi) => (Number.isSafeInteger(v) && v >= lo && v <= hi ? v : null);
// Accepts only states the game itself can produce. `legacyOpen`: a save from the
// previous course whose three seals were all lit — the crossing stays open.
export function sanitizeSluice(raw, legacyOpen = false) {
  const s = newSluice();
  if (raw && typeof raw === 'object') {
    s.setting = int(raw.setting, 0, 6) ?? 0;
    s.tests = int(raw.tests, 0, 999) ?? 0;
    s.lastReading = DOMAIN.map(reading).includes(raw.lastReading) ? raw.lastReading : null;
    s.noteRead = raw.noteRead === true;
    s.open = raw.open === true && reading(s.setting) === TARGET; // cannot be forged with another setting
    const c = raw.cave && typeof raw.cave === 'object' ? raw.cave : {};
    const cs = int(c.setting, 0, 6);
    s.cave = { setting: cs, tries: int(c.tries, 0, 999) ?? 0, solved: c.solved === true && reading(cs) === CAVE_TARGET };
  }
  if (legacyOpen) Object.assign(s, { setting: 5, open: true, lastReading: TARGET, tests: Math.max(s.tests, 1) });
  return s;
}
