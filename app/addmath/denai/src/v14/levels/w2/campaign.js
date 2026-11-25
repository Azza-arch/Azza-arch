// World 2 save store. Its own key; it never reads or writes a World 1 key or the leaderboard.
//   denai-w2-campaign-v1 = { schemaVersion: 1, levels: { 'w2-l1': LevelRecord, 'w2-l2': LevelRecord, … } }
//   LevelRecord = { completions, completedRuns[], bestMs, coins[] (lifetime), run: Run | null }
//   Run = { id, checkpointId, coins[], solved: { <station>: bool }, levers: { <station>: {…} }, elapsedMs, completed }
// Every value read back is checked against the level's own lists, so a damaged or hand-edited
// save can never unlock a station that was not solved with its real answer. Saving one level never
// drops another level's record (including levels this version does not know yet).
import { STATIONS as S1, buildLevel as build1 } from './level-2-1-data.js';
import { STATIONS as S2, buildLevel as build2 } from './level-2-2-data.js';
import { solves } from './peak.js';

export const W2_KEY = 'denai-w2-campaign-v1';
const uniq = (v, allowed) => [...new Set(Array.isArray(v) ? v.filter((x) => allowed.includes(x)) : [])];
const count = (n) => (Number.isSafeInteger(n) && n >= 0 ? n : 0);

// Per level: its stations (levers, options, start, how an answer is recognised), coins, checkpoints,
// and which stations a checkpoint stands behind.
function def(stations, level, needs) {
  return { stations, coins: level.coins.map((c) => c.id), checkpoints: level.checkpoints.map((c) => c.id), needs };
}
export const LEVEL_DEFS = Object.freeze({
  'w2-l1': def(S1.map(({ st }) => ({ id: st.id, levers: st.levers, options: st.options, start: st.start, isAnswer: (c) => st.levers.every((n) => c[n] === st.answer[n]) })),
    build1(), { 'after-a': ['A'], 'after-b': ['A', 'B'] }),
  'w2-l2': def(S2.map(({ st }) => ({ id: st.id, levers: st.levers, options: st.options, start: st.start, isAnswer: (c) => solves(st, c) })),
    build2(), { 'after-d': ['D'], 'after-e': ['D', 'E'] }),
});

export function newRun(levelId = 'w2-l1') {
  const D = LEVEL_DEFS[levelId], levers = {}, solved = {};
  for (const s of D.stations) { levers[s.id] = { ...s.start }; solved[s.id] = false; }
  return { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, checkpointId: 'entry', coins: [], solved, levers, elapsedMs: 0, completed: false };
}

export function sanitizeRun(raw, levelId = 'w2-l1') {
  if (!raw || typeof raw.id !== 'string') return null;
  const D = LEVEL_DEFS[levelId], run = newRun(levelId);
  run.id = raw.id.slice(0, 100);
  for (const s of D.stations) {
    const lv = {};
    for (const name of s.levers) { const v = raw.levers?.[s.id]?.[name]; lv[name] = s.options[name].includes(v) ? v : s.start[name]; }
    // a station counts as solved only if the saved levers are its real answer
    run.solved[s.id] = raw.solved?.[s.id] === true && s.isAnswer(lv);
    run.levers[s.id] = lv;
  }
  // checkpoints are only valid behind solved stations
  const ok = (cp) => (D.needs[cp] || []).every((id) => run.solved[id]);
  const cp = D.checkpoints.includes(raw.checkpointId) ? raw.checkpointId : 'entry';
  run.checkpointId = ok(cp) ? cp : D.checkpoints.filter(ok).at(-1);
  run.coins = uniq(raw.coins, D.coins);
  run.elapsedMs = Math.max(0, Math.min(Number(raw.elapsedMs) || 0, 86400000));
  run.completed = raw.completed === true && D.stations.every((s) => run.solved[s.id]);
  return run;
}

function sanitizeRecord(lv, levelId) {
  lv = lv || {};
  return {
    completions: count(lv.completions),
    completedRuns: uniq(lv.completedRuns, Array.isArray(lv.completedRuns) ? lv.completedRuns.filter((x) => typeof x === 'string') : []).slice(-50),
    bestMs: Number.isFinite(lv.bestMs) && lv.bestMs > 0 ? lv.bestMs : null,
    coins: uniq(lv.coins, LEVEL_DEFS[levelId].coins),
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
