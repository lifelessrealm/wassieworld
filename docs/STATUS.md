# Implementation status — 2026-11-21

This is the first playable development build from an empty repository. It is not the completed game described by the master directive.

| Area | Status |
| --- | --- |
| TypeScript app, static build, dependency lockfile | Implemented |
| Coherent source volumes, horizontal atlases, normals, metadata | Implemented first pipeline |
| Reference fidelity and final hero-art approval | Partial; side/rear, joints and slice appearance need refinement |
| Laboratory volume selection, rotation, partial slices | Implemented; rig/lighting editors planned |
| Six-body articulated rig, CCD, fixed step, mouse/touch grab and throw | Implemented |
| Cartoon damage, freeze/electric combination, auto recovery | Implemented subset; full expression/status library planned |
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

1. Refine canonical head/torso continuity, arm silhouettes and front texture wrapping. Author approved rear/side turnarounds and deformation-specific volumes before mass asset production.
2. Add greedy surface meshing/LOD, profile actual desktop and mobile GPUs, and measure many-prop loading/memory. Current 40-prop / 100-particle caps remain enforced.
3. Tune grab feel, joint angular limits and recovery against manual play sessions, including rapid impacts and low-gravity modes.
4. Add per-material shading, shadow proxies and a richer lighting inspection rig. Expand original audio and persist accessibility preferences.
5. Build attachment/construction, reversible editor actions and save versions, then challenges/discoveries/replays. Expand content only after graphics and physics gates pass.

Do not label remaining master-plan features implemented merely because their inventory entries exist.
