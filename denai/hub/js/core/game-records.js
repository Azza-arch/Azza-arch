// Game records — a READ-ONLY view of the DENAI game's own saves (same origin).
// The hub never writes, clears or migrates these keys, and nothing here
// changes a mastery level: game records stay separate from academic evidence.
// Shapes mirror app/addmath/denai/src/v14/menu/progress.js (World 1 only).
import { GAME_READ_ONLY } from './keys.js';

const read = (key) => {
  if (!GAME_READ_ONLY.includes(key)) return null;
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
};
const n = (v) => (Number.isSafeInteger(v) && v >= 0 ? v : 0);
const ms = (v) => (Number.isFinite(v) && v > 0 && v < 86400000 ? v : null);
const running = (run) => !!run && typeof run === 'object' && run.completed !== true
  && ((Number(run.elapsedMs) || 0) > 0 || (run.checkpointId && run.checkpointId !== 'entry') || (Array.isArray(run.coins) && run.coins.length > 0));

/** World 1 levels keyed by game number ('1-1', '1-2', '1-3'): { done, completions, running, bestMs }. */
export function gameRecords() {
  const profile = read('denai-profile-v1'), save = read('denai-save-v14'), legacy = read('denai-records-v14');
  const camp = read('denai-campaign-v1'), l3 = read('denai-l3-campaign-v1');
  const p1 = profile?.levels?.['w1-l1'] || {};
  const c1 = Math.max(n(p1.completions), save?.completed === true ? 1 : 0, n(legacy?.['bab1-l1-jejak-taman-fungsi']?.completions));
  const l2 = camp?.levels?.['w1-l2'] || {};
  const out = {
    '1-1': { completions: c1, running: !!save && save.completed !== true, bestMs: p1.best?.course === 'v3' ? ms(p1.best?.timeMs) : null },
    '1-2': { completions: n(l2.completions), running: running(l2.run), bestMs: ms(l2.bestMs) },
    '1-3': { completions: n(l3?.completions), running: running(l3?.run), bestMs: ms(l3?.bestMs) },
  };
  for (const r of Object.values(out)) r.done = r.completions > 0;
  return out;
}

export const timeText = (t) => { if (!t) return ''; const s = Math.round(t / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
