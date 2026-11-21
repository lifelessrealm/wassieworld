# WassieWorld

A very unfortunate browser physics sandbox. This is the first playable development build, based on the recovered **Sprite Stacking Character** conversation and its canonical character image and master plan.

## Play locally

Requires **Node.js 24+**, npm, and a browser with WebGL 2.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Select an object, click inside the chamber to deploy it, then use **Grab** to drag a body part or prop. Release while moving to throw. Touch input is supported.

**G** grab · **1–0** tools · **Space** pause · **T** slow motion · **R** reset Wassie · **Shift+R** clear room · **L** laboratory · **Esc** release · scroll to zoom.

## Implemented

- Six-body articulated Wassie with limited joints, passive inertia-scaled settling, CCD, fixed 120 Hz physics, a damped spring grab and support-aware recovery that respects platforms and airborne motion.
- Ten functional tools: mallet, glove, anvil, crate, bomb, rocket, launch pad, fan, cryo capsule, Tesla coil. Shared impulses, timed explosions, chain reactions, fields and freeze/electric combinations.
- Reference-assisted coherent source volumes, horizontal color/normal cross-sections, exported PNG atlases and metadata, exposed-texel extrusion, instanced rendering, volume-derived normals, nearest-neighbor source sampling, contact shadows.
- Reference-aligned proportions, traced arms and preserved facial art with rounded back/neck/torso volumes, sculpted eye/lip relief and volumetric feet. Neutral front overlap remains about 98.7%. Side/rear anatomy is an authored interpretation pending final art approval.
- Geometry-conforming bruises, blinking, tears, soot, frost, electrical effects and depth-aware stars. Marks retain the struck part and front/back/flank surface. Impacts use contact-point velocity and reduced mass; repeated hits blend continuous directional recoil.
- Scoring with bounded repeat rewards and combo expiry. Real frame/draw/body counters.
- Searchable categorized catalog, pause, time scaling, gravity toggle, deletion, resets, local setup save/load, screenshot download, synthesized impact audio, reduced motion and three resolution presets.
- Character studio with assembled-rig/reference comparison, manual views, turntable and combined damage previews. Individual volumes retain partial slice reconstruction.

## Validate and regenerate

```sh
npm test
npm run assets
npm run build
npm run test:e2e
```

Browser tests use installed Google Chrome. In CI, Playwright installs it with `npx playwright install chrome`. Setups are versioned prop placements in localStorage, not simulation checkpoints or recordings. Loading resets velocities, fuses, scoring and Wassie.

The asset exporter produces color and normal atlases plus metadata for 16 source volumes, and indexes 386 named requirements from the supplied master plan. Planned assets are explicitly marked `planned`; they are not represented as playable content. To rebake canonical pixel profiles after an intentional reference/crop change: `node scripts/bake-reference.mjs`, then `npm run assets`.

With the dev server running, `node scripts/compare-reference.mjs` checks the neutral front render against the original. `node scripts/character-qa.mjs` captures the studio and reactions; `node scripts/turnaround-qa.mjs` creates an eight-view anatomy/damage sheet from actual engine renders.

## Production build and hosting

`npm run build` outputs `dist/`. This is a static Vite application, ready for Vercel's **Vite** preset (`npm run build`, output directory `dist`). No secrets, server, wallet, database or paid service is required. Deployment has not been performed as part of this build. `npm run preview` serves the production build locally.

The physics vendor chunk embeds Rapier WASM and is approximately 830 KB gzipped; Vite reports uncompressed chunk-size warnings. DM Sans and Space Grotesk Latin variable fonts are bundled locally with their SIL OFL licenses in `public/fonts/`. Loading and play require no external font requests. The font packaging can be reproduced with `node scripts/vendor-fonts.mjs` when network access is available.

## Development documentation

- [Master plan supplied in the original conversation](docs/MASTER_PLAN.md)
- [Architecture and extension points](docs/ARCHITECTURE.md)
- [Character fidelity and asset pipeline](docs/ART_PIPELINE.md)
- [Honest implementation status and next milestones](docs/STATUS.md)
- [Verification evidence and limitations](docs/VERIFICATION.md)
- [Production inventory](assets/production-inventory.json)

This build is an initial playable foundation, **not the completed master-plan release**. See the status document before expanding content.
