// World 2 save store. Its own key; it never reads or writes a World 1 key or the leaderboard.
//   denai-w2-campaign-v1 = { schemaVersion: 1, levels: { 'w2-l1': LevelRecord, 'w2-l2': LevelRecord, … } }
//   LevelRecord = { completions, completedRuns[], bestMs, coins[] (lifetime), secrets[] (lifetime), run: Run | null }
//   Run = { id, variant, checkpointId, coins[], secrets[], solved: { <station>: bool }, levers: { <station>: {…} }, elapsedMs, completed }
// A run's `variant` (2-2 replays: 'alt') picks the station set its answers are checked against.
// Every value read back is checked against the level's own lists, so a damaged or hand-edited
// save can never unlock a station that was not solved with its real answer. Saving one level never
// drops another level's record (including levels this version does not know yet).
import { STATIONS as S1, buildLevel as build1 } from './level-2-1-data.js';
import { buildLevel as build2, stationsFor as S2for, VARIANTS as V2 } from './level-2-2-data.js';
import { solves } from './peak.js';
import { STATIONS as S3, buildLevel as build3 } from './level-2-3-data.js';
import { solvesRoots } from './roots.js';

export const W2_KEY = 'denai-w2-campaign-v1';
const uniq = (v, allowed) => [...new Set(Array.isArray(v) ? v.filter((x) => allowed.includes(x)) : [])];
const count = (n) => (Number.isSafeInteger(n) && n >= 0 ? n : 0);

// Per level: its stations (levers, options, start, how an answer is recognised) per variant, coins,
// secrets, checkpoints, and which stations a checkpoint stands behind.
const defs = (list, isAnswer) => list.map(({ st }) => ({ id: st.id, levers: st.levers, options: st.options, start: st.start, isAnswer: (c) => isAnswer(st, c) }));
const exact = (st, c) => st.levers.every((n) => c[n] === st.answer[n]);
function def(variants, level, needs) {
  return { variants, stations: variants.base, coins: level.coins.map((c) => c.id), secrets: (level.secrets || []).map((s) => s.id), checkpoints: level.checkpoints.map((c) => c.id), needs };
}
export const LEVEL_DEFS = Object.freeze({
  'w2-l1': def({ base: defs(S1, exact) }, build1(), { 'after-a': ['A'], 'after-b': ['A', 'B'] }),
  'w2-l2': def(Object.fromEntries(V2.map((v) => [v, defs(S2for(v), solves)])), build2(), { 'after-d': ['D'], 'after-e': ['D', 'E'] }),
  'w2-l3': def({ base: defs(S3, solvesRoots) }, build3(), { 'after-g': ['G'], 'after-h': ['G', 'H'] }),
});

export function newRun(levelId = 'w2-l1', variant = 'base') {
  const D = LEVEL_DEFS[levelId], v = D.variants[variant] ? variant : 'base', levers = {}, solved = {};
  for (const s of D.variants[v]) { levers[s.id] = { ...s.start }; solved[s.id] = false; }
  return { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, variant: v, checkpointId: 'entry', coins: [], secrets: [], solved, levers, elapsedMs: 0, completed: false };
}

export function sanitizeRun(raw, levelId = 'w2-l1') {
  if (!raw || typeof raw.id !== 'string') return null;
  const D = LEVEL_DEFS[levelId], run = newRun(levelId, raw.variant);
  run.id = raw.id.slice(0, 100);
  for (const s of D.variants[run.variant]) {
    const lv = {};
    for (const name of s.levers) { const v = raw.levers?.[s.id]?.[name]; lv[name] = s.options[name].includes(v) ? v : s.start[name]; }
    // a station counts as solved only if the saved levers are its real answer (in this run's variant)
    run.solved[s.id] = raw.solved?.[s.id] === true && s.isAnswer(lv);
    run.levers[s.id] = lv;
  }
  // checkpoints are only valid behind solved stations
  const ok = (cp) => (D.needs[cp] || []).every((id) => run.solved[id]);
  const cp = D.checkpoints.includes(raw.checkpointId) ? raw.checkpointId : 'entry';
  run.checkpointId = ok(cp) ? cp : D.checkpoints.filter(ok).at(-1);
  run.coins = uniq(raw.coins, D.coins);
  run.secrets = uniq(raw.secrets, D.secrets);
  run.elapsedMs = Math.max(0, Math.min(Number(raw.elapsedMs) || 0, 86400000));
  run.completed = raw.completed === true && D.variants[run.variant].every((s) => run.solved[s.id]);
  return run;
}

function sanitizeRecord(lv, levelId) {
  lv = lv || {};
  return {
    completions: count(lv.completions),
    completedRuns: uniq(lv.completedRuns, Array.isArray(lv.completedRuns) ? lv.completedRuns.filter((x) => typeof x === 'string') : []).slice(-50),
    bestMs: Number.isFinite(lv.bestMs) && lv.bestMs > 0 ? lv.bestMs : null,
    coins: uniq(lv.coins, LEVEL_DEFS[levelId].coins),
    secrets: uniq(lv.secrets, LEVEL_DEFS[levelId].secrets),
    run: sanitizeRun(lv.run, levelId),
  };
}

export function createW2Store(storage) {
  const read = () => { try { return JSON.parse(storage?.getItem(W2_KEY) || 'null'); } catch { return null; } };
  function load() {
    const raw = read(), levels = {};
    for (const id of Object.keys(LEVEL_DEFS)) levels[id] = sanitizeRecord(raw?.levels?.[id], id);
    return { schemaVersion: 1, levels };
  }
  function saveRun(run, levelId = 'w2-l1') {
    if (!LEVEL_DEFS[levelId]) return false;
    const raw = read();
    if (raw?.schemaVersion > 1) return false; // a newer game wrote this: never overwrite it
    const level = load().levels[levelId];
    level.run = sanitizeRun(run, levelId); if (!level.run) return false;
    level.coins = [...new Set([...level.coins, ...level.run.coins])];
    level.secrets = [...new Set([...level.secrets, ...level.run.secrets])];
    if (level.run.completed && !level.completedRuns.includes(level.run.id)) {
      level.completedRuns.push(level.run.id); level.completions++;
      level.bestMs = Math.min(level.bestMs || Infinity, level.run.elapsedMs);
    }
    // keep every other level exactly as stored (also levels a newer release may have added)
    const levels = { ...(raw && typeof raw.levels === 'object' && raw.levels ? raw.levels : {}), [levelId]: level };
    try { storage.setItem(W2_KEY, JSON.stringify({ schemaVersion: 1, levels })); return true; } catch { return false; }
  }
  return { load, saveRun };
}
