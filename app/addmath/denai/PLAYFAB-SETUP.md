# DENAI · PlayFab setup for Player Engagement V1

Title ID `1FD1D5` is public. The Secret Key is **never** placed in this repo or in browser code.
Everything below is done by the title owner in PlayFab Game Manager.

## Current state

| Name | Purpose | Exists in production? |
|---|---|---|
| `denai_l1_time` | Level 1-1 leaderboard; active board for current client | yes (existing; owner confirmed) |
| `denai_l1_time_v3` | Separate redesigned-course board | Not used; not available |
| `denai_players` | Unique player counter for the main menu | Available; latest reported game view shows 2 entries |

The game writes new eligible Level 1-1 records to the existing `denai_l1_time` board. This
reuses its historical entries, so times from earlier course versions may appear alongside new
times. The player counter is separate from the total PlayFab account count: it includes
identities that started a level after the counter was enabled. Existing accounts are added only
when they start a level again; there is no safe client API to read or backfill the title's total
account count.

## 1. Statistic + leaderboard `denai_l1_time`

This existing board is configured in PlayFab Game Manager and is the board the client now reads
and updates. No separate V3 board is required.

## 2. Statistic + leaderboard `denai_players`

- Statistic: name `denai_players`, entity type `title_player_account`, 1 column, aggregation **Max**.
- Leaderboard: name `denai_players`, linked to that statistic (sort does not matter), no reset.

The game writes `1` once per player identity when they start a level. The menu shows the
leaderboard's `EntryCount` (PlayFab's own count of entries) = unique players recorded by this
counter, all-time. The counter is not retroactive: existing players are added when they start
playing on a version with this counter.
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
