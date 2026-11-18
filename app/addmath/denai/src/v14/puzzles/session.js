// DENAI · puzzle session (Day 04). One session = the puzzle a run is playing:
//   { v: 1, id, seed, difficulty, params }
// It is stored additively inside each level's existing run object
// (quest.puzzle · workshop.puzzle · sluice.puzzle), never in a new key.
//
// Why the parameters are stored and not only the seed: a run must keep the
// same numbers after a reload even if a later build narrows a generator's
// ranges (the same seed would then give another puzzle mid-answer). The
// parameters are a handful of integers; they are re-validated against the
// model and the level's mechanic limits on every load, so an edited save can
// never produce an unsolvable or undrawable puzzle. Completion is NOT stored
// here: each level already records it (quest.repaired, workshop.delivered,
// sluice.open) and keeping one source of truth avoids contradictions.
//
// Restore order: valid stored session → regenerate from its seed → the
// caller's fallback (the level's original definition / legacy K1–K3 variant).
import { puzzleById, puzzlesFor } from './index.js';
import { makeRule, isRule } from './rules.js';
import * as linear from './models/linear-cost.js';
import * as composite from './models/composite.js';
import * as inverseModel from './models/inverse.js';
import { supplyDefinition, workshopDefinition, sluiceDefinition, caveDefinition } from './definitions/world1.js';
import { generateSupply, generateWorkshop, generateSluice, generateCaveTarget } from './generators/world1.js';

export const SESSION_VERSION = 1;
const DIFFICULTIES = ['mudah', 'sederhana', 'cabaran'];
const isInt = (v, lo, hi) => Number.isSafeInteger(v) && v >= lo && v <= hi;
const isSeed = (v) => Number.isSafeInteger(v) && v >= 0 && v <= 0xffffffff;
const rule = (r) => makeRule(r.a, r.b);

// ── Mechanic limits (what each scene can draw and play) ─────────────────────
// 1-1: the bridge has 5 missing planks; the store stocks 8; receipt fits 2 digits.
// 1-2: ≤ 6 stock crates; machine A multiplies (×2/×3), machine B removes 1–3.
// 1-3: the wheel and the cave plates both have 7 positions (0…6), so the
//      domain is fixed; 0 is where the wheel starts, so no answer may be 0;
//      readings are drawn with atlas digits (non-negative).
export const L3_DOMAIN = Object.freeze([0, 6]);

const LEVELS = {
  'w1-l1': {
    clean: (p) => ({ price: p.price, delivery: p.delivery, budget: p.budget, need: p.need, stock: p.stock }),
    check(p) {
      if (!p || typeof p !== 'object') return ['params'];
      const out = linear.validateParams(p);
      if (p.need !== 5 || p.stock !== 8) out.push('need/stock fixed by the bridge');
      if (!isInt(p.price, 1, 9) || !isInt(p.delivery, 0, 20) || !isInt(p.budget, 1, 99)) out.push('ranges');
      if (!out.length && !linear.acceptedChoices(p).includes(p.need)) out.push('exact need must be accepted');
      return out;
    },
    definition: (s) => supplyDefinition(s.id, null, s.params, linear.solve(s.params), { difficulty: s.difficulty }),
    generate: (seed, difficulty) => generateSupply(seed, { difficulty, need: 5, stock: 8 }),
  },
  'w1-l2': {
    compact: (p) => (p.machines ? { input: p.input, need: p.need, start: p.start, f: p.machines.A.rule, g: p.machines.B.rule } : p),
    clean: (p) => ({ input: p.input, need: p.need, start: p.start, f: { a: p.f.a, b: p.f.b }, g: { a: p.g.a, b: p.g.b } }),
    check(p) {
      if (!p || typeof p !== 'object' || !isRule(p.f) || !isRule(p.g)) return ['params'];
      const out = [];
      if (!isInt(p.input, 3, 6)) out.push('input');
      if (!isInt(p.f.a, 2, 3) || p.f.b !== 0) out.push('f');
      if (p.g.a !== 1 || !isInt(-p.g.b, 1, 3)) out.push('g');
      if (out.length) return out;
      return composite.validateParams(workshopParams(p));
    },
    definition: (s) => { const p = s.params; return { ...workshopDefinition(s.id, { input: p.input, need: p.need, start: p.start, f: rule(p.f), g: rule(p.g) }, composite.solve(workshopParams(p))), difficulty: s.difficulty }; },
    generate: (seed) => generateWorkshop(seed, { factors: [2], remove: [1, 3], input: [4, 6] }),
  },
  'w1-l3': {
    clean: (p) => ({ rule: { a: p.rule.a, b: p.rule.b }, target: p.target, cave: p.cave }),
    check(p) {
      if (!p || typeof p !== 'object' || !isRule(p.rule)) return ['params'];
      const out = [];
      if (!isInt(p.rule.a, 1, 3) || !isInt(p.rule.b, 0, 9)) out.push('rule');
      if (out.length) return out;
      const main = { rule: p.rule, domain: [...L3_DOMAIN], target: p.target }, cave = { ...main, target: p.cave };
      out.push(...inverseModel.validateParams(main), ...inverseModel.validateParams(cave).map((e) => `cave: ${e}`));
      if (out.length) return out;
      const x = inverseModel.solve(main).setting, xc = inverseModel.solve(cave).setting;
      if (x === 0 || xc === 0) out.push('setting 0 is the wheel start');
      if (x === xc) out.push('cave must need another setting');
      return out;
    },
    definition: (s) => { const p = s.params; const main = { rule: rule(p.rule), domain: [...L3_DOMAIN], target: p.target }; return { ...sluiceDefinition(s.id, main, inverseModel.solve(main)), difficulty: s.difficulty }; },
    generate(seed) {
      const main = generateSluice(seed, { setting: [2, 5] });
      return { ...main, parameters: { ...main.parameters, cave: generateCaveTarget(seed, main) } };
    },
  },
};
// The composite model's machine shape (names/min) from compact session params.
export function workshopParams(p) {
  return workshopDefinition('w1.l2.workshop.tmp', { input: p.input, need: p.need, start: p.start, f: rule(p.f), g: rule(p.g) }, { working: [], outputs: {} }).parameters;
}

function level(levelKey) { const L = LEVELS[levelKey]; if (!L) throw new RangeError(`session: unknown level ${levelKey}`); return L; }
const freeze = (s) => Object.freeze({ ...s, params: JSON.parse(JSON.stringify(s.params)) });

export const validParams = (levelKey, params) => level(levelKey).check(params).length === 0;

// A session for a level's original (hand-written) definition.
export function baseSession(levelKey, definitionId) {
  const def = puzzleById(definitionId);
  if (!def) throw new RangeError(`session: unknown definition ${definitionId}`);
  let params = def.parameters;
  if (levelKey === 'w1-l2') params = LEVELS['w1-l2'].compact(params);
  if (levelKey === 'w1-l3') params = { rule: params.rule, target: params.target, cave: puzzleById('w1.l3.cave.main').parameters.target };
  return freeze({ v: SESSION_VERSION, id: def.id, seed: null, difficulty: def.difficulty, params: level(levelKey).clean(params) });
}
export const BASE = Object.freeze({ 'w1-l1': 'w1.l1.supply.k1', 'w1-l2': 'w1.l2.workshop.main', 'w1-l3': 'w1.l3.sluice.main' });
// 1-1 saves before Day 04 only carry the price-list id (K1–K3).
export function legacySupplySession(legacyId) {
  const def = puzzlesFor('supply-store').find((d) => d.legacyId === legacyId && d.status === 'live') || puzzleById(BASE['w1-l1']);
  return baseSession('w1-l1', def.id);
}

// A new seeded session. Same (level, seed, difficulty) ⇒ identical session.
export function createSession(levelKey, { seed, difficulty } = {}) {
  const L = level(levelKey);
  if (!isSeed(seed)) throw new RangeError('session: seed must be a 32-bit unsigned integer');
  const def = L.generate(seed, difficulty);
  const s = { v: SESSION_VERSION, id: def.id, seed, difficulty: def.difficulty, params: L.clean(L.compact ? L.compact(def.parameters) : def.parameters) };
  if (L.check(s.params).length) throw new Error(`session: generator gave an unsupported puzzle for seed ${seed}`);
  return freeze(s);
}

// Restores a stored session; never throws. `fallback` gives the session to use
// when nothing usable is stored (old save → the level's original puzzle).
export function restoreSession(levelKey, raw, fallback = () => baseSession(levelKey, BASE[levelKey])) {
  const L = level(levelKey);
  if (raw && typeof raw === 'object' && raw.v === SESSION_VERSION && typeof raw.id === 'string' && raw.id.length < 80) {
    try {
      if (L.check(raw.params).length === 0) {
        const difficulty = DIFFICULTIES.includes(raw.difficulty) ? raw.difficulty : 'sederhana';
        return freeze({ v: SESSION_VERSION, id: raw.id, seed: isSeed(raw.seed) ? raw.seed : null, difficulty, params: L.clean(raw.params) });
      }
    } catch { /* fall through */ }
    // Damaged parameters but a usable seed: the generator rebuilds the puzzle.
    if (isSeed(raw.seed)) { try { return createSession(levelKey, { seed: raw.seed, difficulty: raw.difficulty }); } catch { /* fall through */ } }
  }
  return fallback();
}

// The full definition (hints, explanation, feedback, answer) for a session.
// Rebuilt from the parameters (pure, cached), so nothing derived is stored.
const cache = new Map();
export function definitionFor(levelKey, session) {
  const key = `${levelKey}|${session.id}|${JSON.stringify(session.params)}`;
  if (!cache.has(key)) { if (cache.size > 64) cache.clear(); cache.set(key, Object.freeze(level(levelKey).definition(session))); }
  return cache.get(key);
}
// 1-3's optional cave valve for a session (same rule, its own target).
export function caveDefinitionFor(session) {
  const p = session.params, main = { rule: rule(p.rule), domain: [...L3_DOMAIN], target: p.cave };
  return caveDefinition(`${session.id}.cave`, main, inverseModel.solve(main));
}

// A fresh random seed for a new run (crypto when available).
export function newSeed() {
  try { return globalThis.crypto.getRandomValues(new Uint32Array(1))[0]; } catch { return (Math.random() * 2 ** 32) >>> 0; }
}
