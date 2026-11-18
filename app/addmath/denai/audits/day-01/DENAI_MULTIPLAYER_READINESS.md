# DENAI — Multiplayer Readiness (Day 01, audit only — nothing implemented)

## Current architecture vs multiplayer needs
| Area | Today | Ready? |
|---|---|---|
| Backend | None. Static Cloudflare Pages site; PlayFab **client** API for leaderboards only | ✗ no realtime transport |
| Player state | One `this.player` per scene, created in `core/player.js`; motion reads local keyboard/touch in `player-motion.js` | ✗ single-player assumptions (camera follows one body, `uiLocks` per scene) |
| Level state | Puzzle state lives in the scene + localStorage stores; models are **pure functions** (`sluice-model`, `workshop-model`, `supply-quest`) | ✓ models are reusable server-side as-is |
| Question state | Fixed per level (1-2/1-3) or variant id (1-1) | partial — needs seeded variants |
| Session | `run` object with `runId`, `runSeed` (1-1); separate campaign stores for 1-2/1-3 | partial |
| Input | Direct key polling in `update()`; no command/input abstraction | ✗ needs an input layer to send/replay |
| Validation | Client-side only; sanitisers refuse impossible saves | partial — authoritative validation must move to a server for competitive modes |
| Reconnection | n/a | ✗ |
| Determinism | Arcade physics with variable delta | ✗ not lockstep-safe |

## Modes (2–4 players)
| Mode | Sync needs | Fit |
|---|---|---|
| **Math Race** (same puzzle seed, separate worlds, compare times/answers) | session room, shared seed, answer events, results; **no position sync** | **Best first step** — models already pure; positions stay local |
| Team Challenge (each player solves a sub-step, e.g. one sets the valve, one reads the meter) | shared puzzle state, turn events | Good second step |
| Different Question Mode | per-player variants from one seed | Easy once variants are data |
| Cooperative Adventure (shared world, see each other) | 10–20 Hz position snapshots + interpolation, shared interactables, authority | Largest effort; last |

## Recommended technical path (needs owner approval before any dependency)
1. Refactor for multiplayer *without* networking: input-command layer, puzzle definitions as data with seeds, one unified progress profile (see backlog P1/P2).
2. Prototype Math Race on a small authoritative room server. Options compatible with the current Cloudflare hosting: **Cloudflare Durable Objects + WebSockets** (same platform as today) or a managed service (e.g. Colyseus Cloud). Server re-runs the pure models to validate answers.
3. Only then consider position sync for co-op.
Data protection: players are students — no real names, rooms by code, no chat in v1.
