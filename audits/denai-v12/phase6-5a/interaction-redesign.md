# World interaction proposals

These are design specifications, not implemented behavior. Shared rule: **select in the world → operate → observe → traverse**. Mathematical output must be computed, not faked by an animation. Ordinary selection does not pause movement. Existing animation locks remain initially until a separate safety test establishes that movement during activation is safe.

## B — input blocks beside the lift · PROPOSE

**Physical action:** walk to one of five existing digit-block instances0–4 on the current control bank. E selects that object and slides its digit overlay to the existing control position, borrowing D's visible transfer. Walk to the existing lever and press E to run the lift. This separates configuration from operation and makes the chosen object visible throughout the trial.

**Space/control:** candidate block centers1863/1917/1971/2025/2079 on the existing y1080 bank, using crate9 + digits160–164; no new bodies. These are fit-test positions, not approved placements: the ladder at1890, checkpoint2000 and lever near2070 already compete here. Use a single nearest-object highlight and explicit action priority, not overlapping E targets. If all five cannot remain readable and distinguishable, reject this arrangement rather than widening terrain. A simpler fallback is a world-mounted selector on the existing board, but it provides less physical causality and needs separate review.

**Information:** board shows `f(x)=2x+1`, selected input, and `Sasaran kod: 7`. Start unselected, never at correct3. Output appears after operation; explored pairs remain in notes. Show each stop's code next to its actual stop, as text UI, not invented marker sprites.

**Output:** preserve discrete mapping: 1→top1272, 3→1230, 5→1188, 7→1080, 9→1146. This is a machine lookup table, deliberately not a proportional distance scale. A compact “kod hentian” label is essential; explain the complete table on request.

**Failed experiment:** display true output, move the existing deck to that test stop, retain bank recovery and allow another object selection. Test stops remain non-colliding: mark `Hentian uji — belum boleh dipijak`, with a clearly inactive appearance. Do not turn them into apparently solid landing invitations. **Success:** output7 settles, collider becomes safe, player boards/crosses; no automatic traversal.

**Panel/help/mobile:** no full panel for routine use. `Bantuan` opens an optional paused sheet with hint then worked explanation, preserving focus and current selection. Touch player walks with existing arrows and taps Guna near a highlighted object/lever; no tiny sprite hit targets or drag precision. Reject the design if portrait cannot show selected input and result without hiding the bank edge. Complexity M–L; block fit is the first prototype gate.

## C — walk the pattern · PROPOSE

**Physical action:** ascend the existing ladder and inspect four observation points along the deck. Each reuses a digit160–163 and board/sign art; E reveals the output for that input. Suggested centers1566,1674,1782,1836 are provisional: checkpoint/coin1566 and reward1836 need vertical separation and must remain visible. Keep the walking plane clear; these are non-solid controls, not floating stepping stones.

**Information:** show only discovered pairs on a single row: `0→1`, then `1→3`, etc. Unknown outputs remain `?`. After two observations, brief optional line: “Input naik satu. Output pula?” No new answer-entry step.

**Output/failure:** every domain input0–3 produces its valid output1/3/5/7. There is no wrong experiment. Re-inspecting an already recorded point repeats its result without extra progress, reward or dialogue. **Success:** all four distinct pairs reveal the +2 pattern and enable the existing c-return coin; player still walks/jumps to collect it. The pattern is discovered through traversal; do not invent a pattern exam to justify a reward.

**Panel/help/mobile:** no full panel. Existing notes retain the paired values and optional formula explanation. Guna inspects the closest highlighted point; same logic as keyboard E, with no automatic pickup substituting for inspection. Continue restores the recorded set and unlocked reward. Complexity M. If the points crowd the deck, use two existing board locations with two clearly separated observations each; do not add platforms or stretch the loop.

## E — retain the two-station experiment · KEEP + MODIFY

**Physical action/control:** retain walking to a station, E/Guna to choose the first function, then walking to5238 and operating the lever. Do not replace this with a new order popup. Retain the existing input3 and 19/15 results.

**Information:** distinguish *function identity* from *processing position*. Existing boards become `Peringkat 1: F` / `Peringkat 2: G`, or their reversed assignments. Selection at a board sets the complete order and updates both labels. Formula appears with each assigned function. This explicitly models configurable processing stages; the left-to-right pipe route does not reverse and must not falsely depict physically swapping pipes.

**Output:** trace input3 through both assigned stages: FG is3→7→19; GF is3→7→15. Both happen to share intermediate7; labels must name F/G so that equality does not hide the different rules. Preserve current flow animation and pool-state response. One result sentence: `Output 15 · sasaran 19 · cuba susunan lain`.

**Failure/success:**15 gives the existing partial pool state and safe retry;19 fills the model reservoir and settles the crossing. No claim that19 is litres or pressure. Full panel unnecessary. Formula, domain and worked composition remain under on-demand Bantuan/notes; default help must not reveal FG as the answer before a trial.

**Mobile:** same stage/lever Guna interaction. Keep a compact screen-safe selected-order readout when the other stage is off-screen; this is observation, not a two-button answer form. Do not require seeing both stations simultaneously. Complexity M, limited to labels, feedback and support entry; preserve corrected pipe geometry and state machine.

## G — configure one bridge, operate one lever · PROPOSE

The bank is only256 px wide: ten number blocks would be cramped. Reuse the current sign/control at7336 and lever at7390; do not invent two large machines or move controls across the locked river.

**Physical action/control, first lock:** approach the sign and E engages a mounted numeric selector. Up/down adjusts x0–9; E releases it, A/D walking also leaves adjustment mode, Escape cancels without applying. Space still jumps and cancels adjustment. No automatic answer evaluation while turning the selector. Walk to the existing lever and E tests the configured value. Clear any held input on mode exit; selector mode must never steal ladder controls elsewhere.

**Information/output:** sign shows `h(x)=4x−3 · sasaran17`, selected x, and last *tested* result. After testing4, show13 and keep both bridge/lock safe-state unchanged. After5, show17 and retain the existing lever turn0→−24° and saved first lock. World status becomes `1/2 · tetapkan susunan`; no forced panel reopening.

**Second lock:** return to the same sign; E swaps the two function assignments in a compact world readout, then walk to the lever to test. Input2 and target13 remain visible. The operated result traces `2→4→9` or `2→5→13` beside the existing control. This is a control configuration followed by physical operation, not two answer buttons that instantly solve. Never call composition multiplication.

**Failure/success:**9 retains first lock and allows reconfiguration.13 rotates the same lever−24→−52° and raises the existing bridge; install collision only when settled. Player crosses and reaches the actual goal. One handle provides staged motion, not two fabricated physical latch sprites: use a persistent `1/2`/`2/2` text indicator to make this limitation honest.

**Panel/help/mobile:** no routine panel. On touch, Guna engages selector and exposes two minimum48px increment/decrement controls in the contextual control strip; release/back/walking exits. Order changes by Guna at sign, activation only by Guna at lever. Explicit nearest-target highlighting is mandatory because targets are close. Optional help pauses safely and returns to the same stage; keep both latch explanations accessible after completion. Complexity L.

**Proof this is more than a smaller popup:** world stays visible, player moves between configuration and operation, selecting never submits, last result remains on the mechanism, and actual crossing remains the objective. If playtesting still feels like an exam, do not add more prompts: reconsider whether configuration feels connected to the lever within the asset/space limit.

## Shared acceptance

- A first-time player can identify what changed after a non-target input without opening help.
- Desktop and touch use the same mathematical/state transitions; no answer deduction from button color or initial value.
- No new mandatory mathematics, new art, terrain or global physics changes.
- Help is reachable by keyboard and touch from the current mechanism and pause notes; explicit request may reveal a worked answer. Close restores focus and safe state.
- Pause, fall, reload and Continue preserve verified progress; transient selectors can reset safely, but collected items and completed gates cannot regress.
- Keep D's current successful rack loop; shorten its support text instead of replacing the physical action. F inverse remains optional with the same domain/image and safe exit.
