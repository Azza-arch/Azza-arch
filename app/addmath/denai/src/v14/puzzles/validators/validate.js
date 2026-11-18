// DENAI puzzle definition validator: required fields, stable id format, valid
// parameters, and the stored `answer` must equal what the model computes.
import { MODELS } from '../index.js';

export const REQUIRED = ['id', 'chapter', 'subtopic', 'difficulty', 'learningObjective', 'mechanic', 'parameters', 'check', 'answer', 'hints', 'explanation', 'wrongFeedback', 'status'];
export const DIFFICULTIES = ['mudah', 'sederhana', 'cabaran'];
export const STATUSES = ['live', 'optional', 'draft', 'review'];
export const ID_PATTERN = /^w\d+\.l\d+\.[a-z]+(?:-[a-z]+)*\.[a-z0-9-]+$/;

// Deep equality for plain JSON-like data (answers are small objects/arrays).
export function same(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || !a || !b || Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => same(a[k], b[k]));
}

export function validateDefinition(def) {
  const errors = [];
  for (const k of REQUIRED) if (def?.[k] === undefined || def[k] === null || def[k] === '') errors.push(`missing ${k}`);
  if (errors.length) return errors;
  if (!ID_PATTERN.test(def.id)) errors.push(`bad id ${def.id}`);
  if (!DIFFICULTIES.includes(def.difficulty)) errors.push(`bad difficulty ${def.difficulty}`);
  if (!STATUSES.includes(def.status)) errors.push(`bad status ${def.status}`);
  if (!Array.isArray(def.hints) || def.hints.length !== 3 || def.hints.some((h) => typeof h !== 'string' || !h.trim())) errors.push('hints must be 3 non-empty strings');
  if (!Array.isArray(def.explanation) || !def.explanation.length) errors.push('explanation must be a non-empty list');
  const model = MODELS[def.check?.kind];
  if (!model) { errors.push(`unknown check kind ${def.check?.kind}`); return errors; }
  const pe = model.validateParams(def.parameters);
  if (pe.length) return errors.concat(pe.map((e) => `params: ${e}`));
  const solved = model.solve(def.parameters);
  if (!same(solved, def.answer)) errors.push(`answer ${JSON.stringify(def.answer)} ≠ model ${JSON.stringify(solved)}`);
  return errors;
}

export function validateAll(defs) {
  const seen = new Set(), report = [];
  for (const d of defs) {
    const e = validateDefinition(d);
    if (seen.has(d?.id)) e.push(`duplicate id ${d.id}`);
    seen.add(d?.id);
    if (e.length) report.push({ id: d?.id, errors: e });
  }
  return report;
}
