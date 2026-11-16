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
    // PlayFab Leaderboards (Progression / v2). Scores are run times in ms.
    // Level 1-1 was redesigned (course 'v2'), so its times are NOT comparable
    // with the old course. Each course has its own board:
    //   'denai_l1_time'     classic course: historical records, READ-ONLY here
    //   'denai_l1_time_v2'  current course: the only board this client writes
    // Owner must create in Game Manager (same settings as the classic one):
    //   Statistic   'denai_l1_time_v2'  entity: title_player_account, 1 column, aggregation Min
    //   Leaderboard 'denai_l1_time_v2'  linked to that statistic, sort Ascending
    // Until it exists PlayFab answers LeaderboardNotFound / StatisticNotFound,
    // the dialog says the board is being prepared, and nothing is written to
    // the classic board.
    leaderboards: {
      allTime: 'denai_l1_time_v2',
      weekly: null,            // e.g. 'denai_l1_time_v2_weekly' once a statistic + leaderboard with a weekly reset exist
    },
    classic: 'denai_l1_time',  // archive of the old 1-1 course: never submitted to
    top: 10,
  },
  // Community stats on the main menu (Player Engagement V1).
  //   Statistic   'denai_players'  entity: title_player_account, 1 column, aggregation Max
  //   Leaderboard 'denai_players'  linked to that statistic (any sort)
  // Each player identity writes 1 once, after 15 s of real gameplay; the
  // menu shows PlayFab's EntryCount for that board = unique players, all-time.
  // If the board or EntryCount is missing the counter stays hidden.
  community: { playersBoard: 'denai_players', countAfterMs: 15000, cacheMs: 5 * 60 * 1000 },
  levelId: 'bab1-l1-jejak-taman-fungsi',
  rules: {
    minPlausibleMs: 20000,     // client check only; scores sent from a browser can be faked
    maxRunMs: 2 * 60 * 60 * 1000,
    minSubmitIntervalMs: 15000, // client throttle between score submissions
  },
};
