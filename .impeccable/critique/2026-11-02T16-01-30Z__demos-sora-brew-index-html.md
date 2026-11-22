---
target: Sora Brew homepage
total_score: 19
max_score: 24
na_heuristics: 5,7,9,10
p0_count: 3
p1_count: 5
timestamp: 2026-11-02T16-01-30Z
slug: demos-sora-brew-index-html
---
# Sora Brew — Design Critique

Method: dual-agent (Assessment A: independent design-director review · Assessment B: detector + browser evidence), supplemented by a first-hand verification pass after both returned (Assessment B's live-browser checks were blocked by tab contention with Assessment A; detector run was unaffected and clean).

Verified viewports: desktop 1366x577 (1440 unavailable in this sandbox), mobile 390 and 320 via iframe-exact-width technique. No scrollWidth overflow at any width. Zero console errors.

## 1. Overall Visual Assessment
Well-built and over-decorated at the same time. Accessibility, motion, and responsive engineering are genuinely good; the visual composition layers five different decorative languages (photorealism, flat kawaii mascot, hand-drawn gold squiggle, geometric sun icon, wavy SVG dividers) onto one short page. That combination, not any single element, is what reads as AI-generated.

## 2. AI-Slop Patterns Found
1. Generic split hero - YES (`.hero-inner` 1fr/1.35fr grid, copy-interchangeable)
2. Product imagery pasted onto bg - YES, worst offender (`.hero-photo` mask-image edge-fade; flat logo decal on cup)
3. Decorative CSS cloud shapes - No (already removed)
4. Geometric mountains - No (already removed)
5. Floating badges/stickers - YES (animated mascot on photorealistic photo)
6. Excessive rounded cards - Minor, not a real offender
7. Generic 3-feature row - YES ("Fresh Brews/Soft Bakes/Calm Space")
8. Inconsistent decorative motifs - YES, root issue (5 registers at once)
9. Random whitespace - No
10. Repetitive section layouts - Mild (numbered kicker + Playfair + squiggle + wave, 4x)
11. Poorly composed logo - YES (generic cloud-blob mark)
12. Weak photographic grounding - YES, confirmed firsthand (Signature Drinks: 4 different shoots, one with a visible unrelated "NEO..." brand prop in frame)
13. Fake shadows - Minor
14. Excessive icons - Moderate
15. Generic typography despite premium fonts - YES (squiggle repeated under every H1/H2)

## 3. Section-by-Section Verdicts
- Concept bar + nav: KEEP / refine tone
- Brand logo lockup: REFINE (generic mark, bolted-on subtitle)
- Hero layout: RESTRUCTURE (generic split-grid)
- Hero photography: REFINE, P0 (drop edge-mask trick)
- CTA hierarchy: KEEP
- Hero-to-content transition: REMOVE/restructure (generic 3-icon row)
- Signature Drinks: RESTRUCTURE, P0 (4 photos, 4 different shoots, confirmed firsthand)
- Menu: REFINE (reuses exact same photos as Drinks section)
- Our Story: KEEP structure / cut sun icon (strongest section on the page)
- Outlet: REFINE (warm photo mismatched to navy section; alt text factually wrong - says "navy-blue exterior", photo has no navy, confirmed firsthand)
- Footer: KEEP (visually inert but fine)
- Mobile layouts: REFINE (engineering solid, no overflow at 390/320; decoration-to-photo ratio worsens on small screens)
- Animation/motion: KEEP (prefers-reduced-motion fully respected, strong layer)

## 4. Art-Direction Coherence Challenge
Not one coherent language - four registers: photorealism (itself inconsistent), flat kawaii mascot, hand-drawn squiggle, minimalist type + decorative Japanese text.
Keep: navy/sky-blue/cream/gold palette, Playfair+Lato, real photography (if unified), numbered-kicker system, one restrained Japanese touch.
Cut: hero-scale animated mascot, squiggle repeated under every heading, Our Story sun icon, hero edge-mask trick. Fix is subtraction, not addition.

## 5. Recommended Direction: "Editorial Morning Light"
Photography-led, not mascot-led. One consistent light/color grade across all photos. Sky lives in photography + palette, not a cartoon. One accent mark used once (hero only). Japanese text in one place only. Section transitions via color-blocking/whitespace, not wave SVGs. Keep all current accessibility/motion engineering and Our Story's structure as the template for the rest.

## 6. Top 10 Prioritized Changes
1. [Critical, S] Remove/demote animated hero mascot
2. [Critical, M] Re-shoot/color-grade the 4 Signature Drinks photos to one system
3. [Critical, M] Drop hero photo edge-mask trick for a bounded treatment
4. [Significant, S] Cut hero-features 3-icon row
5. [Significant, S] Remove Our Story sun icon
6. [Significant, S] Limit gold squiggle to hero-only
7. [Significant, S-M] Fix Outlet photo/section color mismatch + false alt text
8. [Significant, S-M] Stop reusing identical photos between Drinks and Menu
9. [Optional, S] Consolidate Japanese text to one location
10. [Optional, S] Add one small accent to the bare footer

New firsthand finding: brand subtitle (`.brand-text small`, navy rgba(16,47,103,.55) on cream #f5efe5) measures ~3.24:1 contrast, below 4.5:1 AA minimum for text this small. Fold into item 9.

## 7. Design Health Score (Nielsen's 10)
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of status | 3/4 | No current-category indicator in Menu |
| 2 | Match to real world | 3/4 | Good local detail; fictional-demo framing costs a point |
| 3 | User control & freedom | 4/4 | Esc/outside-click/focus-return correct |
| 4 | Consistency & standards | 3/4 | Tokens consistent; decorative-motif inconsistency muddies functional vs decorative |
| 5 | Error prevention | n/a | No forms |
| 6 | Recognition over recall | 4/4 | Prices adjacent, sticky nav |
| 7 | Flexibility & efficiency | n/a | No power-user paths on Persuade page |
| 8 | Aesthetic & minimalist design | 2/4 | Core complaint quantified |
| 9 | Error recovery | n/a | No error states |
| 10 | Help & documentation | n/a | Not applicable |
| Total | | 19/24 (79%) | Good band, dragged down by #8 |

Design-specificity verdict: mixed. Copy is bespoke; composition is template-interchangeable.

## What's Working
1. Our Story section - strongest on the page, structurally and in copy
2. Motion/accessibility engineering - prefers-reduced-motion, focus management, inert, scroll-reveal
3. Navy/sky-blue/cream/gold palette - distinctive, well-tokenized

## Persona Red Flags
- Jordan (first-timer): sees same two photos twice scrolling Drinks to Menu within ~10 seconds
- Riley (stress-tester): catches Outlet alt text factually describing a photo wrong
- Casey (mobile): mascot/logo proportionally larger on 390px, worsening clutter impression

## Minor Observations
- Outlet "05" kicker badge slightly overlapped by wave-divider SVG at section seam
- Detector ran in degraded mode (missing htmlparser2/css-select/css-tree/domutils) - 0 findings means "nothing caught by regex", not a full clean audit

## User's chosen direction (from Ask the User)
- First priority: hero photo + mascot together
- Direction: subtraction (cut mascot to nothing/tiny static mark, limit squiggle to hero-only, remove sun icon, consolidate Japanese text)
- Scope for next session: top 3 critical items only (hero photo edge-mask + mascot, Signature Drinks photo set)
