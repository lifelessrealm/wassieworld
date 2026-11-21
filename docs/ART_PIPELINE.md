# Character and asset production

## Canonical source

`public/references/wassie-canonical.png` is the high-resolution attachment recovered from **Sprite Stacking Character**. Its silhouette, eyes, glossy highlights, folded brow lines, horizontal orange-pink lips, white crescent, tucked arms and pointed white feet define Wassie. The supplied unmodified master directive is in `MASTER_PLAN.md`.

The current source model uses authored crop regions from this reference. The baking script flood-fills exterior white while retaining enclosed white eyes, chest and feet, producing deterministic pixel profiles. A row-based curved depth field turns the mask into a closed 3D volume; front surfaces inherit canonical colors, side/rear skin use the canonical green. Those source volumes are sampled at common X/Z grids at fixed Y intervals. Each exported slice is an actual cross-section of that coherent volume.

This reference-assisted volume preserves front-view identity more closely than the first all-ellipsoid model. It remains an initial reconstruction: the rear/side shapes are inferred, not approved orthographic turnarounds. Joint seams, separate arm silhouettes, texture wrapping, slice banding and feet still need production art refinement. Do not mark character fidelity or the phase-2 visual gate complete yet.

## Coordinates and density

Y up, front +Z, centered pivots, meters. Character parts use 24–80 slices and 48–64 X/Z samples. Props use 32–48 layers and 48 X/Z samples. Source normals derive from the signed primitive surface or depth field. Skin is matte, metal slightly reflective; full per-material normal/roughness atlases remain planned.

Palette anchors: skin `#5e8e3d`, ink `#17241b`, warm white `#f5f1d8`, steel `#869c9b`, orange/red `#e56d53`, wood `#bc8756`. Canonical reference front colors are preserved rather than reduced to these anchors. Runtime uses nearest-neighbor volume samples and crisp geometry; no blurry rescaling of source artwork.

## Reproduction

1. `node scripts/bake-reference.mjs` only after an intentional reference/profile change.
2. `npm run assets` generates color/normal PNG atlases, metadata and the manifest in `public/generated/`.
3. `npm run dev`, then **Asset laboratory**. Rotate in the laboratory, vary slice count, inspect multiple assets, and follow the canonical-reference link.
4. Test lit, airborne, sideways, frozen, scorched, bruised and recovered views. Compare the rendered face to the supplied original. The current lab rotates automatically; manual orbit/light presets and rig inspection remain planned.

Atlas metadata records source, dimensions, spacing, resolution, layer count, axis, pivot and nearest sampling. Eight columns hold contiguous slice tiles. RGB stores canonical/material color and normalized source normals; alpha stores occupancy. Reconstruction reads these same samples, extrudes their boundary texels, and emits only exposed faces. Whole volumes render as instanced batches; the room is also batched.

Collision boxes and bomb spheres remain deliberately simpler than render geometry. Six rigid parts articulate independently. Facial damage is a separate transparent overlay; ice is a separate shell; physical flattening is reversible render deformation. Combined states preserve the base identity.

## Inventory and quality gate

The supplied plan names 386 components/assets/environments in its main inventory sections. `assets/production-inventory.json` records them as planned or first implementations. The ten runtime tool registrations are the authoritative playable set. Missing production dimensions, source files or physics definitions are null for planned content rather than fabricated values.

Before upgrading an asset to final: check front/side/rear silhouettes, crescent and eye positions, black outlines, no unintended gaps, appropriate normals under moving light, coherent world scale, collision match, multi-status readability, resets and performance. The present build has not passed final character/art approval.

## Marketing

`assets/marketing/wassieworld-poster.png` is AI-generated promotional concept art using the original reference. It is labeled **IN DEVELOPMENT** and is not represented as a gameplay screenshot. The built-in image-generation tool was used; the prompt is preserved in `assets/marketing/PROMPT.md`.
