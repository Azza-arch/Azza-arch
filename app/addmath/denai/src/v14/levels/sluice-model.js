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
// Day 04: rule and targets come from the run's puzzle session (sluice.puzzle,
// see puzzles/session.js); a save without one keeps the original puzzle.
// Module-level exports = the original puzzle; the scene uses meterOf(state).
import * as inverseModel from '../puzzles/models/inverse.js';
import { BASE, baseSession, createSession, restoreSession, definitionFor, caveDefinitionFor, newSeed } from '../puzzles/session.js';
const LEVEL = 'w1-l3';
export const BASE_SESSION = baseSession(LEVEL, BASE[LEVEL]);
const views = new Map();
export function meterFor(session) {
  const key = JSON.stringify(session.params);
  if (views.has(key)) return views.get(key);
  const def = definitionFor(LEVEL, session), cave = caveDefinitionFor(session), P = def.parameters;
  const domain = inverseModel.domainOf(P), range = inverseModel.range(P);
  const view = Object.freeze({
    definition: def, caveDefinition: cave, rule: P.rule,
    DOMAIN: Object.freeze(domain), RANGE: Object.freeze(range), MIN: range[0], MAX: range[range.length - 1],
    TARGET: P.target, CAVE_TARGET: cave.parameters.target, SETTING: def.answer.setting, CAVE_SETTING: cave.answer.setting,
    // Day 07 · cistern code: the same machine, a third input that is neither the sluice
    // setting nor the cave setting (fixed order, so it is deterministic per session).
    CISTERN_SETTING: [3, 4, 2, 5, 1, 6].find((x) => x !== def.answer.setting && x !== cave.answer.setting),
    reading: (x) => inverseModel.forward(P, x),
    get CISTERN_TARGET() { return inverseModel.forward(P, this.CISTERN_SETTING); },
    inverseSteps: (y) => inverseModel.inverseSteps(P, y),
  });
  if (views.size > 32) views.clear();
  views.set(key, view); return view;
}
export const meterOf = (s) => meterFor(s?.puzzle || BASE_SESSION);
const base = meterFor(BASE_SESSION);
export const DEFINITION = base.definition, CAVE_DEFINITION = base.caveDefinition;
export const DOMAIN = base.DOMAIN;
export const TARGET = base.TARGET, CAVE_TARGET = base.CAVE_TARGET;
export const reading = base.reading;
export const inverse = (y) => (y - base.rule.b) / base.rule.a;
export const inverseSteps = base.inverseSteps;

// Default: the original puzzle (first visit). A seed gives a generated puzzle
// (replays); the same seed always gives the same rule and targets.
export function newSluice({ seed } = {}) {
  const puzzle = Number.isSafeInteger(seed) ? createSession(LEVEL, { seed }) : BASE_SESSION;
  return { setting: 0, tests: 0, lastReading: null, open: false, noteRead: false, cave: { setting: null, tries: 0, solved: false }, cistern: { setting: 0, tries: 0, solved: false }, puzzle };
}
export const replaySluice = () => newSluice({ seed: newSeed() });
// One notch clockwise; past 6 the wheel comes back to 0.
export const turnValve = (s) => (s.open ? s : { ...s, setting: (s.setting + 1) % DOMAIN.length });
// Open the flow at the current setting. Nothing is lost on a wrong reading:
// the gate falls back and the player can turn the wheel again.
export function testFlow(s) {
  const { TARGET, reading } = meterOf(s);
  if (s.open) return { state: s, reading: TARGET, result: 'open' };
  const r = reading(s.setting), result = r === TARGET ? 'open' : r < TARGET ? 'low' : 'high';
  return { state: { ...s, tests: Math.min(s.tests + 1, 999), lastReading: r, open: result === 'open' }, reading: r, result };
}
export const readNote = (s) => (s.noteRead ? s : { ...s, noteRead: true });
// Cave valve: the setting is chosen by standing on a numbered plate.
export const stepPlate = (s, n) => (s.cave.solved || !DOMAIN.includes(n) || s.cave.setting === n ? s : { ...s, cave: { ...s.cave, setting: n } });
export function pullCave(s) {
  const c = s.cave, { CAVE_TARGET, reading } = meterOf(s);
  if (c.solved) return { state: s, result: 'solved' };
  if (c.setting === null) return { state: s, result: 'none' };
  const ok = reading(c.setting) === CAVE_TARGET;
  // A wrong pull spits water back and resets the plates; no other cost.
  return { state: { ...s, cave: { setting: ok ? c.setting : null, tries: Math.min(c.tries + 1, 999), solved: ok } }, result: ok ? 'solved' : 'wrong', reading: reading(c.setting) };
}
// Day 07 · optional cistern (Takungan Lama): a code dial 0…6 and a lever. The
// grille opens only when f(code) equals the cistern target (inverse function).
// Wrong pulls cost nothing; the reading is shown so the player can adjust.
export const turnCistern = (s) => (s.cistern?.solved ? s : { ...s, cistern: { ...s.cistern, setting: (s.cistern.setting + 1) % DOMAIN.length } });
export function pullCistern(s) {
  const c = s.cistern, m = meterOf(s);
  if (c.solved) return { state: s, result: 'solved', reading: m.CISTERN_TARGET };
  const r = m.reading(c.setting), ok = r === m.CISTERN_TARGET;
  return { state: { ...s, cistern: { setting: c.setting, tries: Math.min(c.tries + 1, 999), solved: ok } }, result: ok ? 'solved' : 'wrong', reading: r };
}
export const sluiceStep = (s) => (!s ? 'none' : s.open ? 'done' : s.tests === 0 ? 'investigate' : 'retry');

const int = (v, lo, hi) => (Number.isSafeInteger(v) && v >= lo && v <= hi ? v : null);
// Accepts only states the game itself can produce. `legacyOpen`: a save from the
// previous course whose three seals were all lit — the crossing stays open.
export function sanitizeSluice(raw, legacyOpen = false) {
  const puzzle = restoreSession(LEVEL, raw && typeof raw === 'object' ? raw.puzzle : null);
  const s = { ...newSluice(), puzzle }, { DOMAIN, TARGET, CAVE_TARGET, SETTING, reading } = meterOf(s);
  if (raw && typeof raw === 'object') {
    s.setting = int(raw.setting, 0, 6) ?? 0;
    s.tests = int(raw.tests, 0, 999) ?? 0;
    s.lastReading = DOMAIN.map(reading).includes(raw.lastReading) ? raw.lastReading : null;
    s.noteRead = raw.noteRead === true;
    s.open = raw.open === true && reading(s.setting) === TARGET; // cannot be forged with another setting
    const c = raw.cave && typeof raw.cave === 'object' ? raw.cave : {};
    const cs = int(c.setting, 0, 6);
    s.cave = { setting: cs, tries: int(c.tries, 0, 999) ?? 0, solved: c.solved === true && reading(cs) === CAVE_TARGET };
    // Day 07: optional cistern (missing in older saves → closed, setting 0).
    const k = raw.cistern && typeof raw.cistern === 'object' ? raw.cistern : {};
    const ks = int(k.setting, 0, 6) ?? 0;
    s.cistern = { setting: ks, tries: int(k.tries, 0, 999) ?? 0, solved: k.solved === true && reading(ks) === meterOf(s).CISTERN_TARGET };
  }
  if (legacyOpen) Object.assign(s, { setting: SETTING, open: true, lastReading: TARGET, tests: Math.max(s.tests, 1) });
  return s;
}

// ── Texts that quote the machine (note, journal, tablets, victory) ──
// Built from the session so they always match the meter the player sees.
const undo = (m, y) => (m.rule.b ? `(${y} − ${m.rule.b}) ÷ ${m.rule.a}` : `${y} ÷ ${m.rule.a}`);
const calib = (m) => `${m.rule.a} × tetapan${m.rule.b ? ` + ${m.rule.b}` : ''}`;
export const noteText = (s) => `Catatan penyelenggaraan (koyak):\n«Kalibrasi injap: bacaan = ${calib(meterOf(s))}. Bacaan asal …»`;
export function mathText(s) {
  const m = meterOf(s), f = `${m.rule.a}x${m.rule.b ? ` + ${m.rule.b}` : ''}`;
  return `f(x) = ${f} · f(${m.SETTING}) = ${m.TARGET} ✓ · f⁻¹(${m.TARGET}) = ${undo(m, m.TARGET)} = ${m.SETTING}${s.cave?.solved ? ` · Injap gua: f⁻¹(${m.CAVE_TARGET}) = ${undo(m, m.CAVE_TARGET)} = ${m.CAVE_SETTING}` : ''}.`;
}
export const victoryLine = (s) => { const m = meterOf(s); return `Fungsi songsang membantu mencari semula input daripada output: f⁻¹(${m.TARGET}) = ${undo(m, m.TARGET)} = ${m.SETTING}.`; };
// Secret tablets whose text depends on the machine; others keep their own text.
export function secretText(def, s) {
  const m = meterOf(s);
  if (def.id === 'domain-tablet') return `Domain f ialah {${m.DOMAIN.join(',')}}. Julatnya {${m.RANGE.join(',')}}; setiap objek berbeza mempunyai imej berbeza (fungsi satu dengan satu).`;
  if (def.id === 'inverse-tablet') return `Injap gua: ${m.inverseSteps(m.CAVE_TARGET)}. Fungsi songsang memulangkan input: f⁻¹(y) = ${undo(m, 'y')}. f⁻¹ bukan 1/f. Di dasar peti ada serpihan batu kapur — dari lembah di seberang gerbang.`;
  return def.text;
}
