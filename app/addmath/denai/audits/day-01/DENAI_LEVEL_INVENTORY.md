# DENAI — Level & Content Inventory (Day 01)

Implemented: **World 1 "Hutan & Sungai" (Fungsi), 3 levels.** World map lists 3 more worlds as not playable: World 2 "Lembah Batu Kapur" (Fungsi Kuadratik, *dalam pembangunan* — a vertical slice exists only on unmerged branch `claude/denai-w2-slice`), World 3 "Kilang & Lombong" (Sistem Persamaan, *akan datang*), World 4 "Tanah Tinggi Ladang" (Indeks, Surd & Logaritma, *akan datang*).

| | 1-1 Jejak Taman Fungsi | 1-2 Jambatan Berkembar | 1-3 Gerbang Songsang |
|---|---|---|---|
| Scene / file | `Lorong` / `game.js`, `levels/supply-quest.js` | `Jambatan` / `levels/twin-scene.js`, `workshop-line.js` | `GerbangSongsang` / `levels/inverse-scene.js`, `sluice-line.js` |
| World size | 5 940 × 1 600 | 4 860 × 1 600 | 5 616 × 2 200 |
| Topic | Function as model: C(x)=px+d | Composite: gf vs fg | Inverse: f⁻¹(y) |
| Objective | Buy enough planks within budget, repair bridge | Produce ≥ 8 components by ordering two machines | Recover the original valve setting (13 → 5) to lower the water |
| Puzzles | 1 (+ key/door errand) | 1 (run → swap → run) | 1 + optional cave valve (f⁻¹(15)=6) |
| Main mechanics | walk/jump/ladder, key, shortcut drop, store receipt, bridge install | river posts, upper-deck lever, machine line | valve wheel, meter, flow lever, stepping stones, cave plates |
| Checkpoints | 5 (cp-start, cp-rise1, cp-gate, cp-gaunt-mid, cp-recovery) | 6 (entry, machines, beyond-twins, secret-bank, final-yard, exit) | 5 (entry, ruins, machine, far-bank, gate-court) |
| Collectibles | 15 coins, 2 secrets | 15 coins, 2 secrets | 22 coins, 3 secrets |
| Completion | finish zone x 5745 → victory card | finish zone x 4698 | finish zone x 5292 |
| Bot playthrough | 72 s | 71 s | 109 s |
| Status | Complete, live | Complete, live | Complete, live |
| Known issues | Objective revealed at x≈2470; key detour is movement-only; long tail after puzzle (Tebing Berliku + Pokok Tinjau); legacy machine code still runs | Lever route via secret-bank ladder unclear; puzzle solvable by trying both orders; long run to exit | First hazard 2 s after spawn; meter/lever not co-visible in portrait; brute-forceable valve (7 settings) |

## Is the organisation intuitive?
Mostly yes for World 1: **evaluate → compose → invert** is a sound order and matches DSKP T4 Bab 1 (1.1 → 1.2 → 1.3). Weaknesses: one puzzle per level makes each level ≈ 70 % traversal; there is no "mission" layer, so WORLD → MISSION → PUZZLE is really WORLD → LEVEL(=1 mission, 1 puzzle).

## Recommended structure (proposal, not implemented)
- **World** = chapter (Fungsi, Fungsi Kuadratik, Indeks & Logaritma, Janjang, Pembezaan, Pengamiran).
- **Mission** = one story goal per level (repair bridge, power workshop, drain sluice) — already true; make it explicit in the Journal ("Misi 1/3").
- **Puzzles** = 2–3 per mission that *escalate the same idea*: e.g. 1-3 → (a) read the meter for a given setting (forward), (b) recover setting from 13 (inverse), (c) cave: recover from 15 without the meter (independent). The cave valve already exists — promote it from optional to the third step and shorten traversal.

### Content directions (proposals)
| World | Mechanic idea (learning through action) | Avoid |
|---|---|---|
| 2 Fungsi Kuadratik | Water arc / bridge cable: adjust a, h, k of y = a(x−h)²+k so the arc lands on a ledge; vertex = highest platform; discriminant decides if a cable touches the ground (0/1/2 roots) | multiple-choice gates |
| Indeks & Logaritma | Doubling bacteria lamp / echo cave: each step multiplies; logs answer "how many steps to reach N" | — |
| Janjang | Stairs/conveyor where each step adds d or multiplies r; sum = total crates delivered | — |
| Pembezaan | Slope of a hill at a point decides rolling speed; stationary point = safe camp | — |
| Pengamiran | Area under a flow-rate graph = water collected in a tank | — |
Check `claude/denai-w2-slice` (World 2 "Lembah Parabola" blueprint + Stesen A slice) before designing World 2 from scratch.
