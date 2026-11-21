# Verification — mobile-centered play, 2026-11-21

Story: open a phone-sized viewport → see a centered, usable Wassie → choose a toy with a thumb → swipe to strike or tap to place → pinch/pan without accidental actions → recover and recenter → rotate or reopen with preferences intact.

Mobile play is the main focus. The existing ten-tool catalog is unchanged. The application remains a local browser simulation with no API/database/account boundary.

## Checks actually performed

| Check | Observed result |
| --- | --- |
| npm test | **45 passing system tests**, 5.25 seconds |
| npm run assets | 16 coherent source volumes; 386 requirements indexed |
| npm run build | TypeScript and production Vite build pass |
| npm run test:e2e | **17 passing Chrome tests**, 2.8 minutes |
| Final focused mobile rerun | All **six mobile tests pass**, 44.5 seconds, after the final HUD placement cleanup |
| node scripts/production-smoke.mjs | Desktop production held-tool lifecycle and bomb score; no debug API or browser errors |
| node scripts/mobile-production-smoke.mjs | Real touch punch scores; All toys search selects a bomb; tap blast scores; viewport fits; debug API absent; no browser errors |
| node scripts/mobile-qa.mjs | Five viewport screenshots/layout reports, no overflow or browser errors |
| node scripts/turnaround-qa.mjs | Eight actual anatomy/reaction views, no browser errors |
| node scripts/compare-reference.mjs | Existing neutral-front fidelity gate passes |

## Mobile layout evidence

Chrome touch emulation, device scale factor 2, renderer pixel ratio **1**:

| Layout | CSS viewport | Play area |
| --- | --- | --- |
| Portrait | 390×844 | 390×604 |
| Small phone | 360×640 | 360×400 |
| Smallest checked | 320×568 | 320×328 |
| Landscape | 844×390 | 742×282, side tool rail |
| Tablet | 768×1024 | 768×784 |

Document width and height equal the viewport in every sampled layout. The subject center projects within about 3% of horizontal center and 3% of vertical center in these idle views. Primary touch buttons are checked for at least **44×44 CSS pixels** and for being within the phone viewport. Final portrait, smallest-phone and landscape images were visually inspected; helper text and capture controls were adjusted to avoid clipping/overlap on the shortest phone.

Portrait has a bottom swipe dock and six primary thumb controls: Grab, pause, speed, reset, Center and More. The first three dock toys are hammer, glove and bomb. Landscape uses a right rail. All toys provides a searchable native sheet; More holds secondary actions. These sheets suspend pointer actions, pause play and restore the preceding pause state, including a help sheet opened from More. Studio selectors move into the dock/rail instead of covering the character.

Dynamic viewport units and safe-area padding are implemented. Physical browser chrome, device cutouts, virtual-keyboard behavior and Safari safe areas have not been verified on hardware.

## Touch and camera boundaries

The browser tests exercise actual CDP touch input for:

- Tap placement, part grabbing, cursor-held hammer/glove sweeps and scored contacts.
- Two-finger pan/pinch, including a selected bomb: no prop is created when the second finger arrives, and a leftover finger does not become a new tap.
- Held-tool cancellation and orientation/viewport changes returning to six rig bodies/five joints.
- Center restoring zoom and camera follow bringing a struck character back into view.
- Accessible tool search/selection, action sheets, pause restoration and persisted sound/motion/graphics settings after reload.

Touch placement commits on release with a 14px movement limit. The camera follows after release and freezes during a grab or held strike. Compact framing starts with a 5.8m minimum world span; it does not scale the entire desktop chamber down. Touch grabbing has an 18px fallback near projected body bounds. Input cancellation, hidden tabs and modal sheets release springs and pointer capture. The DOM and renderer retain one fixed-step simulation.

Compact rendering defaults to 1x pixel ratio and hides cropped background lettering. This reduces pixel cost; it is **not a physical-mobile FPS or battery claim**. The same character volumes and physics run on mobile and desktop. No PWA installation, offline-first behavior or public deployment is claimed.

## Character, strike and recovery regressions

Quarter-angle source ink fades gradually toward the side material to reduce stretched dark seams. Rear arm bulges taper at their ends. The mallet aim has slightly more lag and both tool profiles have stronger spring give after contact. Existing contact-local bursts, winces, glove compression, procedural sounds and separation-based strike gating remain functional.

The original PNG and X/Y landmarks are unchanged. Actual isolated neutral-front Three.js comparison at 398×782 remains:

- Foreground IoU **0.9873276514**.
- Mean absolute RGB channel error **5.2759357423 / 255**.
- Existing gate: IoU ≥ 0.975, error ≤ 12 / 255.

This foreground metric excludes near-white pixels and measures the supplied front only. Side/rear interpretation and subjective strike feel still need artistic/play feedback; no all-angle identity certification is claimed.

All prior regressions continue to pass: bounded joint/grab motion, atlas containment, no hidden pose force in freefall/zero gravity, raised-platform support, one strike per continuous contact, continuous recoil, post-hit upright recovery, interrupted recovery, no injury loop from gentle foot planting, bomb falloff/chaining, prop/particle budgets, save validation and reset cleanup. Desktop browser flows remain covered by the full 17-test run.

## Delivery and limits

The app chunk is about 99.5KB gzipped, renderer 138KB, Rapier compatibility/WASM 830KB and CSS 6.2KB. Vite's uncompressed chunk-size warning and Rapier's existing initialization warning remain; build and tested startup pass. No current physical-mobile hardware benchmark was performed. Android/iOS hardware, Safari, Firefox, long-session thermals and low-end GPU performance remain open quality gates.

Source/static production archives, mobile screenshots, turnaround, fidelity JSON and this report are copied to local outputs. GitHub Actions previously could not start because of the account billing lock; no hosted CI pass is claimed. No Vercel deployment was performed. Saves remain versioned prop placements rather than simulation checkpoints.
