# Verification — side/rear volume and natural reactions, 2026-11-21

Story: inspect Wassie's rounded side/rear anatomy while preserving the supplied front drawing → grab/throw the articulated body → measured contact location, speed and mass drive the reaction → damage remains attached to the struck part/surface → the character settles on actual support before recovering.

The existing ten-tool catalog is unchanged. This is a local browser simulation with no API/database or secret configuration boundary.

## Checks performed

| Check | Observed result |
| --- | --- |
| `npm test` | 30 passing system tests |
| `npm run assets` | 16 coherent volumes exported; 386 production requirements indexed |
| `npm run build` | TypeScript and production Vite build passed |
| `npm run test:e2e` | Seven passing Chrome browser tests, 44.1 seconds |
| `node scripts/production-smoke.mjs` | Production browser loads, bomb scores, no debug API or browser errors |
| `node scripts/compare-reference.mjs` | Front comparison passes the existing fidelity gate |
| `node scripts/character-qa.mjs` | No page or console errors in the captured studio/reaction flows |
| `node scripts/turnaround-qa.mjs` | Eight actual rendered anatomy/surface-reaction views captured |

## Preserved canonical front

Actual isolated Three.js render compared with the unchanged source crop at **398×782**:

- Foreground intersection-over-union: **0.9872874**.
- Mean absolute RGB channel error over shared foreground: **4.98364 / 255**.
- Existing regression thresholds remain **0.975** minimum IoU and **12/255** maximum channel error.

This is a foreground metric excluding near-white pixels, not a filled silhouette or perceptual identity score. It covers the supplied neutral front view. Side/rear forms are authored interpretations of one reference, not additional supplied canonical art. They require artistic review before final all-angle approval.

## Volume and reaction checks

The source-envelope tests verify substantive head/torso depth, rounded cross-sections, continuous occupied depth intervals, outward rear normals, eye/lip relief and skin-colored rear surfaces without mirrored facial features. Front landmark colors and one common source-pixel/world scale remain covered.

Physics regressions verify limited joints under repeated torque, planar articulation, long spring grabs, bounded release speed, landing reaction spacing, return to stance, idle stability, one damage episode per explosion, platform-height recovery, and unassisted airborne falling. The raised-platform test confirms recovery does not pull the body through its support. The freefall test measures center-of-mass motion against gravity before ground contact. Zero gravity, status interactions, resets, saves, prop budgets and mixed-tool stress remain covered.

Reaction tests verify reduced-mass/speed-sensitive response, bounded measured impulse, separate front/back/flank marks, retained limb identity and continuous deformation when a new impact arrives. Opposite contact normals describe the same compression axis, avoiding a half-turn of squash after landing. Damped spring integration agrees across tested tick rates.

## Browser and visual checks

Seven tests exercise desktop and touch placement/grabbing, pause/time scale, search, bomb scoring, save/clear/load, reset, screenshots, partial slices, reference comparison, side/rear wound presets and combined effects. Repeated studio resets do not grow renderer geometry counts beyond the tested tolerance. The tested idle flow issues **no external HTTP requests**; both existing Latin variable fonts are now local, with their OFL licenses bundled.

Desktop viewport is 1440×1000. Touch-emulated Chrome uses 390×844 with CDP touch start/move/end. There is no horizontal overflow in that tested layout. Physical Android/iOS devices, Safari and Firefox remain untested.

The turnaround sheet shows engine-rendered front, quarter, side and rear anatomy; side and rear wounds; frost on the back; and combined effects on the opposite flank. Decals reuse volume geometry and orbiting stars have depth. The side/rear view is no longer a shallow card, but it is still a stylized inferred model rather than a final approved turnaround.

## Hardware sample

Chrome, **NVIDIA GeForce RTX 3080 Ti**, ANGLE Direct3D11, **1440×1000**:

| Scene | FPS sampled | Draws | Triangles | Bodies | Physics time sampled |
| --- | ---: | ---: | ---: | ---: | ---: |
| Idle refined volume | 144 | 17 | 353,340 | 6 | 0.3 ms |
| 40 mixed crate/mallet/anvil/glove props | 144 | 99 | 1,475,588 | 46 | 0.6 ms |

Coordinates remained finite. These are short local samples, not percentile benchmarks, thermal tests or proof of performance on lower-end devices. Browser tests use software WebGL for compatibility coverage; that is separate from the hardware sample.

## Remaining limits

- Inferred side/rear anatomy and extreme deformation transitions still need visual approval and tuning.
- The character application chunk is roughly 92 KB gzipped, the renderer about 137 KB, and the embedded Rapier WASM/compatibility chunk about 830 KB. Vite warns about uncompressed chunk sizes; the build passes.
- Rapier emits an upstream compatibility initialization warning. Tested initialization and simulation work.
- `dist/` is ready for static hosting, but no Vercel deployment was performed.
- Prior hosted CI runs could not start because of the GitHub account billing lock. Local checks pass; no hosted CI pass is claimed.
- Saves remain prop placements, not simulation checkpoints. Replay, challenges, leaderboard and bulk content remain planned.

Screenshots and measured front results are under `test-results/character/`. Source/production archives, the turnaround sheet, comparison images and this report are copied to local deliverable outputs.
