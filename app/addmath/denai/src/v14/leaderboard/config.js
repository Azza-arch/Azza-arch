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
    // Level 1-1 course versions are NOT comparable, so each has its own board:
    //   'denai_l1_time'     classic course: historical records, READ-ONLY here
    //   'denai_l1_time_v3'  World 1 V3 course (storeroom + purchase mission):
    //                       the only board this client writes. ('_v2' was
    //                       never created and is skipped.)
    // Owner must create in Game Manager (same settings as the classic one):
    //   Statistic   'denai_l1_time_v3'  entity: title_player_account, 1 column, aggregation Min
    //   Leaderboard 'denai_l1_time_v3'  linked to that statistic, sort Ascending
    // Until it exists PlayFab answers LeaderboardNotFound / StatisticNotFound,
    // the dialog says the board is being prepared, and nothing is written to
    // the classic board.
    leaderboards: {
      allTime: 'denai_l1_time_v3',
      weekly: null,            // e.g. 'denai_l1_time_v3_weekly' once a statistic + leaderboard with a weekly reset exist
    },
    classic: 'denai_l1_time',  // archive of the old 1-1 course: never submitted to
    top: 10,
  },
  // Community stats on the main menu (Player Engagement V1).
  //   Statistic   'denai_players'  entity: title_player_account, 1 column, aggregation Max
  //   Leaderboard 'denai_players'  linked to that statistic (any sort)
  // Each player identity writes 1 once when a level starts; the menu shows
  // PlayFab's EntryCount for this counter, not the title's total accounts.
  // If the board or EntryCount is missing the counter stays hidden.
  community: { playersBoard: 'denai_players', cacheMs: 5 * 60 * 1000 },
  // Product analytics (Growth plan, Phase A). OFF until the owner has
  // reviewed the event list and checked the events arrive in Game Manager.
  // Anonymous PlayFab entity only; no names, e-mail or free text.
  analytics: { enabled: false, namespace: 'custom.denai', flushEvery: 10, flushMs: 30000, purchasesLive: false },
  levelId: 'bab1-l1-jejak-taman-fungsi',
  rules: {
    minPlausibleMs: 20000,     // client check only; scores sent from a browser can be faked
    maxRunMs: 2 * 60 * 60 * 1000,
    minSubmitIntervalMs: 15000, // client throttle between score submissions
  },
};
