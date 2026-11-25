// World 2 analytics hooks. Same allowlisted events as World 1 (analytics.js): OFF while the owner keeps
// analytics disabled, then nothing is queued or sent. No free text: level id, mode, buckets, counts.
import { track, durationBucket, resumeSession } from '../../analytics.js';

/** A level page started a run: 'continue' (saved run), 'replay' (already finished once) or 'play'. */
export function trackStart(levelId, resumed, completions) {
  const mode = resumed ? 'continue' : completions > 0 ? 'replay' : 'play';
  resumeSession();
  track('level_started', { level: levelId, mode });
  if (mode === 'replay') track('level_replayed', { level: levelId });
}
/** A run was finished (record = the level record read back after saving). */
export function trackDone(levelId, run, record) {
  track('level_completed', { level: levelId, duration_s: durationBucket(run.elapsedMs), coins: run.coins.length, secrets: (run.secrets || []).length, ranked_eligible: false, first_completion: record.completions === 1 });
}
