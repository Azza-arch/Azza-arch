---
target: Anjung Nyiur demo
total_score: 24
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 0
timestamp: 2026-11-20T08-50-52Z
slug: demos-anjung-nyiur-index-html
---
# Anjung Nyiur — Dual-agent Impeccable critique

Method: dual-agent (A: /root/anjung_critique_a · B: /root/anjung_critique_b), with parent visual verification.

Target: `demos/anjung-nyiur/index.html`; Persuade / portfolio demonstration. Assessment A inspected source only because the provided local route returned 404 in its context. Assessment B ran the detector and integrity checks; its browser launch failed with `spawn EPERM`, so it could not inject the overlay. Parent's earlier Edge screenshots and interaction checks supplement the source-only agent views.

## Design health

| Nielsen heuristic | Score | Finding |
|---|---:|---|
| Visibility of system status | 3/4 | Menu, FAQ, errors and message preview have visible states. |
| Match with real world | 3/4 | Malay guest language and disclosed illustrative values. |
| User control and freedom | 3/4 | Anchors and native disclosures work; primary and secondary hero paths are equally prominent. |
| Consistency and standards | 3/4 | Native browser semantics and a coherent visual language. |
| Error prevention | 3/4 | Date ordering and guest count are validated. |
| Recognition rather than recall | 3/4 | Section navigation, visible labels and sample capacity hints. |
| Flexibility and efficiency | n/a | Not central to a portfolio/persuade surface. |
| Aesthetic and minimalist design | 3/4 | Warm editorial composition; some reference photos are stylistically inconsistent. |
| Error recovery | 3/4 | Inline errors focus the field and preserve input. |
| Help and documentation | n/a | FAQ is guest content, not product documentation. |
| **Total** | **24/32** | Good; score is one point below the previous single-context pass, reflecting independent scoring variation rather than a source change. |

## Strengths

- Forest, ivory and timber palette, serif display type and asymmetrical image mosaic support the Modern Tropical Heritage direction.
- The page covers the expected stay information in Malay and keeps sample prices, room details and reference images disclosed.
- The enquiry form safely demonstrates a preview without submitting or storing user data.

## Priority observations

- [P2] The single page is long, with ten facility items and seven FAQ choices. The sticky section navigation helps, though a shorter grouping could reduce scanning.
- [P2] Reference interiors vary in style and are not specifically Malaysian. Keep disclosure; replace when locally coherent licensed images are available.
- [P2] The location placeholder is honest but interrupts trip planning. Keep its demo status and explain the real details a guest would need.
- The B finding that the footer's `#contact` anchor is missing is a false positive: parent HTML parsing confirmed `id="contact"` in root `index.html`.

## Verification evidence

Parent-rendered Edge checks: desktop 1440px, mobile 390px, plus 320px and 820px widths; no horizontal overflow; local images loaded; menu open/close and local-only message preview worked; no page errors. Local section links and asset paths resolve. External room-photo source pages were checked; the exact house-photo listing did not resolve, so its credit links to the photographer profile, whose page is reachable.

Detector: exit 0, `[]`, 0 matches; degraded regex fallback because htmlparser2, css-select, css-tree and domutils are unavailable. Selector matching, tokens and computed contrast were not checked. Browser overlay output unavailable because the agent route returned 404 and Playwright launch failed with `spawn EPERM`.

Questions skipped: the user requested the independent review and no further clarification is needed.
