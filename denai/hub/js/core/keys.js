// Registry of every browser-storage key the Learning Hub uses.
// The hub WRITES only the keys in HUB. Game keys are listed so nobody reuses
// them by accident; the hub never writes them (core/game-records.js only reads them).
export const HUB = Object.freeze({
  progress: 'denai-hub-progress-v1',   // real learner record (localStorage)
  demoPersona: 'denai-hub-demo-v1',    // demo mode: which sample learner (localStorage)
  demoMode: 'denai-hub-demo-mode',     // demo mode on for this tab (sessionStorage, set by ?demo=1)
});

export const GAME_READ_ONLY = Object.freeze([
  'denai-save-v14', 'denai-profile-v1', 'denai-records-v14', 'denai-campaign-v1', 'denai-l3-campaign-v1',
]);

export const NOTES_APP = Object.freeze({ progress: 'addmath-progress-v1', review: 'addmath-semak' });
