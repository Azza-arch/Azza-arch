// Menu progress: a READ-ONLY view over the existing stores and unlock rule.
// No new save key, no schema change. Sources:
//   1-1  SaveManager ('denai-save-v14') + profile ('denai-profile-v1')
//   1-2  createCampaignStore ('denai-campaign-v1')
//   1-3  createInverseStore ('denai-l3-campaign-v1')
//   unlock: canPlay() in levels/registry.js (Adventure order 1-1 → 1-2 → 1-3)
import {SaveManager} from '../save.js';
import {loadProfile,LEVEL_KEY} from '../progress.js';
import {createCampaignStore} from '../core/campaign-store.js';
import {createInverseStore} from '../core/inverse-campaign.js';
import {LEVELS,canPlay} from '../levels/registry.js';
import {createW2Store} from '../levels/w2/campaign.js';

// Status values used by the menu.
export const STATUS = Object.freeze({ COMPLETED: 'completed', IN_PROGRESS: 'in-progress', AVAILABLE: 'available', LOCKED: 'locked', COMING_SOON: 'coming-soon' });

// Worlds shown on the map. Only World 1 has playable levels; the rest are
// listed so the map is honest about what exists. Node positions are % of the
// map image (assets/world-map/world-map.png, 64 × 16 tiles).
export const WORLDS = Object.freeze([
  { id: 'w1', num: '1', name: 'Hutan & Sungai', topic: 'Fungsi', state: 'playable', node: [7.5, 58], zone: [0, 19.5] },
  { id: 'w2', num: '2', name: 'Lembah Batu Kapur', topic: 'Fungsi Kuadratik', state: 'playable', node: [28.9, 21], zone: [19.5, 39],
    levels: [['w2-l1', '2-1', 'Jejak Lengkung'], ['w2-l2', '2-2', 'Lembah Puncak'], ['w2-l3', '2-3', 'Gerbang Parabola']] },
  { id: 'w3', num: '3', name: 'Kilang & Lombong', topic: 'Sistem Persamaan', state: 'soon', node: [50.8, 52], zone: [39, 59] },
  { id: 'w4', num: '4', name: 'Tanah Tinggi Ladang', topic: 'Indeks, Surd & Logaritma', state: 'soon', node: [75.8, 27], zone: [59, 78] },
]);

const NUM = { 'w1-l1': '1-1', 'w1-l2': '1-2', 'w1-l3': '1-3' };

export function worldOneLevels({ storage = globalThis.localStorage, localPreview = false } = {}) {
  const save = SaveManager.load();
  const l1Profile = loadProfile().levels[LEVEL_KEY];
  const campaign = createCampaignStore(storage).load();
  const l2 = campaign.levels['w1-l2'];
  const l3 = createInverseStore(storage).load();
  const raw = {
    'w1-l1': { completions: Math.max(l1Profile.completions || 0, save?.completed ? 1 : 0), running: !!save && !save.completed, best: l1Profile.best?.timeMs ?? null },
    'w1-l2': { completions: l2.completions || 0, running: !!l2.run && !l2.run.completed && (l2.run.elapsedMs > 0 || l2.run.checkpointId !== 'entry' || l2.run.coins.length > 0), best: l2.bestMs ?? null },
    'w1-l3': { completions: l3.completions || 0, running: !!l3.run && !l3.run.completed && (l3.run.elapsedMs > 0 || l3.run.checkpointId !== 'entry' || l3.run.coins.length > 0), best: l3.bestMs ?? null },
  };
  // The same completion list the existing launchers pass to canPlay().
  const completedIds = [campaign.levels['w1-l1'].completed || raw['w1-l1'].completions > 0 ? 'w1-l1' : null, raw['w1-l2'].completions ? 'w1-l2' : null, raw['w1-l3'].completions ? 'w1-l3' : null].filter(Boolean);
  return LEVELS.filter((lv) => lv.id.startsWith('w1-')).map((lv) => {
    const r = raw[lv.id], unlocked = canPlay(lv.id, completedIds, { localPreview });
    const status = r.running && unlocked ? STATUS.IN_PROGRESS : r.completions > 0 ? STATUS.COMPLETED : unlocked ? STATUS.AVAILABLE : STATUS.LOCKED;
    return { id: lv.id, num: NUM[lv.id], title: lv.title, status, unlocked, completions: r.completions, running: r.running, best: r.best, requires: lv.requires ? NUM[lv.requires] : null };
  });
}

// "Main / Sambung" target: the most advanced level with a run in progress;
// otherwise the first unlocked level not yet completed; null when every
// World 1 level is complete (the menu then opens the World Map instead).
export function currentLevel(levels) {
  const running = levels.filter((l) => l.status === STATUS.IN_PROGRESS);
  if (running.length) return running.at(-1);
  return levels.find((l) => l.unlocked && l.completions === 0) ?? null;
}

// World 2 (Lembah Batu Kapur): 2-1 and 2-2 are playable (own pages, one save key
// denai-w2-campaign-v1); 2-3 is listed as coming soon. 2-1 opens after 1-1, 2-2 after 2-1.
export function worldTwoLevels({ storage = globalThis.localStorage, localPreview = false } = {}) {
  const l1Done = worldOneLevels({ storage, localPreview }).find((l) => l.id === 'w1-l1')?.completions > 0;
  const recs = createW2Store(storage).load().levels;
  const done = [l1Done ? 'w1-l1' : null, recs['w2-l1'].completions > 0 ? 'w2-l1' : null].filter(Boolean);
  const row = (id, num, title, requires) => {
    const rec = recs[id], run = rec.run;
    const running = !!run && !run.completed && (run.elapsedMs > 0 || run.checkpointId !== 'entry' || Object.values(run.solved).some(Boolean));
    const unlocked = canPlay(id, done, { localPreview });
    const status = running && unlocked ? STATUS.IN_PROGRESS : rec.completions > 0 ? STATUS.COMPLETED : unlocked ? STATUS.AVAILABLE : STATUS.LOCKED;
    return { id, num, title, status, unlocked, completions: rec.completions, running, best: rec.bestMs, requires };
  };
  return [
    row('w2-l1', '2-1', 'Jejak Lengkung', '1-1'),
    row('w2-l2', '2-2', 'Lembah Puncak', '2-1'),
    { id: 'w2-l3', num: '2-3', title: 'Gerbang Parabola', status: STATUS.COMING_SOON, unlocked: false, completions: 0 },
  ];
}
export const levelsOfWorld = (id, opts) => (id === 'w1' ? worldOneLevels(opts) : id === 'w2' ? worldTwoLevels(opts) : []);
