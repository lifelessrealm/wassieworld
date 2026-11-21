# Verification — rounded anatomy, cursor tools and recovery, 2026-11-21

Story: inspect Wassie from front/side/rear → select mallet or glove → hold and sweep the cursor through the dynamic puppet → release without leaving a placed item → settle and recover through the torso; place a bomb → a wider blast pushes bodies, chains bombs and disposes its graphics.

The ten-item catalog is unchanged. All behavior is local to the browser; there is no API, database, credential or server data boundary.

## Actual checks

| Check | Result |
| --- | --- |
| npm test | 36 passing system tests, 4.44 seconds |
| npm run assets | 16 coherent source volumes exported; 386 requirements indexed |
| npm run build | TypeScript and Vite production build passed |
| npm run test:e2e | 10 Chrome browser tests passed, 1.5 minutes |
| node scripts/production-smoke.mjs | Production cursor-tool lifecycle, bomb scoring, ten-item catalog, no debug API and no browser errors |
| node scripts/compare-reference.mjs | Existing front fidelity gate passed |
| node scripts/turnaround-qa.mjs | Eight actual rendered views captured with no console/page errors |
| node scripts/profile.mjs | Hardware sample below; finite positions under 40-prop stress, no console/page errors |

Browser verification initially caught a missing fragment-shader varying in the new side lighting. Both shader stages now declare it. The production build and complete browser suite were rerun after the fix; the table records those final results.

## Character source and visual inspection

The original PNG remains unchanged. Both front and back envelopes curve, with a 1.48m-deep head, 1.12m-deep torso and 64 depth samples. The crown and neck taper; the torso has continuous skin beneath traced arms. Arm envelopes overlap the underlying torso instead of opening a gap at quarter views. Source ink near the silhouette blends to appropriate surface materials at oblique angles; volume lighting describes the sides and back.

Isolated actual Three.js render at 398×782:

- Foreground intersection-over-union: **0.9873685637**.
- Mean absolute RGB channel error: **5.29070398 / 255**.
- Existing thresholds remain IoU ≥ 0.975 and error ≤ 12 / 255.

The metric excludes near-white pixels and covers the supplied neutral front. It is not a perceptual identity score or all-angle certification. Side and rear anatomy is an authored interpretation of the single reference and still needs artistic review. Actual turnaround, side/rear wounds, frost, combined effects, cursor strikes and bomb shockwave screenshots were inspected. Slice stepping and some oblique seams remain visible at close inspection.

## Cursor and physics coverage

The system tests verify that mallet and glove are single dynamic held tools with one cursor body and one spring; held tools do not enter saves. Repeated creation/release returns to six bodies and five rig joints. Collider displacement is bounded under a sudden cursor target change. Faster sweeps produce stronger measured contacts than slow sweeps for both tools. Hammer collisions use its head; the glove uses a rounded fist collider.

Browser tests use actual mouse input to strike with each tool, check scoring, verify empty prop saves, release and select a different tool. Touch emulation exercises a held glove and touch cancellation. Existing placement/grab/throw, pause/time scale, save/load, reset, slice reconstruction and studio tests continue to pass. Idle loading makes no external HTTP requests.

Recovery tests cover raised platforms, quiet freefall, zero gravity, joint limits, repeated grabs and post-impact return to stance. A real cursor hammer hit is followed for 30 simulated seconds: settling, rising and standing occur, damage clears, and torso height changes by less than 0.04m per fixed step while rising. Torso lifting and gradual angle targets replace independent position pulls on all six parts; the other parts follow joint springs. A gentle held contact delays recovery without farming damage.

The bomb now has a 5.6m radius (previously 3.8m), greater central impulse, smooth falloff and bounded single-episode character damage. Tests verify response at 4.5m, no response beyond radius, diminishing force and chain fuses within the expanded radius. Browser tests verify a visible shockwave and repeated blasts returning renderer geometry counts to baseline tolerance. Blast groups are capped at four; the 40-prop / 100-particle budgets remain. Reduced motion suppresses shake and expanding flash/ring motion.

## Hardware sample

Chrome, NVIDIA GeForce RTX 3080 Ti, ANGLE Direct3D11, 1440×1000:

| Scene | FPS sampled | Draws | Triangles | Bodies | Physics time sampled |
| --- | ---: | ---: | ---: | ---: | ---: |
| Idle | 144 | 17 | 477,088 | 6 | 0.3ms |
| 40 mixed props | 144 | 99 | 1,692,532 | 46 | 0.7ms |

These are short local samples, not percentile benchmarks or lower-end/mobile performance certification. Browser tests separately use software WebGL. Touch emulation uses 390×844; physical phones, Safari and Firefox remain untested.

## Build and delivery limits

The application chunk is about 95KB gzipped, renderer 138KB and embedded Rapier compatibility/WASM 830KB. Vite's uncompressed chunk-size warning remains; the build passes. Rapier also emits its existing compatibility initialization warning. Source and static production archives plus current screenshots and this report are copied to local outputs. No Vercel deployment was performed.

Prior GitHub Actions runs could not start because of the account billing lock. Local checks pass; no hosted CI pass is claimed. Saves remain versioned prop placements, not simulation checkpoints. Legacy placed hammer/glove entries still load through the prop path; new pointer interactions use held tools.
