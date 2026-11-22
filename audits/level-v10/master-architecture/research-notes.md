# Research applied to this blueprint

Research informs original design decisions below. It does not prove the proposed level is fun, that estimated learning times are accurate, or that the new geometry has passed engine testing.

| Source | Relevant idea, paraphrased | Application in this proposal |
|---|---|---|
| [Level Design Patterns in 2D Games](https://www.gamedeveloper.com/design/level-design-patterns-in-2d-games) | Guidance, foreshadowing, safe zones, layering, branching and pace breaking are reusable patterns to combine with judgment. | Trees/signs and visible rewards guide; café and river are previewed; courtyard/café/overlook provide rest; E layers familiar movement with a new task; optional routes rejoin safely. |
| [The Level Design Book: Pacing](https://book.leveldesignbook.com/process/preproduction/pacing) | Plan discrete activities, information and intensity; vary demanding moments with rests and consider production scope. |18 separately described beats, explicit durations and failure loops; five mechanism families reuse art and logic; no additional combat or moving-platform physics. |
| [GDC2018 Level Design Workshop roundtable](https://www.gamedeveloper.com/design/gdc-2018-level-design-workshop-an-expert-roundtable-q-a) | Designers discuss landmarks, paths, district identity, framing, purpose and iterative testing. |Each zone has a spatial job within a water-powered neighbourhood; upper and cave loops reconnect; full-route tests are an implementation acceptance gate. |
| [The Secret to Mario Level Design — Hayashida interview](https://www.gamedeveloper.com/design/the-secret-to-i-mario-i-level-design) |A mechanic can be introduced, developed, changed unexpectedly, then resolved through demonstrated understanding. |Safe probe → gear/block application → pipe-order twist → final synthesis. Optional inverse deepens the idea without blocking the main path. |

These are design references, not instructions to copy Mario geometry or reproduce either Kenney sample. Their four-step and pacing ideas are adapted to an educational platformer with slower reflection and no timed maths penalty.

## Curriculum evidence and boundaries

The KPM-authored KSSM Additional Mathematics Form4/5 DSKP, printed Chapter1 pages34–37, is available through a [teacher-hosted mirror](https://fliphtml5.com/sbzkq/ferv/DSKP_KSSM_MATEMATIK_TAMBAHAN_T4_DAN_T5/). A [KPM-authored DPK2.0 Form4 PDF mirror](https://www.tcer.my/wp-content/uploads/2021/01/DPK-2.0-Matematik-Tambahan-Ting-4.pdf) corroborates the Functions content. These are mirrors of curriculum documents, not official KPM hosting or a claim that a2026 revision was verified.

| Curriculum area | Selected alignment | Design treatment |
|---|---|---|
|1.1 Functions |Notation/unique output, domain/codomain/range, image or object |B probe, café tray, original gear and block questions |
|1.2 Composite functions |Describe/determine composition and its images; application |D safe rehearsal, E order switch, G repeated composition |
|1.3 Inverse functions |Inverse meaning, one-to-one restriction, inverse determination |Optional F cave, restricted D↔R mapping and forward check |

This is selective alignment, not complete Chapter1 coverage or an assessment certification. Original p1/p2/p3 evaluate an image or solve for an input. Domain/codomain/range, composition and inverse tasks are explicitly proposed additions. The inverse tray uses a bijection to its actual range; a function into a larger codomain is not automatically invertible over every codomain member. Equations and examples are fully specified in [mechanism designs](mechanism-designs.md).

## Evidence hierarchy

1. Current source data determines actual physics, save behaviour and baseline questions.
2. Actual atlas pixels and local SampleA/SampleB determine available visual vocabulary.
3. Research suggests pacing and teaching structures.
4. Proposed coordinate tables and calculations reject obvious impossibilities.
5. Future natural-input playtests determine engine reachability and learning quality. No earlier step replaces this last one.
