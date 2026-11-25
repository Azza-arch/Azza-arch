// World 2 save store. Its own key; it never reads or writes a World 1 key or the leaderboard.
//   denai-w2-campaign-v1 = { schemaVersion: 1, levels: { 'w2-l1': LevelRecord } }
//   LevelRecord = { completions, completedRuns[], bestMs, coins[] (lifetime), run: Run | null }
//   Run = { id, checkpointId, coins[], solved: { A, B, C }, levers: { A: {a}, B: {h,k}, C: {k} }, elapsedMs, completed }
// Every value read back is checked against the level's own lists, so a damaged or hand-edited
// save can never unlock a station that was not solved with its real answer.
import { STATIONS, LEVEL_ID, buildLevel } from './level-2-1-data.js';

export const W2_KEY = 'denai-w2-campaign-v1';
const LEVEL = buildLevel();
const COIN_IDS = LEVEL.coins.map((c) => c.id);
const CP_IDS = LEVEL.checkpoints.map((c) => c.id);
const uniq = (v, allowed) => [...new Set(Array.isArray(v) ? v.filter((x) => allowed.includes(x)) : [])];
const count = (n) => (Number.isSafeInteger(n) && n >= 0 ? n : 0);

export function newRun() {
  const levers = {}, solved = {};
  for (const { st } of STATIONS) { levers[st.id] = { ...st.start }; solved[st.id] = false; }
  return { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, checkpointId: 'entry', coins: [], solved, levers, elapsedMs: 0, completed: false };
}

export function sanitizeRun(raw) {
  if (!raw || typeof raw.id !== 'string') return null;
  const run = newRun();
  run.id = raw.id.slice(0, 100);
  for (const { st } of STATIONS) {
    const lv = {};
    for (const name of st.levers) { const v = raw.levers?.[st.id]?.[name]; lv[name] = st.options[name].includes(v) ? v : st.start[name]; }
    // a station counts as solved only if the saved levers are its real answer
    const isAnswer = st.levers.every((n) => lv[n] === st.answer[n]);
    run.solved[st.id] = raw.solved?.[st.id] === true && isAnswer;
    run.levers[st.id] = lv;
  }
  // checkpoints are only valid behind solved stations
  const order = ['entry', 'after-a', 'after-b'], needs = { 'after-a': ['A'], 'after-b': ['A', 'B'] };
  const cp = CP_IDS.includes(raw.checkpointId) ? raw.checkpointId : 'entry';
  run.checkpointId = (needs[cp] || []).every((id) => run.solved[id]) ? cp : order.filter((c) => (needs[c] || []).every((id) => run.solved[id])).at(-1);
  run.coins = uniq(raw.coins, COIN_IDS);
  run.elapsedMs = Math.max(0, Math.min(Number(raw.elapsedMs) || 0, 86400000));
  run.completed = raw.completed === true && STATIONS.every(({ st }) => run.solved[st.id]);
  return run;
}

export function createW2Store(storage) {
  const read = () => { try { return JSON.parse(storage?.getItem(W2_KEY) || 'null'); } catch { return null; } };
  function load() {
    const raw = read(), lv = raw?.levels?.[LEVEL_ID] || {};
    return { schemaVersion: 1, levels: { [LEVEL_ID]: {
      completions: count(lv.completions),
      completedRuns: uniq(lv.completedRuns, Array.isArray(lv.completedRuns) ? lv.completedRuns.filter((x) => typeof x === 'string') : []).slice(-50),
      bestMs: Number.isFinite(lv.bestMs) && lv.bestMs > 0 ? lv.bestMs : null,
      coins: uniq(lv.coins, COIN_IDS),
      run: sanitizeRun(lv.run),
    } } };
  }
  function saveRun(run) {
    const raw = read();
    if (raw?.schemaVersion > 1) return false; // a newer game wrote this: never overwrite it
    const state = load(), level = state.levels[LEVEL_ID];
    level.run = sanitizeRun(run); if (!level.run) return false;
    level.coins = [...new Set([...level.coins, ...level.run.coins])];
    if (level.run.completed && !level.completedRuns.includes(level.run.id)) {
      level.completedRuns.push(level.run.id); level.completions++;
      level.bestMs = Math.min(level.bestMs || Infinity, level.run.elapsedMs);
    }
    try { storage.setItem(W2_KEY, JSON.stringify(state)); return true; } catch { return false; }
  }
  return { load, saveRun };
}
