# V11 final presentation UI architecture

## Readiness boundary

Do the visual implementation after R11–R16 and the final exit are stable. The current build reaches only R10. Keep the current gameplay and math systems in place while preparing the presentation layer; do not alter world geometry or claim that full-game screenshots can exist before E–G are built.

## Viewport and page shell

Make the Phaser game surface the primary application view. Keep a compact, always reachable Add Math return link and a small pause affordance outside or within a safe corner of the game viewport. During play, hide the article-like page heading, footer progress prose and surrounding page chrome. Use a shell sized from the visual viewport (`100dvh` with safe-area insets), disable document scrolling only while the game is active, and restore normal page behavior on exit. Preserve Phaser's existing logical game size and camera; use Phaser scaling to fit the available rectangle without stretching pixel art or changing physics.

Handle desktop, short laptop, mobile portrait and mobile landscape as separate layout constraints. Protect the player, nearby landing area, interaction target and mobile controls from overlay occlusion. A landscape suggestion may appear in portrait when useful, but must never block play or force rotation. Fullscreen remains a user-triggered option.

## State-driven interface

Keep game state in the V11 scene and let a thin DOM presentation controller render it. Do not create a second source of truth for solved gates, checkpoint, collectibles, timers or save data.

| State | Visible interface | Input and focus behavior |
|---|---|---|
| Loading | Canvas and concise loading progress | No gameplay controls until assets and scene are ready |
| Title | Full-viewport title scene, Chill Boy idle, title, Play/Continue, Level Select, Settings, How to Play | Initial focus on Play or Continue; keyboard and touch operable |
| Playing | Compact level/chapter marker, collectible count where relevant, pause, one contextual prompt, touch controls on coarse pointers | DOM controls do not steal Phaser movement input; prompt is proximity and accessibility aware |
| Math interaction | One purpose-built, viewport-fitted math panel with function, selected input, computed output, target, retry, hint and worked solution | Pause world simulation; focus enters panel; Escape/close is safe; correct answer announces briefly then closes automatically |
| Paused | Compact game pause menu: Resume, Restart checkpoint, How to Play, Audio/Settings, Return to title, Add Math | Pause physics, timers, tweens and audio progression; restore prior focus and controls on resume |
| Completion | Game-style summary using actual elapsed time, collected items, discovered secrets and verified learning achievements | Replay and Return to title; show Next only when a playable next level exists |

Each modal is an explicit state transition owned by the presentation controller and scene adapter. Opening one clears held movement/touch inputs. Closing returns focus to the invoking control when it still exists. A correct answer is guarded against duplicate submission and follows the existing safe order: acknowledge, close panel, animate mechanism, enable safe collision, save, restore play.

## Teaching and feedback

Use the environment and object layout to teach first. Show a short movement hint after movement begins and a jump hint near the first relevant gap; fade each once demonstrated. Keep all control explanations in Pause → How to Play. Near an available machine, show one small anchored keyboard `E` or mobile touch prompt, with a subtle target highlight. Suppress it while another higher-priority prompt or modal is active.

Use one notification lane with priority `critical warning > puzzle success > checkpoint > collectible > area`. Replace the current notification rather than stacking it. Fade ordinary area and collectible notifications; retain mathematical explanations inside the math panel. Do not remove function notation, computed wrong answers, hints, or worked solutions.

## Mobile controls and accessibility

Use large, separated left/right, jump and context-sensitive interact controls, with ladder controls visible only near a ladder. Reserve safe-area insets and keep the HUD away from the touch clusters. Interaction prompts should invoke the same scene action as keyboard interaction. Modal buttons meet touch target sizing and remain scroll-free at common portrait and landscape heights where possible.

Honor `prefers-reduced-motion` for mascot/scenery animation, UI transitions, notification movement and nonessential tweening while preserving state-change feedback. Keep focus rings, semantic labels, live announcements for math results and keyboard navigation. Use readable system typography for explanations; pixel styling is decoration, not a reason to reduce legibility.

## Implementation boundaries

- Reuse verified Kenney frames and the existing Chill Boy sprites; do not add unsupported art or imitate a known game menu.
- Keep the DOM responsible for menus, dialogs, text, accessible controls and focus. Keep Phaser responsible for world art, camera and game-state transitions.
- Keep the source map as a composition reference only and the 180-frame catalog as the asset authority. The V11.1 source image is present in the conversation, but the earlier report says its file was not imported into the workspace; do not claim an image-file comparison until an openable project copy exists.
- Preserve save keys, checkpoints, input behavior, math and collision timing. Do not revise geometry to accommodate UI; adjust safe-area layout and overlay placement.
- Avoid final completion statistics until the full route is implemented and values are measured from the actual run.

## Current shell gaps to address in the later pass

The page still has a masthead and footer around the game, while the `welcome` section is an HTML overlay over the canvas. The title card has a controls list and supporting copy, pause text is tailored to the current partial route, and the game shell reserves document space for page-level chrome. Current styling has portrait-specific overrides but the overall viewport-first shell has not yet been delivered. These observations are a design baseline, not a claim that the current tested A–D build is broken.
