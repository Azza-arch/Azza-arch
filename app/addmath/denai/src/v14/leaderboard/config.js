// DENAI leaderboard configuration.
// PlayFab Title ID is a public identifier (it ships in every PlayFab client),
// NOT a credential. The title's Secret Key must NEVER be placed in this repo
// or in any browser code.
// Client calls only: anonymous login with a random per-device id, an optional
// display name, and the player's own best time. Nothing is sent until the
// player opens the leaderboard; nothing is ranked until they choose to submit.
export const LEADERBOARD_CONFIG = {
  provider: 'playfab',         // 'playfab' | 'mock' (mock = labelled sample rows, no network)
  playfab: {
    titleId: '1FD1D5',
    enabled: true,
    statistics: {              // PlayFab player statistics (Value = −time in ms; higher = faster)
      allTime: 'denai_l1_time',
      weekly: null,            // set to 'denai_l1_time_weekly' once that statistic exists with a weekly reset
    },
    top: 10,
  },
  levelId: 'bab1-l1-jejak-taman-fungsi',
  rules: {
    minPlausibleMs: 20000,     // client check only; scores sent from a browser can be faked
    maxRunMs: 2 * 60 * 60 * 1000,
  },
};
