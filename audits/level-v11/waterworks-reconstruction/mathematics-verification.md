# Composition math verification

Input is x=3. The existing approved functions are f(x)=2x+1 and g(x)=3x?2; the target is 19.

- Correct order: f(3)=7, then g(7)=19. This is g(f(3))=19 and opens the crossing.
- Incorrect reverse order: g(3)=7, then f(7)=15. This is f(g(3))=15; it is displayed as the real result, keeps the crossing closed, and permits retry.
- The panel presents input, each function, the intermediate value and final target. The world stations are switchable F/G positions; this is function composition, not multiplication.

`v11_phase3.test.mjs` checks both paths and rejects the multiplication token. Browser verification additionally checks that wrong order leaves the crossing parked and correct order completes the water sequence.
