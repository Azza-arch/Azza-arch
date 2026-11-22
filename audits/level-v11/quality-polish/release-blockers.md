# Remaining release blockers

## Production route

The V11 production HTTPS check recorded in [`final-game-presentation/live-headers.txt`](../final-game-presentation/live-headers.txt) returned `HTTP/1.1 404 Not Found`. This turn did not recheck an external URL, change routing, deploy, or claim that the live route now works. Production readiness remains blocked until the intended HTTPS route responds with the complete game and is manually playable there.

## Runtime archive is incomplete

The existing [`v11-phase5-runtime-candidate.zip`](../final-game-presentation/v11-phase5-runtime-candidate.zip) and prior `baseline-runtime-snapshot.zip` both contain the same 69-file / 2,701,459-byte selected archive. It omits `assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png`, which `game.js` loads unconditionally, and omits 49 of 103 image paths listed by `assets/manifest.json` (the loader requests every manifest entry). Serving an extraction therefore cannot start the game. This was reproduced by serving the selected archive locally: the atlas request returned 404 and the title screen did not become available.

Audit details: [`regression/package-audit.json`](regression/package-audit.json).

Exact packaging files for the later correction: `audits/level-v11/final-game-presentation/runtime-package-manifest.json` and its generated `v11-phase5-runtime-candidate.zip`. Add the missing atlas and all 49 manifest assets to that allowlist, rebuild both together, extract the archive to a clean directory, run it there, and check every request. No packaging or deployment change was made as part of V11.2.

## Human/device validation

The candidate is suitable for another **local supervised human beta review**, but the responses above are still needed. Physical mobile, Safari/Firefox, screen-reader and audio review remain open. Passing automation does not clear these items.

## Expected runtime file layout for a later release

At minimum, the archive root must preserve the served directory hierarchy:

```text
app/addmath/rooftop/
  v11.html
  style.css
  src/audio.js
  src/level.js
  src/v11/{game,environment,level,mechanisms,presentation,save}.js
  src/v11/{world,presentation}.css
  vendor/phaser-3.90.0.min.js
  assets/manifest.json
  assets/kenney-pixel-platformer/Tilemap/tilemap_packed.png
  assets/kenney-pixel-platformer/Tiles/** (all manifest/runtime dependencies)
  assets/chill-boy/** (all frames referenced by manifest)
  assets/** (all remaining paths in assets/manifest.json)
```

The locally working route remains `/app/addmath/rooftop/v11.html`. Do not assume the directory URL or an older `index.html` alias selects V11. Verify final HTML, case-sensitive paths, CSS/JS/atlas and every image request from the extracted release directory after routing is corrected.
