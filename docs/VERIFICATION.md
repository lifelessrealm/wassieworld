# Verification — character fidelity and reactions, 2026-11-21

Story: the player sees the canonical Wassie proportions → grabs a physical part through a spring constraint → throws or hits the articulated rig → one measured collision episode produces layered facial/body reactions → damage fades and the rig recovers smoothly. The character studio exposes the same art and damage system beside the unchanged original image. The existing ten-tool catalog is unchanged.

## Local checks

| Check | Observed result |
| --- | --- |
| `npm test` | 23 passing system tests |
| `npm run assets` | 16 coherent volumes exported; 386 production requirements indexed |
| `npm run build` | TypeScript and production Vite build passed |
| `npm run test:e2e` | Six passing Chrome browser tests |
| `node scripts/production-smoke.mjs` | Production browser loads, ten tools render, bomb scores, no development debug API or browser errors |
| `node scripts/compare-reference.mjs` | Neutral front reconstruction exceeds the recorded image comparison gate |
| `node scripts/character-qa.mjs` | Captured gameplay, front/quarter/rear and heavy/combined/recovery states without console or page errors |

The simulation is local to the browser; there is no API/database or secret configuration boundary in this build.

## Canonical image comparison

The script isolates the actual assembled Three.js source-volume reconstruction and renders it orthographically on white. It compares that output with the original source crop at **398×782**, using the same source-pixel/world mapping for every part.

- Foreground intersection-over-union: **0.9871945**.
- Mean absolute RGB channel error over shared foreground: **5.55896 / 255**.
- Regression thresholds: foreground IoU ≥ **0.975**, mean channel error ≤ **12 / 255**.
- Original source image remains unchanged. Front art is sampled from it; the character is still reconstructed as closed horizontal source-volume slices.

These measurements cover the supplied neutral front view. They do not certify pixel identity under every camera/light/deformation, or prove that inferred side/rear art matches an unavailable turnaround. Foreground excludes near-white pixels, so this is a foreground overlap metric rather than a filled silhouette or perceptual identity score. Review the saved side-by-side image as well as the numbers.

## Character and physics regressions

New coverage checks one reference scale across six parts; canonical eye/lip/brow/crescent colors; relative angle limits under repeated torque; planar motion; a long moving spring grab; delayed recovery while held; bounded release speed; landing reaction spacing and return to stance; no idle damage/score after placing an unrelated prop; one damage event per explosion; bounded local bruise marks and fading; continuous deformation at different step rates; zero-gravity behavior; and reset cleanup of joints, overlays and recovery anchors.

Existing coverage retains cross-section occupancy and normalized normals, physical tool registrations, layered status expiry, bounded combo scoring, stable 20-second articulation, throwing momentum, bomb chain reactions, elemental combinations, machine impulses, atomic save validation, repeated resets, prop budgets and mixed-tool stress.

The unstable intermediate joint implementation was found by actual simulation runs. Both the child body and revolute joint were constraining the same non-planar axes. The final implementation gives that responsibility to the joint and locks the overall plane at the torso. Limited-joint torque tests and the mixed simulation now pass. Idle creep was removed by capturing a stable recovery anchor.

## Browser and visual checks

Tests exercise mouse placement and grab/throw, pause/slow motion, catalog search, bomb scoring, local save/clear/load, reset, PNG download, partial slices, assembled character/reference comparison, multiple view selection, turntable, combined damage preview and neutral reset. Mobile coverage is touch-emulated Chrome at 390×844, including a real CDP touch start/move/end sequence. No horizontal overflow was observed.

Visual inspection verifies the removed face wrapping, more faithful tucked-arm silhouettes, reduced neck step, visible pointed feet in the neutral studio backdrop, clipping of damage to the character silhouette, and combined frost/soot/shock layers. Side/rear volume shape and animated seam transitions still need artistic review. Software-rendered browser tests verify behavior and rendering compatibility; they do not certify mobile hardware performance.

## Hardware sample

Chrome used **NVIDIA GeForce RTX 3080 Ti**, ANGLE Direct3D11, viewport **1440×1000**:

| Scene | FPS sampled | Draws | Triangles | Rigid bodies | Physics time sampled |
| --- | ---: | ---: | ---: | ---: | ---: |
| Idle refined character | 144 | 19 | 304,164 | 6 | 0.2 ms |
| 40 mixed crate/mallet/anvil/glove props | 144 | 99 | 1,172,684 | 46 | 0.4 ms |

Body coordinates remained finite. These are short local samples, not percentile benchmarks or sustained/device-wide certification. Physical Android/iOS devices, Safari and Firefox remain untested.

## Known limits

- Side/rear forms are inferred shallow volumes. Final all-angle character approval remains open.
- Character source data adds an application chunk of about 88 KB gzipped; Rapier's compatibility/WASM chunk is about 830 KB gzipped. Vite reports uncompressed chunk-size warnings, not build errors.
- Rapier emits an upstream compatibility initialization warning; tested initialization and physics work.
- The production output is `dist/`; no Vercel deployment was performed.
- Earlier GitHub Actions run `44931130735` never received a runner. Its annotation was: **“The job was not started because your account is locked due to a billing issue.”** Local checks passed. Hosted CI requires resolving that account-level issue; no hosted pass is claimed.
- Saves remain prop placements, not simulation checkpoints. No new tools, replay, challenges, leaderboard or content expansion is claimed.

Evidence scripts and screenshots are under `scripts/` and `test-results/character/`. Source and production archives, the comparison image, and this report are copied into the local deliverable outputs.
