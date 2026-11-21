# Verification — 2026-11-21

Story: select a tool or body part in the browser → update the client-side Rapier world → receive measured physical events → render motion, damage, audio and score → optionally save placements to localStorage and load a fresh experiment.

This is a local browser simulation. There is no API/database boundary or secret configuration in this build.

## Automated results

| Check | Observed result |
| --- | --- |
| `npm test` | 12 passing system tests |
| `npm run assets` | 15 volume atlases/normal maps and metadata exported; 386 production requirements indexed |
| `npm run build` | TypeScript and production Vite build passed |
| `node scripts/production-smoke.mjs` | Production browser loaded, ten tools rendered, bomb scored, no debug API and no browser errors |
| `npm run test:e2e` | 5 passing Chrome browser tests, latest run 25.0 s |
| Browser startup | No page or console errors in the tested idle flow |

System tests cover changing real cross-sections, occupancy/normals, valid tool registrations, damage decay and effect expiry, bounded repeat scoring, 20 seconds of stable articulated physics, grab/release momentum, bomb force and chain reactions, freeze/electric interactions, fans/launch pads, atomic setup validation, repeated reset resource counts, object limits, and a 30-prop mixed simulation stress case.

Browser tests cover actual pointer placement and ragdoll grabbing/throwing, pause/time scale, search, bomb explosion/scoring, save/clear/load, reset, PNG downloads, laboratory source selection and slicing, and a touch-emulated 390×844 layout with placement/settings. Desktop screenshot viewport: 1440×1000. No horizontal overflow in the tested mobile layout.

## Rendering observations

Visual inspection caught initial tipping at rest and gaps between thin sprite planes during tumbling. The implemented recovery pose support and closed exposed-texel geometry address those observed defects. An idle assertion now verifies the head remains upright and the score remains zero without input. Original-source reference profiling replaced the initial ellipsoid face approximation. Final art fidelity is still a separate incomplete quality gate.

Browser tests force SwiftShader for repeatable headless WebGL coverage, measuring roughly 21–22 FPS in the initial scene. This software result does not represent the PC's hardware GPU.

An additional Chrome run used the real **NVIDIA GeForce RTX 3080 Ti**, ANGLE Direct3D11, at **1440×1000**:

| Scene | FPS sampled | Draws | Triangles | Rigid bodies | Physics time sampled |
| --- | ---: | ---: | ---: | ---: | ---: |
| Idle chamber | 144 | 18 | 152,150 | 6 | 0.2 ms |
| 40 mixed crate/mallet/anvil/glove props | 142 | 98 | 1,020,670 | 46 | 0.4 ms |

The capped scene retained finite body coordinates. These are short local samples, not percentile benchmarks, sustained thermal tests or proof of performance on lower-end hardware. Actual Android/iOS devices, Safari and Firefox have not been tested. Touch emulation is not physical-device certification.

## Build/runtime limitations

- Rapier's embedded WASM chunk is ~830 KB gzipped and triggers Vite's uncompressed chunk-size warning. No build errors.
- Rapier emits an upstream initialization-parameter deprecation warning from its compatibility wrapper; initialization and tested simulation work.
- Production static output is `dist/`. No production Vercel deployment has been performed.
- GitHub Actions run `44931130735` failed before receiving a runner or executing steps. Its annotation is: **“The job was not started because your account is locked due to a billing issue.”** Local validation passed; hosted CI requires the repository owner's GitHub billing issue to be resolved. This is an account-level blocker rather than an observed application test failure.
- Setup saves store prop placements only, with fresh velocities/fuses and scoring on load.
- Inferred side/rear character geometry, seams, slice appearance and full material profiles need further art work.
- No replay, recording, online leaderboard, challenges or bulk-content completion is claimed.

Screenshots are generated under `test-results/` and copied to the deliverable package. `scripts/profile.mjs` reproduces the short hardware sample against the local dev server. `scripts/inspect.mjs` captures the software-rendered startup state and errors.
