// DENAI leaderboard configuration — PREPARATION ONLY.
// Nothing here contacts a server. `provider: 'mock'` means the UI shows
// clearly labelled sample rows plus the player's own LOCAL personal best.
//
// PlayFab Title ID is a public identifier (it ships in every PlayFab client),
// NOT a credential. The title's Secret Key must NEVER be placed in this repo
// or in any browser code; score writes will go through a server function
// (CloudScript / Azure Function) that holds it. See
// docs/leaderboard/ARCHITECTURE.md.
export const LEADERBOARD_CONFIG = {
  provider: 'mock',            // 'mock' | 'playfab' (future) — do not switch without the backend in place
  playfab: {
    titleId: '1FD1D5',
    enabled: false,            // hard off: no SDK is loaded, no request is made
    leaderboards: {            // planned Leaderboards v2 definitions (not yet created)
      allTime: 'denai_l1_time_alltime',
      weekly: 'denai_l1_time_weekly',
    },
  },
  levelId: 'bab1-l1-jejak-taman-fungsi',
  rules: {
    minPlausibleMs: 20000,     // client hint only; the server re-checks with its own model
    maxRunMs: 2 * 60 * 60 * 1000,
  },
};
