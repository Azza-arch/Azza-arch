// DENAI puzzle layer — entry point.
//   rules.js        linear rules as data ({a, b}), evaluated without eval()
//   rng.js          seeded, reproducible randomness
//   models/         pure maths per mechanic (validateParams, solve, …)
//   definitions/    puzzle data per world (ids, DSKP refs, params, hints, answers)
//   generators/     seeded variants that are checked by the models
//   validators/     definition checks (required fields, answer == model)
import * as linearCost from './models/linear-cost.js';
import * as composite from './models/composite.js';
import * as inverse from './models/inverse.js';
import { WORLD1 } from './definitions/world1.js';

export const MODELS = Object.freeze({ 'linear-cost': linearCost, 'composite-order': composite, 'inverse-linear': inverse });
export const DEFINITIONS = Object.freeze([...WORLD1]);

export function puzzleById(id) {
  const d = DEFINITIONS.find((p) => p.id === id);
  if (!d) throw new RangeError(`unknown puzzle ${id}`);
  return d;
}
export const puzzlesFor = (mechanic) => DEFINITIONS.filter((p) => p.mechanic === mechanic);
export const solve = (def) => MODELS[def.check.kind].solve(def.parameters);

// Feedback templates use {name} placeholders filled from plain data (no eval).
export const fill = (template, vars) => String(template).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
