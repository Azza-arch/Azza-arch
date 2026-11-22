# Phase 4 visual and collision review

Reviewed actual desktop captures of the F alcove, G locked puzzle and completion, plus390×844 touch/reduced-motion output. The initial deep lower room was revised into a216px-deep sheltered passage with two escape ladders. A real Kenney tree marks the ridge; terrain and original Chill Boy remain asset-based.

Terrain bodies are authored separately from decoration. The alcove floor is y1134, roof y918, width432; its timber roof is a one-way platform. Both ladders remain active without solving. River water frames33/73 have no collision. The bridge spans x7506–7830 and gains a one-way collider only after art reaches y972. Browser assertions verify the top coordinate and every plank at rest; mid-animation reload installs the same safe state.

The destination shelf x8262–8400/y972 is reached by a54px jump from the preceding lower landing. Goal interaction occurs at x8316 after the six required IDs; actual completion screen is captured.

Screenshot index: `screenshots/phase4/phase4-F-R13-overlook.png`, `phase4-F-R14-entrance.png`, `phase4-F-R14-interior.png`, `phase4-F-R14-inverse-reward.png`, `phase4-G-R15-locked.png`, `phase4-G-R15-wrong-h-input.png`, `phase4-G-R15-bridge-moving.png`, `phase4-G-R15-bridge-safe.png`, `phase4-G-R16-destination.png`, `phase4-G-R16-completion.png`, `phase4-mobile-G-reduced-motion.png`, and `phase4-A-G-contact-sheet.png`.

Remaining visual limitations: large terrain interiors retain the incumbent tile grammar; alcove is intentionally open; portrait river preview is limited and existing route strip clips. These are documented rather than claimed visually perfect. Physical-device and human playtesting remain outstanding. No generated concept image substitutes for browser evidence.
