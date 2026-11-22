from pathlib import Path
import json
p=Path(__file__).parent
run=json.loads((p/'logs/phase4-natural-input.json').read_text())
state=json.loads((p/'logs/phase4-state-checks.json').read_text())
docs={
'phase4-F-G-report.md':f'''# V11 Phase 4 — F/G and Level 1 completion

Implemented all 16 rooms in the existing continuous 8400×1600 world. BUILD_STAGE=4 and BATCH_END=8400. Main route A→B→D→E→F→G ends at the actual door, x8316 / feet972. No Phase 5, multiplayer, leaderboard, other level, commit, push or deployment.

Baseline and backup: `backups/before-phase4/`, `backups/pre-phase4-git-status.txt`. R01–R12 and the corrected Zone E inlet/riser geometry are retained. Earlier working files were already untracked/dirty; unrelated work was preserved.

R13 has two 54px rises to a small wooded ridge, then descending terraces, an optional branch and river overlook checkpoint. R14 is a shallow sheltered passage, 432px wide and 216px below its timber roof, with two permanently usable ladders. It is deliberately an open alcove, not a fabricated cave arch or black rectangle. Its optional inverse puzzle unlocks a real collectible.

R15 has a 324px river gap, separate decorative water, h(x)=4x−3 target17, and the blueprint's exact composition input2→5→13. Both latches persist. Success feedback closes the panel, moves the lever and bridge, and only then creates collision at y972. Total normal transition is about 1.89s (450ms feedback + 680ms lever + 760ms bridge); reduced motion skips the visual travel. Mid-animation reload restores the safe end state.

R16 uses existing door/flag frames on a raised shelf. Interaction completes once, freezes elapsed time, saves completion and shows actual collection/discovery totals, practiced concepts, replay and menu. No fake next level.

Runtime defects caught and repaired during continuation: missing SURFACES import prevented startup; river-final was missing from the composition dispatcher allowlist; F/G Hint controls were hidden; river selection and pressed token disagreed; completion copy still described Phase 1. Source-level tests alone did not detect these runtime failures.

## Evidence

- Node suites `v11_math.test.mjs`, `v11_phase3.test.mjs`, `v11_phase4.test.mjs`: 12/12 passed.
- `phase4_natural_input.py`: PASS; {run['durationSeconds']}s for the entire automated desktop/mobile session, not a human completion estimate. Keyboard movement from fresh A through every main zone, C visit/return, F entry/inverse/reward/exit, wrong/correct finale, bridge movement/crossing, actual door, completed Continue, timer freeze and reward non-duplication.
- `phase4_state_checks.py`: {len(state['checks'])} focused browser scenarios passed. Explicit save fixtures are used for these isolated scenarios; they are not represented as a fresh full traversal.
- Narrow Chromium viewport 390×844: real emulated touch movement, jump, interaction, final puzzle and reduced-motion bridge. Desktop 1440×900.
- Full route reports zero page errors, console errors and failed requests. V10 save sentinel unchanged.
- Actual browser captures and `screenshots/phase4/phase4-A-G-contact-sheet.png` provide A–G evidence.

See `remaining-issues.md` for the limits of this verification. No physical-device or human enjoyment claim is made.
''',
'natural-input-traversal.md':f'''# Phase 4 natural-input traversal

Current executable: `phase4_natural_input.py`; evidence: `logs/phase4-natural-input.json`. PASS, total automated session {run['durationSeconds']} seconds. This includes desktop plus mobile; it is not a human playtime estimate.

Fresh A → crate/plate and bonus ledge → first gap → C mapping inputs0–3 and return → B probe, wrong/correct lift and crossing → D optional service ladder, wrong/correct number span and composition primer → corrected E steps, service passage, coin, pool, wrong/correct composition and crossing → F ridge, lower passage, wrong/correct inverse, reward and opposite ladder → G wrong/correct h input, wrong/correct composition, animated bridge, far bank → goal shelf and E interaction → completion → reload Continue.

The route uses keyboard/touch and visible UI actions. Runtime state is read for waits/assertions; no player teleport, forced gate solve or physics constant change is used in the full route. The mobile subtest explicitly loads an earlier-progress save fixture at G and uses emulated touch from there; it is not a full mobile A–G run.

Additional fixture-based scenarios in `phase4_state_checks.py` / `logs/phase4-state-checks.json`:
'''+''.join(f'- {c}.\n' for c in state['checks'])+'''
Desktop speed280px/s, jump520 and gravity1400 remain unchanged. Ideal apex96.6px; mandatory authored rises are54px. The 324px river remains gated rather than requiring an impossible jump. C and the F lower branch are optional.
''',
'save-compatibility-report.md':'''# Phase 4 Save/Continue

V11 alone uses `lorong-save-v11`. Schema1 now writes layout112 and accepts layouts111/112. Old coordinates are never imported: checkpoint IDs resolve against current safe geometry. Layout111 retains B/D/E gates, C mapping, collectibles, discoveries and elapsed time. Unsupported layout/schema/level is rejected.

Sanitization rejects far-bank checkpoints without both river latches and the bridge. River latches require water-crossing; composition requires the first latch. Completion requires all six mandatory solved IDs. A Phase 3 completed flag cannot falsely complete Phase 4.

The first latch is saved separately. Both final latches are saved before bridge animation, so reload during animation installs the solved bridge at y972 with collision. A locked save has no river collider. Focused Chromium tests exercised both behaviors and Pause/Resume/Restart. Full natural traversal reloads a completed run and verifies completion, earlier water state, optional inverse discovery, gem persistence and absence of a duplicate collectible. Repeated E after completion does not change the saved record; the active timer remains frozen.

Restart replays from A using the existing confirmation; New Adventure retains the existing explicit save-reset semantics. V9/V10 data is not imported or modified; the V10 sentinel survived the full test.
''',
'math-verification.md':'''# Phase 4 mathematics

The approved 16-room blueprint (`../asset-first-review/review.md`, rooms14–15) defines both finale latches; no new answer was invented.

| Puzzle | Domain/input | Calculation | Outcome |
|---|---|---|---|
| F inverse | f(x)=2x+1, domain {0,1,2,3}, image {1,3,5,7} | f(2)=5; f(3)=7 | output7 has original input3 |
| G latch1 | integer choices0–9 | h(4)=13; h(5)=17 | only5 opens latch1 |
| G latch2 | input2, f(x)=2x+1, g(x)=3x−2 | g(f(2))=g(5)=13; f(g(2))=f(4)=9 | f then g opens bridge |

The inverse explanation states one-to-one behavior on the explicit domain and distinguishes inverse mapping from reciprocal1/f(x). Wrong answers retain progress and permit unlimited retries. F/G Hint remains available. Correct feedback displays the solution and intermediate calculations. Main completion does not depend on the optional inverse reward.

Node checks validate final evaluations and save gates. Actual Chromium clicks verify wrong/correct F and G answers and real bridge consequences. Existing D/E mathematical assertions remain passing.
''',
'remaining-issues.md':'''# Remaining issues after Phase 4

All16 rooms exist; the full A–G main route, optional F branch, river mechanism, destination and completed Continue have executable browser evidence. No known blocking math, traversal or save defect remained in the tested paths.

- Human playtesting is still needed for discovery, pacing, difficulty and enjoyment. Bot duration is not a completion-time prediction.
- Mobile evidence is Chromium emulation at390×844, not physical hardware or a full touch A–G journey. Portrait camera reveals less of the river; the existing route strip clips horizontally. Full-screen/HUD cleanup remains Phase5.
- F is an open timber-sheltered alcove, not an enclosed cave. Broad dirt fill and the finale lever pivot can still benefit from an art-direction pass; no false-solid decorative wall was added.
- No cross-browser Safari/Firefox run, physical-device audio assessment or automated contrast audit was performed in this continuation.
- Existing legacy comments/reports may describe prior phases. The Phase4 report, current coordinate export, JSON logs and Phase4 screenshots are the current evidence.

Stop at completed Level1. No commit, push, deployment or Phase5 redesign was performed.
''',
'visual-collision-review.md':'''# Phase 4 visual and collision review

Reviewed actual desktop captures of the F alcove, G locked puzzle and completion, plus390×844 touch/reduced-motion output. The initial deep lower room was revised into a216px-deep sheltered passage with two escape ladders. A real Kenney tree marks the ridge; terrain and original Chill Boy remain asset-based.

Terrain bodies are authored separately from decoration. The alcove floor is y1134, roof y918, width432; its timber roof is a one-way platform. Both ladders remain active without solving. River water frames33/73 have no collision. The bridge spans x7506–7830 and gains a one-way collider only after art reaches y972. Browser assertions verify the top coordinate and every plank at rest; mid-animation reload installs the same safe state.

The destination shelf x8262–8400/y972 is reached by a54px jump from the preceding lower landing. Goal interaction occurs at x8316 after the six required IDs; actual completion screen is captured.

Screenshot index: `screenshots/phase4/phase4-F-R13-overlook.png`, `phase4-F-R14-entrance.png`, `phase4-F-R14-interior.png`, `phase4-F-R14-inverse-reward.png`, `phase4-G-R15-locked.png`, `phase4-G-R15-wrong-h-input.png`, `phase4-G-R15-bridge-moving.png`, `phase4-G-R15-bridge-safe.png`, `phase4-G-R16-destination.png`, `phase4-G-R16-completion.png`, `phase4-mobile-G-reduced-motion.png`, and `phase4-A-G-contact-sheet.png`.

Remaining visual limitations: large terrain interiors retain the incumbent tile grammar; alcove is intentionally open; portrait river preview is limited and existing route strip clips. These are documented rather than claimed visually perfect. Physical-device and human playtesting remain outstanding. No generated concept image substitutes for browser evidence.
'''
}
for name,content in docs.items():(p/name).write_text(content,encoding='utf-8')
asset=p/'asset-frame-map.md';s=asset.read_text(encoding='utf-8-sig');s=s.split('## Zone E pipe-connection correction')[0]
s+='''## Current E correction and Phase 4 F/G

Current E inlet elbow is frame94 at5022,783; its vertical riser frames95/115/115/135 share x5022 through y999. Outlet x5130 uses frame135 and elbow93; the lever remains5238,918. Earlier reservoir-cradle coordinate descriptions are superseded by `../waterworks-reconstruction/latest-connection-review.md` and actual source.

F/G reuse the verified180-frame Kenney catalog: grass tops20–23, dirt4/5 and exposed sides120/121, base141–143; timber48–50 and posts89; ladders71; sign85; plants124; water surface33 and interior73; lever64; checkpoint111/112; destination door130/150 and flag110; optional gem67. Tree uses the existing verified sceneryTree helper. No atlas image or character artwork was edited, and no fake house/gear/cave arch was added.
'''
asset.write_text(s,encoding='utf-8')
print('Updated Phase4 reports from browser evidence.')
