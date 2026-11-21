# Verification — turnaround and strike polish, 2026-11-21

Story: inspect the nape, flank, rear arms and heels → sweep a cursor-held mallet or glove into Wassie → show contact-local feedback and a wince → release cleanly → settle, rise and finish genuinely upright.

The ten-tool catalog is unchanged. This is a local browser simulation; there is no API, database, credential or server-data boundary.

## Final checks

| Check | Actual result |
| --- | --- |
| npm test | **43 passing**, 5.27 seconds |
| npm run assets | 16 coherent volumes exported; 386 requirements indexed |
| npm run build | TypeScript and Vite production build passed |
| npm run test:e2e | **11 passing Chrome tests**, 1.8 minutes |
| node scripts/production-smoke.mjs | Production held-tool lifecycle, bomb scoring, ten tools, no debug API, no browser errors |
| node scripts/turnaround-qa.mjs | Eight rendered anatomy/surface-reaction views, no console/page errors |
| node scripts/compare-reference.mjs | Existing front fidelity gate passed |
| node scripts/profile.mjs | Finite positions at 40 props, no console/page errors; hardware sample below |

## Character source and visual evidence

The original canonical PNG is unchanged. Row contours have wider smoothing; occipital and shoulder masses are authored independently of front facial relief. Atlas headroom prevents displaced head surfaces being cut into a flat rear cap. The traced arms follow both torso surfaces so they remain visible behind the flanks. Posterior arm material/seams and fuller heels clarify the rear stance. All six front/back envelopes are tested for containment inside their source bounds.

Actual isolated neutral-front Three.js comparison at 398×782:

- Foreground IoU: **0.9873276514**.
- Mean absolute RGB channel error: **5.2759357423 / 255**.
- Existing thresholds remain **0.975** minimum IoU and **12 / 255** maximum error.

The metric excludes near-white pixels and measures the supplied front only. It is not a perceptual identity score or certification of inferred side/rear anatomy. Actual turnaround, canonical comparison and frozen-at-contact hammer/glove screenshots were inspected. Oblique seams and slice stepping remain visible under close inspection; final artistic approval is open.

## Strike and recovery checks

System tests verify distinct fixed-step mallet/glove profiles, bounded cursor following, swing strength, separation-based arming, continuous wrist recoil and glove compression, cross-rate spring settling, tool-specific damage/wince timing, and unscored swing events. Tool hits are distinguished from later floor landings when measuring sweep strength. Contact velocity includes rotation about the previous world center of mass, including offset hammer-head colliders.

Actual mouse strokes in Chrome trigger a contact burst and wince for each tool. A test freezes at the real contact, checks the consumed strike gate and simulation pause, captures the result, then releases and follows the puppet to an upright standing state. No position or velocity is overwritten to achieve that recovery. Touch emulation still covers placement, grabbing, held glove motion and cancellation. Held tools remain absent from saves, and resets return to six bodies/five rig joints. Idle loading issues no external HTTP requests.

The new end-to-end recovery check exposed an early standing label and a permanent lean that older height-only checks missed. Standing now requires actual height, angle and low speed. The final upright servo is stronger than passive ragdoll settling, while a 2.4-second quintic phase stages orientation before the lift. Low-energy foot planting during a recent assisted rise does not create fresh damage and a collapse loop; moving props and significant falls still interrupt recovery. Platform support, unassisted freefall, zero gravity, repeated torque, long grabs, landing spacing, damage clearing and interrupted get-up regressions all pass.

Hit-stop ends the current simulation batch and displays the completed contact pose. Hammer feedback has a longer hold and lower knock; glove feedback is quicker, with a pop and spring rebound. Contact-anchored bursts use shared geometry and at most four groups. Expired materials/instances are freed; effects follow pause/time scale and reduced motion. The 40-prop / 100-loose-particle budgets remain. Blast cleanup checks wait for actual effect expiry rather than assuming a fixed wall-clock delay while hit-stop is active.

## Hardware sample

Chrome, **NVIDIA GeForce RTX 3080 Ti**, ANGLE Direct3D11, **1440×1000**:

| Scene | Sampled FPS | Draws | Triangles | Bodies | Sampled physics time |
| --- | ---: | ---: | ---: | ---: | ---: |
| Idle | 144 | 17 | 464,640 | 6 | 0.3ms |
| 40 mixed props | 144 | 99 | 1,666,924 | 46 | 0.6ms |

These are short local samples, not percentile/thermal benchmarks or certification for lower-end devices. Browser tests separately use software WebGL. Touch emulation is 390×844; physical phones, Safari and Firefox remain untested.

## Build and delivery limits

The app chunk is about 97KB gzipped, renderer 138KB, embedded Rapier compatibility/WASM 830KB. Vite's uncompressed chunk-size warning and Rapier's existing compatibility initialization warning remain; builds and tested initialization pass. No Vercel deployment was performed. Source/production archives, current screenshots and this report are copied to local outputs.

Prior GitHub Actions jobs could not start because of the account billing lock. No hosted CI pass is claimed. Saves remain versioned prop placements rather than simulation checkpoints. Side/rear interpretation and the subjective weight of strikes still need play feedback before final art/feel approval.
