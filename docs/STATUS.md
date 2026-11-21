# Implementation status — 2026-11-21

The playable foundation now has a side/rear volume and natural-reaction refinement pass. The existing ten-tool catalog is unchanged. It is not the completed master-plan release.

| Area | Status |
| --- | --- |
| TypeScript app, static build, dependency lockfile | Implemented |
| Coherent source volumes, horizontal atlases, normals, metadata | Implemented first pipeline |
| Reference fidelity and final hero-art approval | Rounded rear envelopes, sculpted eye/lip relief, tapered neck/torso and volumetric feet. Front IoU remains about 0.9873. Inferred side/rear anatomy still requires artistic approval. |
| Character studio | Front, quarter, left/right, rear, turntable and side/rear damage presets. Geometry-conforming combined effects. Lighting editor planned. |
| Six-body articulated rig, CCD, fixed step, mouse/touch grab and throw | Passive inertia-scaled joint settling; contact-supported recovery at platform height; bounded spring grab and velocities. |
| Cartoon damage, freeze/electric combination, auto recovery | Contact-point and mass-sensitive impacts, per-part/per-surface marks, continuous directional recoil, surface frost/soot/shock, depth-aware stars and bandages. Full expression library planned. |
| Testing chamber and ten functional tools | Implemented first gameplay loop |
| Scoring, catalog search/categories, pause/time/gravity/reset/delete | Implemented |
| Local prop setup save/load, PNG screenshot export | Implemented |
| Synthesized effects and motion/resolution controls | Implemented first pass; music/voice and full mixing planned |
| Full 386-entry production inventory | Indexed from supplied plan; most assets planned |
| Contraption attachments, undo/redo, rotation gizmo, destruction | Planned |
| Challenge/daily modes, achievements, Wassiepedia, unlocks | Planned |
| Replay, clip export, setup share codes, server persistence, leaderboards | Planned |
| 12 environments, hundreds of finished tools, vehicles and creatures | Planned |
| Vercel deployment | Build-ready; not deployed |
| GitHub Actions | Workflow committed; account billing lock prevented runner startup. Local checks passed. |
| 60 FPS desktop / 30–60 FPS mobile hardware targets | Not certified; see measured evidence in VERIFICATION.md |

## Next quality gates

1. Review the authored side/rear interpretation against the supplied front drawing. Refine neck transitions and animation poses before final all-angle approval and content expansion.
2. Add greedy surface meshing/LOD, profile actual desktop and mobile GPUs, and measure many-prop loading/memory. Current 40-prop / 100-particle caps remain enforced.
3. Gather play feedback on weight, passive joint lag, contact-point reactions and supported recovery. Automated platform, airborne, repeated-hit, mass-response and zero-gravity regressions pass.
4. Add per-material shading, shadow proxies and a richer lighting inspection rig. Expand original audio and persist accessibility preferences.
5. Build attachment/construction, reversible editor actions and save versions, then challenges/discoveries/replays. Expand content only after graphics and physics gates pass.

Do not label remaining master-plan features implemented merely because their inventory entries exist.
