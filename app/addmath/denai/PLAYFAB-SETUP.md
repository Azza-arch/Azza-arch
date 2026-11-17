# DENAI · PlayFab setup for Player Engagement V1

Title ID `1FD1D5` is public. The Secret Key is **never** placed in this repo or in browser code.
Everything below is done by the title owner in PlayFab Game Manager.

## Current state (observed 2026-11-16, read-only requests)

| Name | Purpose | Exists in production? |
|---|---|---|
| `denai_l1_time` | Level 1-1 **classic** course (old map). Historical records. | yes (existing) |
| `denai_l1_time_v3` | Level 1-1 **current** course (redesigned map) | **no** (`GetLeaderboard` → 404) |
| `denai_players` | Unique player counter for the main menu | **no** (`GetLeaderboard` → 404) |

Until the two missing items exist, the game behaves safely: the menu hides the player count,
says the new-course ranking opens soon, the victory panel saves results on the device only, and
nothing is written to the classic board.

## 1. Statistic + leaderboard `denai_l1_time_v3`

(World 1 V3 course. `denai_l1_time_v2` is skipped: it was never created and its course is replaced.)

Same settings as `denai_l1_time`:

- Statistic: name `denai_l1_time_v3`, entity type `title_player_account`, 1 column, aggregation **Min**.
- Leaderboard: name `denai_l1_time_v3`, linked to that statistic, sort **Ascending** (fastest first), no reset.

Keep `denai_l1_time` unchanged as the archive. Do **not** copy its rows into v2: the courses differ.

## 2. Statistic + leaderboard `denai_players`

- Statistic: name `denai_players`, entity type `title_player_account`, 1 column, aggregation **Max**.
- Leaderboard: name `denai_players`, linked to that statistic (sort does not matter), no reset.

The game writes `1` once per player identity after 15 s of real gameplay. The menu shows the
leaderboard's `EntryCount` (PlayFab's own count of entries) = unique players, all-time.
If a response does not carry `EntryCount`, the counter stays hidden — it is never estimated.

## 3. API access

Client entity tokens must be allowed to call `Statistic/UpdateStatistics` for both statistics and
`Leaderboard/GetLeaderboard` / `GetLeaderboardAroundEntity` (the same policy that already lets the
current build submit `denai_l1_time`).

## What "a player" means

One anonymous PlayFab account = one browser profile on one device (random id in `localStorage`).
The same person on two devices, or after clearing site data, counts twice. Reloads and later
sessions on the same browser do not count again.

## Integrity limits (client-only validation)

Scores are sent from the browser, so a determined user can fake one. Current controls:
fresh, uninterrupted, complete runs only; 20 s minimum and 2 h maximum; only a personal best
better than the one already sent; at most one accepted write per 15 s; nickname length,
characters and a word filter (PlayFab also enforces unique display names).
For stronger protection, move submission to a CloudScript / Azure Function that checks run
data server-side, and remove client write access to the statistics.

## Test runs

Automated browsers (`navigator.webdriver`) never contact PlayFab; the browser tests answer PlayFab
with a local fake. Before this guard existed, regression runs on 2026-11-16 made read-only calls to
the production title and created a small number (under 15) of anonymous player accounts with no
display name and no statistics. They do not appear on any leaderboard; they can be deleted in
Game Manager → Players if desired.
