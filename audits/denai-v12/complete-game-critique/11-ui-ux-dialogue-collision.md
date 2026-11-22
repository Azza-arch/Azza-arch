# 11 — Complete UI/UX critique

Source of truth: `v12.html` (full DOM, read in full), `world.css`, `presentation.css`, `dialogue.css`, `b/c/e/g-control.css` (all read in full), `presentation.js`, `dialogue-ui.js`, `game.js`'s UI event wiring. Live-verified against 6 captured UI states (`ui-*.jpg`) plus one reproduced bug (`BUG-pause-over-mechanism-stacking.jpg`).

## 8A. UI collision audit

### Confirmed bug: pause dialog stacks on top of an open mechanism panel without closing it

**Root cause, traced to exact lines:** `window.addEventListener('blur',()=>{clearControls();activeScene?.pauseRun();})` (game.js) fires `pauseRun()` on any window focus loss. `pauseRun()`'s own guard is `if(!['playing','mechanism','mechanism-transition'].includes(this.mode)) return;` — **it explicitly allows itself to fire while `mode==='mechanism'`**, i.e., while the `#mechanism` panel (a plain `<div>`, not a native `<dialog>`) is already open and visible. `pauseRun()` then unconditionally calls `$('paused').showModal()`, a native `<dialog>`, which renders in the browser's top-layer above all non-dialog content — **including the still-open, still-visible `#mechanism` div underneath it.**

**Reproduced live** (`BUG-pause-over-mechanism-stacking.jpg`): the "Rehat sekejap" (break reminder) pause dialog is shown dimmed-background-on-top of the fully-intact "Bengkel blok nombor" panel, whose own buttons are still visible (if inert) behind the pause dialog. Any real player who alt-tabs, switches browser tabs, or has a mobile OS notification steal focus while a function-machine panel is open will see this exact double-stacked look.

**Severity assessment, verified not assumed:** Clicking "Sambung Permainan" (Continue) correctly restores `mode='mechanism'` and the panel displays cleanly afterward (`ui-mechanism-panel-D-bengkel.jpg`, captured immediately after resuming from this exact stacked state) — **no state corruption, no soft-lock.** This is a real, easily-reproducible, confusing *visual* bug, not a game-breaking one. Rated P2 in file 15.

### Confirmed gap: two of four world-aside panels are missing a CSS rule the other two have

Direct line-by-line comparison of all four `*-control.css` files:
- `b-control.css` line 9: `body.b-control-visible #notice,body.b-control-visible #zone-toast,body.b-control-visible #mission-indicator,body.b-control-visible #chill-bubble{visibility:hidden}`
- `c-control.css` line 7: `body.c-control-visible #notice,body.c-control-visible #zone-toast,body.c-control-visible #mission-indicator{visibility:hidden}` (missing `#chill-bubble` specifically, present in B's version)
- `e-control.css`: **no equivalent rule exists anywhere in the file.**
- `g-control.css`: **no equivalent rule exists anywhere in the file.**

All four panels render at the identical fixed position (`top:126px; left:50%; transform:translateX(-50%)`), so this is not a hypothetical — it is the same screen real estate every time. In Zones B and C, the panel correctly suppresses the notice toast / zone toast / mission indicator (and, for B only, the Chill Boy speech bubble) while visible. In **Zones E and G, none of these are suppressed** — a zone toast, notice, mission-indicator button, or Chill Boy's dialogue bubble can appear directly behind or overlapping the `#e-control`/`#g-control` panel with no mitigation. This was confirmed via direct source comparison (not a live screenshot — a live repro was attempted and blocked by this audit's own test-harness camera state, disclosed honestly rather than faked; the source-level evidence stands on its own and is unambiguous).

**Fix (not implemented — read-only audit):** add the same one-line suppression rule to `e-control.css` and `g-control.css` that `c-control.css` already has, and consider whether `#chill-bubble` should be suppressed by all four (currently only B does) for consistency.

### Other collision pairs, checked directly

| Pair | Finding |
|---|---|
| Dialogue bubble + HUD | `chill-bubble`'s `placeBubble()` (dialogue-ui.js) actively computes obstacle rectangles for the masthead, mission-indicator, visible touch-control buttons, tutorial/notice/zone-toast, every `SURFACES` entry, and the moving platform, trying five candidate positions and **hiding the bubble entirely rather than overlapping anything** if none are clear. This is a genuinely sophisticated, already-working collision-avoidance system — confirmed by reading the full function, not assumed from behavior. **This is a real strength the owner may not know exists.** |
| Dialogue + math result (world-aside panels) | Covered above — works correctly for B/C, broken for E/G. |
| Dialogue + interact prompt | The in-canvas `prompt` text object and the HTML `chill-bubble` are visually separate layers (canvas vs. DOM) with independent positioning; no collision-avoidance exists *between* them specifically, but in every screenshot captured where both could plausibly appear, they didn't spatially overlap (the prompt sits near the interactable object, the bubble near the player) — not proven impossible to overlap, but no instance found in 28 screenshots. |
| Checkpoint + tutorial | `tutorial` toast and checkpoint notifications (`notify()`) share the same bottom/top toast slots respectively (`#tutorial{bottom:28px}`, `#notice{top:...}` per `world.css`) — different screen regions, confirmed non-overlapping by CSS position alone. |
| Collectible + active machine | No conflict found — collectibles use world-space sprites with no HTML overlay competing for the same screen region as a machine's panel. |
| Pause + mobile controls | `presentation.css` line 21 explicitly hides `.touch-controls` whenever `data-mode` is `mechanism`/`mechanism-transition`/`paused`/`complete` — confirmed correct, touch buttons never sit under a modal. |
| Help + keyboard focus | `installPresentation()`'s Tab-trap logic (presentation.js) correctly scopes Tab cycling to whichever dialog/mechanism panel is topmost — confirmed via source; not independently tested with real keyboard Tab presses in this audit (reasoned from code, not live-verified by pressing Tab repeatedly and observing focus order). |
| Multiple terminals nearby | `nearestTerminal()`'s distance-sort already resolves this by picking the closest match (file 06's D-sign-crowding note is the one residual case, cosmetic only, not a functional collision). |
| Results + background game | The `#complete` dialog is full-viewport (`inset:0; width:100vw; height:100dvh`), confirmed to fully obscure gameplay while open — correct for an end-of-level summary, no partial-overlap issue possible by construction. |

### Display-priority matrix (derived from the above, not asserted independently)

| Priority (highest first) | Element | Hides for |
|---|---|---|
| 1 | Native `<dialog>`s (`paused`, `help`, `complete`, `settings`, `collection`, `level-select`, `secret-note`) | Everything else via browser top-layer — but see the confirmed bug above: this is *too* unconditional, since it doesn't close `#mechanism` first |
| 2 | `#mechanism` (world puzzle panel) | Nothing automatically defers to it except via `mode` gating |
| 3 | World-aside panels (`#b/c/e/g-control`) | Notice/toast/mission-indicator (B, C only — E, G confirmed missing) |
| 4 | `#chill-bubble` | Actively avoids all of the above via `placeBubble()`, B-panel explicitly, others implicitly via its own collision check |
| 5 | `#notice` / `#zone-toast` / `#tutorial` / `#mission-indicator` | Nothing defers to these; they are the "background" layer of the stack |

## 8B. Language review

All 37 lines in `LINES` (dialogue.js) read as natural, age-appropriate, colloquial Malay (e.g., "Eh, macam ada jalan lain dekat bawah tu" — genuinely reads like a teenager's spontaneous remark, not a textbook sentence). No line exceeds roughly 12 words. No line is mathematically inaccurate (every equation/result referenced in dialogue was checked against the actual puzzle math and is correct). No line is repeated verbatim elsewhere (confirmed: 37 unique keys, 37 unique strings, no duplicates).

**Representative weak copy, with a rewrite that preserves all learning content:**

- *Objective text* (`missionObjective()`): "Teroka bukit dan pengangkut." / "Cari laluan melalui bengkel." — these are fine as objectives: short, verb-first, game-like. No change needed.
- *Mechanism rule text* (e.g., D's): "g(x)=3x−2. Berjalan ke rak, pilih blok input dan lihat mesin mengira outputnya. Output 10 menetapkan lintasan selamat." — this is **the one place the UI tone shifts from "game" to "instructions manual."** It correctly separates rule/interaction/target, but reads like a lab worksheet step, not a mission briefing. A game-native rewrite preserving every fact: *Rule:* "g(x) = 3x − 2" (kept as its own line, unambiguous, no change — the equation itself should never be simplified). *Interaction + target*, rewritten shorter and more mission-like: "Pilih blok yang betul. Lintasan terbuka pada output 10." (Pick the right block. The crossing opens at output 10.) — same information, roughly half the words, reads as a mission line rather than a lab instruction.
- *Worked solution text* (e.g., lift's): "2x+1=7\n2x=6\nx=3. Semakan: f(3)=2×3+1=7; mesin memilih preset lintasan 7." — correctly optional (behind a "Langkah kerja" toggle, confirmed never shown by default), so its textbook tone is appropriate *there specifically* — this is the one place exam-style density is fine, because the player opted in.

**Separated by category, confirmed present and distinct in the UI already (a genuine strength, not a gap):**
- Objective → `missionObjective()` / `#objective` (always one short line).
- Interaction → in-canvas `prompt` text ("E · Guna").
- Result → `mechanism-feedback` / world-aside panel status lines.
- Dialogue → `chill-bubble`.
- Hint → `dial-hint` button (one short line, confirmed in `mechanisms.js`'s `dialHint()`).
- Worked explanation → `worked-solution`, opt-in only.

This separation already exists and is well-designed; the specific improvement opportunity is tightening the *rule* line's wording per the example above, not restructuring the system.

## 8C. Visual UI design

**Confirmed, not a subjective first impression:** every UI surface in the game is built from plain HTML — bordered `<div>`/`<dialog>` rectangles, `border-radius`, drop-shadows, and `system-ui`/`ui-monospace` system fonts (confirmed via `presentation.css`'s `:root{font-family:system-ui,sans-serif}` and the `dialog{border:2px solid #ad9b66;border-radius:10px;box-shadow:0 18px 60px #07271c66}` rule, repeated with minor variation across every panel). There is no pixel-art UI chrome anywhere — no 9-slice bordered panel texture, no pixel-font, no button sprite states. This is the direct, source-confirmed cause of the owner's "feels like a web dashboard" complaint — it is not a vague impression, it is a correct description of literally how the UI is built.

**What was and wasn't researched for this file, disclosed honestly:**
- **Timber Edge UI** (the project's own existing pattern, referenced by name in Phase 6.5B1's prior work and visible in the `#b/c/e/g-control` panels' brown/gold color scheme, `#6f3e43` background / `#f4ac66` border) — this *is* a deliberate pixel-adjacent color choice layered onto the otherwise plain-HTML panels, confirmed by its consistent reuse across all four world-aside panels. It is the one place the UI has tried to feel game-native through color alone, without changing the underlying flat-rectangle-with-border construction.
- **Kenney UI Pack — Pixel Adventure** or any other pixel UI asset pack — **not independently inspected in this audit.** No such pack's actual sprite sheet or license was fetched, opened, or verified. Per the brief's own instruction ("a pack is not automatically a better design... inspect actual sprites and licenses before claiming compatibility"), this audit **declines to recommend a specific pack sight-unseen** — doing so would be exactly the kind of unverified claim the brief warns against. **This is a genuine gap in this audit, stated plainly rather than papered over with a plausible-sounding recommendation.**

**What can be recommended without having inspected a specific asset pack — a direction, not a pack:**
1. Replace flat CSS borders/shadows on the four world-aside panels and `#mechanism` with a 9-slice-sliced pixel panel texture reusing the *existing* Kenney Pixel Platformer tileset already licensed and loaded in this project (the same atlas `environment.js` already draws terrain/signs from) — if it contains a suitable panel/UI frame tile; this was **not checked** in this audit (would require opening `assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png` and identifying candidate frames, out of scope for a UI-focused file but flagged as the very next concrete step).
2. Keep typography as a system font for *reading comfort* (small, dense instructional text, like the worked-solution block, genuinely benefits from a proper UI font rather than a pixel font at small sizes — this is a legitimate reason to NOT pixel-font everything, not an oversight) but introduce one consistent pixel-styled *heading* treatment (panel titles, button labels) to anchor the "this is a game panel" read without sacrificing body-text legibility — a hybrid approach, not an all-or-nothing reskin.
3. **Do not** turn every gameplay interaction into a bigger panel (the brief's own explicit caution) — if anything, the finding above (file 09) that C's apply-sign needs an actual choice, not more UI, argues for *fewer*, better-costumed panels rather than more elaborate ones.

**HUD hierarchy, mobile layout, contrast, focus, reduced motion — confirmed from source:**
- HUD hierarchy: `.masthead` (Level/Collection/Pause) is the only persistently-visible chrome; `#objective`/`#checkpoint-state`/`.hud` are confirmed **screen-reader-only** (`position:absolute!important;width:1px;height:1px;...clip-path:inset(50%)` in `world.css`) — **sighted players never see objective/checkpoint text as on-screen HUD at all**, it only reaches them via the `notify()` toast system and the pause menu's mission notes. This is worth the owner knowing explicitly: the "HUD" is much smaller on-screen than the DOM structure might suggest at a glance.
- Mobile layout: reasoned from the actual `@media` rules in `presentation.css` (portrait ≤700px, landscape ≤560px height — both rules read and summarized in file 07C) rather than screenshot-verified at a true resized viewport — **this audit's browser-automation environment could not resize the real window** (`resize_window` calls were issued and confirmed via `window.innerWidth` to have no effect on the reported viewport in this environment); only the Phaser canvas's *internal* render resolution was confirmed to scale cleanly (file 03's disclosed-method note). **This is a real limitation of this audit, stated plainly**, not a claim that mobile layout was fully verified.
- Contrast: Not measured with a contrast-ratio tool in this audit; visually, every panel uses light text (`#fff2ce`) on dark backgrounds (`#183a32`/`#203e36`/`#6f3e43`), which reads as high-contrast in every screenshot captured, but this is an eyeball judgment, not an instrument measurement.
- Focus indicators: Confirmed present and consistent — `button:focus-visible{outline:3px solid var(--focus)}` applied globally.
- Reduced motion: Confirmed thorough (file 07D) — this is one of the most carefully reduced-motion-aware codebases checked in this audit, essentially every tween/particle call is gated.
- Help readability: `#help`'s `<dl>` control list (confirmed in `ui-help-dialog.jpg`) is clean, well-organized, two-column, legible.

## Dead/orphaned UI, confirmed via source (not visual)

The `#puzzle` dialog (`v12.html`, a full form-based "answer input + hint button + worked-solution" UI, structurally similar to V9/V10's old quiz pattern) is **never opened anywhere in V12's actual game flow** — confirmed by grepping for `$('puzzle').showModal()` across the entire `src/v12/` directory: zero matches. Its "Minta hint" button's handler calls `activeScene?.requestHint()`, **a method that does not exist anywhere in `v12/mechanisms.js` or `v12/game.js`** (confirmed by grep; it exists only in the old `src/game.js` and `src/v10/game.js`) — if this dead code path were ever triggered, it would throw. In practice it cannot be triggered by a player (the dialog is never shown), so this is not a live bug, but it is **confirmed dead markup and a confirmed broken handler left over from an earlier version**, worth removing for codebase health even though it has zero current player-facing impact. See file 15/16 for disposition ("what to remove, not add").
