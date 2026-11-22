# V8 Phase 5 — Hint Content (verified, not newly authored)

All three puzzles already had exactly 3 staged hints in `src/level.js`,
matching the brief's requested structure (conceptual nudge → calculation
step → worked solution). No new hint system was built — this document
verifies the existing content is mathematically correct and appropriately
staged. Content itself is unchanged from before Phase 5, except for p1's
`wrongMessage` (see below).

## M1 — workshop-gate — f(x) = 2x + 1, find f(3)

- Given: x = 3. Correct answer: 7.
- Hint 1 (concept): "f(x) = 2x + 1 bermaksud gandakan x, kemudian tambah 1."
  — restates what the function does in words, no numbers yet.
- Hint 2 (step): "Gantikan x = 3 ke dalam formula: 2(3) + 1." — shows the
  substitution step without evaluating it.
- Hint 3 (solution): "2(3) + 1 = 6 + 1 = 7." — full worked arithmetic.
- Math check: 2(3) + 1 = 6 + 1 = 7. Correct.
- `wrongMessage` (fixed this phase): `Anda masukkan ${n2}. Itu bukan f(3)
  yang betul — cuba kira semula 2(3) + 1.` — echoes the student's input,
  points back at the substituted expression, does not state "= 7".
- `solvedMessage`: `f(3) = 2(3) + 1 = 7` — shown only after a correct
  answer, now inside the dialog via the Teruskan flow.

## M2 — rooftop-gate — f(x) = 3x − 2 = 10, find x

- Given: f(x) = 10. Correct answer: x = 4.
- Hint 1 (concept): "3x − 2 = 10. Cuba asingkan sebutan x." — names the goal
  (isolate x) without performing a step.
- Hint 2 (step): "Tambah 2 pada kedua-dua belah: 3x = 12." — first algebra
  step shown.
- Hint 3 (solution): "Bahagikan dengan 3: x = 4." — final step.
- Math check: 3x − 2 = 10 → 3x = 12 → x = 12/3 = 4. Correct.
- `wrongMessage`: `` 3(${n2}) − 2 = ${3*n2-2}, bukan 10. Cuba lagi. `` —
  already non-revealing (confirmed, unchanged this phase); plugs the
  student's own number back into the formula so they can see where it
  diverges from 10, without stating x = 4.

## M3 — final-gate — f(x) = 4x − 3 = 17, find x

- Given: f(x) = 17. Correct answer: x = 5.
- Hint 1 (concept): "4x − 3 = 17. Cuba asingkan sebutan x."
- Hint 2 (step): "Tambah 3 pada kedua-dua belah: 4x = 20."
- Hint 3 (solution): "Bahagikan dengan 4: x = 5."
- Math check: 4x − 3 = 17 → 4x = 20 → x = 20/4 = 5. Correct.
- `wrongMessage`: `` 4(${n2}) − 3 = ${4*n2-3}, bukan 17. Cuba lagi. `` —
  already non-revealing (confirmed, unchanged this phase).

## Conclusion

All three hint sets were mathematically verified correct and already staged
exactly as the brief requested; reused as-is. The only content defect found
was p1's `wrongMessage` revealing the answer on every wrong attempt — fixed
to match p2/p3's pattern (see `educational-ux-report.md`).
