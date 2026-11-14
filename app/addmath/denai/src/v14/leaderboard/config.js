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
    // PlayFab Leaderboards (Progression / v2). Create in Game Manager:
    //   Statistic   'denai_l1_time'  entity: title_player_account, 1 column, aggregation Min
    //   Leaderboard 'denai_l1_time'  linked to that statistic, sort Ascending (lowest time first)
    // Scores are the run time in milliseconds.
    leaderboards: {
      allTime: 'denai_l1_time',
      weekly: null,            // e.g. 'denai_l1_time_weekly' once a statistic + leaderboard with a weekly reset exist
    },
    top: 10,
  },
  levelId: 'bab1-l1-jejak-taman-fungsi',
  rules: {
    minPlausibleMs: 20000,     // client check only; scores sent from a browser can be faked
    maxRunMs: 2 * 60 * 60 * 1000,
  },
};
