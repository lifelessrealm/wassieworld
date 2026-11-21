# WassieWorld development rules

Read `docs/MASTER_PLAN.md`, `docs/ART_PIPELINE.md`, and `docs/STATUS.md` before extending the game. Keep those documents and verification evidence current.

- The original image at `public/references/wassie-canonical.png` is the character source of truth. Preserve eyes, brow folds, long lips, crescent, silhouette and pointed feet. Keep damage cartoonish and bloodless.
- Generate horizontal slices from a coherent source volume. Never resize copies of a 2D drawing and call them slices. Retain source definitions, color/normal atlases, metadata and physics separately.
- High-frequency simulation lives outside the DOM. Use `STEP` and shared behavior definitions; don't invent frame-dependent physics or bespoke chain-reaction scripts.
- Keep the initial 40-prop, 100-particle budgets until profiling justifies changes. Free removed physics bodies, constraints and graphics resources.
- Add functional tools through `catalog.ts` plus a source volume and shared behavior. Planned entries in the production inventory must never appear as usable tools.
- Test meaningful changes with `npm test` and `npm run build`. Input, rendering, physics/UI integration or layout changes also require `npm run test:e2e` and screenshot inspection.
- Record actual test output. Do not claim hardware FPS, mobile browser coverage, production deployment, final art approval, replay or server-side features without evidence.
- Use development branches. Keep canonical source files and generated assets reproducible. No secrets or unlicensed audio in commits.
