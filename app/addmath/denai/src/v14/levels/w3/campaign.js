// World 3 save store. Its own key; it never reads or writes a World 1 / World 2 key or the leaderboard.
//   denai-w3-campaign-v1 = { schemaVersion: 1, levels: { 'w3-l1': LevelRecord, … } }
//   LevelRecord = { completions, completedRuns[], bestMs, coins[] (lifetime), secrets[] (lifetime), run: Run | null }
//   Run = { id, checkpointId, coins[], secrets[], solved: { <station>: bool }, levers: { <station>: {…} }, elapsedMs, completed }
// Every value read back is checked against the level's own lists, so a damaged or hand-edited save
// can never unlock a station that was not solved with a real answer. Saving one level never drops
// another level's record (including levels this version does not know yet).
import { buildLevel, LEVEL_IDS } from './maps.js';
import { solves } from './systems.js';

export const W3_KEY = 'denai-w3-campaign-v1';
const uniq = (v, allowed) => [...new Set(Array.isArray(v) ? v.filter((x) => allowed.includes(x)) : [])];
const count = (n) => (Number.isSafeInteger(n) && n >= 0 ? n : 0);

export const LEVEL_DEFS = Object.freeze(Object.fromEntries(LEVEL_IDS.map((id) => {
  const L = buildLevel(id);
  return [id, {
    stations: L.stations.map(({ st }) => ({ id: st.id, levers: st.levers, options: st.options, start: st.start, isAnswer: (c) => solves(st, c) })),
    coins: L.coins.map((c) => c.id), secrets: L.secrets.map((s) => s.id),
    checkpoints: L.checkpoints.map((c) => c.id), needs: Object.fromEntries(L.checkpoints.map((c) => [c.id, c.needs || []])),
  }];
})));

export function newRun(levelId) {
  const D = LEVEL_DEFS[levelId], levers = {}, solved = {};
  for (const s of D.stations) { levers[s.id] = { ...s.start }; solved[s.id] = false; }
  return { id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`, checkpointId: 'entry', coins: [], secrets: [], solved, levers, elapsedMs: 0, completed: false };
}

export function sanitizeRun(raw, levelId) {
  if (!raw || typeof raw.id !== 'string' || !LEVEL_DEFS[levelId]) return null;
  const D = LEVEL_DEFS[levelId], run = newRun(levelId);
  run.id = raw.id.slice(0, 100);
  for (const s of D.stations) {
    const lv = {};
    for (const name of s.levers) { const v = raw.levers?.[s.id]?.[name]; lv[name] = s.options[name].includes(v) ? v : s.start[name]; }
    run.solved[s.id] = raw.solved?.[s.id] === true && s.isAnswer(lv); // only a real answer counts
    run.levers[s.id] = lv;
  }
  const ok = (cp) => D.needs[cp].every((id) => run.solved[id]);
  const cp = D.checkpoints.includes(raw.checkpointId) ? raw.checkpointId : 'entry';
  run.checkpointId = ok(cp) ? cp : D.checkpoints.filter(ok).at(-1);
  run.coins = uniq(raw.coins, D.coins);
  run.secrets = uniq(raw.secrets, D.secrets);
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
    secrets: uniq(lv.secrets, LEVEL_DEFS[levelId].secrets),
    run: sanitizeRun(lv.run, levelId),
  };
}

export function createW3Store(storage) {
  const read = () => { try { return JSON.parse(storage?.getItem(W3_KEY) || 'null'); } catch { return null; } };
  function load() {
    const raw = read(), levels = {};
    for (const id of LEVEL_IDS) levels[id] = sanitizeRecord(raw?.levels?.[id], id);
    return { schemaVersion: 1, levels };
  }
  function saveRun(run, levelId) {
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
    const levels = { ...(raw && typeof raw.levels === 'object' && raw.levels ? raw.levels : {}), [levelId]: level };
    try { storage.setItem(W3_KEY, JSON.stringify({ schemaVersion: 1, levels })); return true; } catch { return false; }
  }
  return { load, saveRun };
}
