// V8 Phase 6 (audits/level-v8/phase6/): a single versioned local save for
// the current solo playthrough. localStorage only — no accounts, no cloud,
// no external API — and a SEPARATE storage key from audio.js's own
// STORAGE_KEY ('lorong-audio-settings-v1'): gameplay progress and audio
// preferences are unrelated concerns, so a corrupt/reset gameplay save can
// never touch audio settings and vice versa.
import { CHECKPOINTS, GATES, COLLECTIBLES, SECRETS } from './level.js';

const STORAGE_KEY = 'lorong-save-v1';
// V8 Phase 7: bumped from 1 to 2 to add discoveredSecretIds. A real (if
// minimal) migration now exists for exactly this step — see
// SUPPORTED_VERSIONS/sanitize() below — rather than Phase 6's documented
// "no migration path yet" limitation. A v1 save (no secrets field at all)
// is accepted, defaulted to zero secrets found, and transparently re-saved
// as v2 on the next writeSave() — nothing about a v1 player's existing
// checkpoint/solved-gate/coin progress is lost or altered.
const SCHEMA_VERSION = 2;
const SUPPORTED_VERSIONS = new Set([1, 2]);
const LEVEL_ID = 'lorong-atas-bumbung-1';

const GATE_IDS = new Set(GATES.map(g => g.id));
const CHECKPOINT_IDS = new Set(CHECKPOINTS.map(c => c.id));
const COIN_IDS = new Set(COLLECTIBLES.map(c => c.id));
const SECRET_IDS = new Set(SECRETS.map(s => s.id));

// Never trust anything read from localStorage as verified game state: every
// field is individually type-checked and cross-referenced against the
// level's OWN current id tables, never inserted into the DOM, never eval'd.
// An unrecognised id (stale data from a different level revision, or hand-
// edited storage) is silently dropped rather than producing an "impossible"
// state like a solved gate that no longer exists in GATES.
function sanitize(raw) {
  if (!raw || typeof raw !== 'object') return null;
  // Any version outside the known set (e.g. a future schema this build
  // predates) has no defined migration and is discarded wholesale, never
  // partially applied.
  if (!SUPPORTED_VERSIONS.has(raw.schemaVersion)) return null;
  if (raw.levelId !== LEVEL_ID) return null;
  const checkpointId = CHECKPOINT_IDS.has(raw.checkpointId) ? raw.checkpointId : null;
  const solvedGateIds = Array.isArray(raw.solvedGateIds)
    ? [...new Set(raw.solvedGateIds.filter(id => GATE_IDS.has(id)))]
    : [];
  const collectedCoinIds = Array.isArray(raw.collectedCoinIds)
    ? [...new Set(raw.collectedCoinIds.filter(id => COIN_IDS.has(id)))]
    : [];
  // Absent entirely on a v1 save — Array.isArray already defaults it to [],
  // the same safe fallback solvedGateIds/collectedCoinIds already use for
  // any missing/older field, migration or not.
  const discoveredSecretIds = Array.isArray(raw.discoveredSecretIds)
    ? [...new Set(raw.discoveredSecretIds.filter(id => SECRET_IDS.has(id)))]
    : [];
  const completed = raw.completed === true;
  const updatedAt = Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0;
  // Always returned tagged as the CURRENT version — load() upgrades a v1
  // save in memory; the next writeSave() persists that upgrade to disk.
  return { schemaVersion: SCHEMA_VERSION, levelId: LEVEL_ID, checkpointId, solvedGateIds, collectedCoinIds, discoveredSecretIds, completed, updatedAt };
}

export const SaveManager = {
  STORAGE_KEY,
  LEVEL_ID,
  SCHEMA_VERSION,

  // Returns a sanitized save object, or null for: no save, corrupted JSON,
  // unsupported schema version, an unknown levelId, or localStorage being
  // unavailable/blocked — every one of these fails gracefully to "no save",
  // never throws into the menu/boot code.
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      let parsed;
      try { parsed = JSON.parse(raw); } catch (e) { return null; }
      return sanitize(parsed);
    } catch (e) { return null; }
  },

  // snapshot must already contain checkpointId/solvedGateIds/
  // collectedCoinIds/completed/updatedAt — the scene always constructs a
  // complete snapshot from its own authoritative state, never a partial
  // merge, so a save can never end up with some fields from one moment and
  // some from another.
  save(snapshot) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: SCHEMA_VERSION, levelId: LEVEL_ID, ...snapshot }));
      return true;
    } catch (e) { return false; } // quota/private-mode/blocked: silently skip, never overwrite a valid prior save with a failed write
  },

  clear() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  },
};
