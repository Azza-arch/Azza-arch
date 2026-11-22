# V8 Phase 7 — Replayability Tests

The brief's core distinction: **temporary run state** (checkpoint reached,
gates solved, coins collected — all reset by a fresh run) vs. **permanent
discovery progress** (secrets found — must survive every kind of "play
again" except an explicit, confirmed full wipe).

## How the distinction is implemented

- `solvedGates`, `collectedCoinIds`, `checkpointIndex` are reset to empty
  by `init()` on every scene construction, and only re-populated when the
  player explicitly clicks **Continue** (`continueFromSave()`). A
  Restart/Replay recreates the scene without going through Continue, so
  these fields come back empty — the existing, pre-Phase-7 behavior,
  unchanged.
- `discoveredSecrets` is loaded **unconditionally** at the top of
  `create()`, before anything else runs — regardless of whether the
  player is continuing, starting fresh, or the scene was just
  Restarted/Replayed. It is never reset by `init()`'s per-construction
  defaults taking effect, because `create()` always overwrites it
  immediately afterward from whatever is on disk.
- The only code path that explicitly clears `discoveredSecrets` is the
  "Mula petualangan baharu" (Start New Adventure) button handler — a
  separate, confirmed, deliberate action distinct from Restart/Replay.

## Test results (`tests/v8_phase7_secrets.py`)

| Scenario | Expectation | Result |
|---|---|---|
| **Replay Completed Level** (`#replay`, confirmed) after finding Si Oyen | Run-state (`solvedGates`) resets to empty; Si Oyen stays discovered | `solvedGates.size === 0` AND `discoveredSecrets.has('secret-oyen') === true` after the confirmed Replay. **Pass.** |
| **Restart Current Run** (`#restart`, confirmed) after finding the cave treasure | Secret survives | `discoveredSecrets.has('secret-cave-treasure') === true` after the confirmed Restart. **Pass.** |
| **Start New Adventure** (`#new-adventure`, confirmed) after finding Si Oyen | This is the one action that DOES wipe secrets — by design, documented | `discoveredSecrets.size === 0` after confirming New Adventure. **Pass** (verified intentional, not a bug — see rationale below). |
| View total found count | Pause menu's `#secrets-count` | Reads "1/3", "2/3" etc. accurately at every point tested. **Pass.** |
| Revisit an unfinished discovery after completion | Completing the level does not lock out undiscovered secrets | Not a separate code path — `nearestSecret()`/`discoverSecret()` have no dependency on `mode==='complete'` having happened; a player who finishes the level and keeps exploring (or replays) can still find the remaining secrets exactly as before. Implicitly covered by the "zero secrets" and "Replay" scenarios above exercising the same interaction code after `finish()`/replay. |
| No accidental deletion of permanent discoveries via Replay | Repeated Replay cycles | Combined with Phase 6 test #16's repeated reload/continue cycling (unaffected by Phase 7, still passes) and the dedicated Replay test above — discoveries are never silently dropped. **Pass.** |

## Why "Start New Adventure" wiping secrets is intentional, not a bug

The brief's explicit instruction is: *"Do not reset secrets merely because
a player chooses Replay Completed Level."* It calls out **Replay**
specifically, not every possible reset action. "Mula petualangan baharu"
is a distinct, separately-labeled, confirmation-gated action (inherited
from Phase 6) whose entire purpose is "erase my saved progress and start
completely over" — it already clears `solvedGateIds`/`collectedCoinIds`/
`checkpointId` via `SaveManager.clear()`, so clearing discovered secrets
along with it is consistent with what that button already promises the
player in its own confirmation text ("...akan memadam kemajuan yang
disimpan" — "...will erase your saved progress"). Treating secrets as
exempt from that one specific action, while still fully honoring the
"survives Replay/Restart" requirement, is documented explicitly in
`secrets-implementation-report.md`'s placement rationale and confirmed
behaviorally by the test table above.

## Final state

`git status --porcelain app/addmath/rooftop/` → `?? app/addmath/rooftop/`
(unchanged — still entirely untracked, nothing committed or deployed).
