# Character and asset production

## Canonical source

`public/references/wassie-canonical.png` is the high-resolution attachment recovered from **Sprite Stacking Character**. Its silhouette, eyes, glossy highlights, folded brow lines, horizontal orange-pink lips, white crescent, tucked arms and pointed white feet define Wassie. The supplied unmodified master directive is in `MASTER_PLAN.md`.

All six parts now use one source-pixel coordinate system defined in `src/assets/character.ts`: 432 original source pixels per world meter. Crops, joint positions and geometry dimensions share that scale. The baking script flood-fills the original image's exterior once, retaining the white eyes, chest and feet. Authored arm masks extract the actual tucked arms; the earlier invented ellipsoid arms have been removed.

The silhouette becomes a closed shallow volume with a small inward-distance bevel. The facial art remains on a flat front surface instead of wrapping around a cylindrical depth field. Every part has a shared front plane with tiny deterministic overlap ordering, preserving the neck, face and arm alignment. Each exported horizontal slice remains a real cross-section of that coherent source volume. The runtime extrudes exposed texel boundaries and retains real side/rear geometry.

The neutral front reconstruction now measures **0.98719 foreground intersection-over-union** against the supplied image at a common 398×782 resolution, with mean absolute channel error **5.56/255** over shared foreground. This is measured from an actual isolated Three.js render. It is a useful regression check for the supplied view, not a guarantee of pixel identity in every lit or animated state. Side/rear forms are inferred shallow volumes, not approved turnarounds. Those forms and articulated seam transitions still need review before final art approval.

## Coordinates and density

Y up, front +Z, centered pivots, meters. Character X/Y samples use one texel per four source pixels; character parts use 40–209 horizontal layers and 16 depth samples. For example, the head has 181 lateral samples and 150 layers. Non-square atlas tiles record both dimensions. Props retain their existing sample counts. Source normals derive from the signed primitive surface or the bevel field. The character's restrained light response and tone mapping preserve canonical colors; tools retain the existing PBR material. Full per-material normal/roughness atlases remain planned.

Palette anchors: skin `#5e8e3d`, ink `#17241b`, warm white `#f5f1d8`, steel `#869c9b`, orange/red `#e56d53`, wood `#bc8756`. Canonical reference front colors are preserved rather than reduced to these anchors. Runtime uses nearest-neighbor volume samples and crisp geometry; no blurry rescaling of source artwork.

## Reproduction

1. `node scripts/bake-reference.mjs` only after an intentional reference/profile change.
2. `npm run assets` generates color/normal PNG atlases, metadata and the manifest in `public/generated/`.
3. `npm run dev`, then **Asset laboratory**. The default assembled Wassie view shows the original reference beside the reconstruction. Select front, three-quarter, side, rear or turntable, then preview light/heavy impacts, frost, shock, combined layers and bandaged recovery. Individual volumes still expose slice inspection.
4. With the dev server running, `node scripts/compare-reference.mjs` captures the actual neutral front render and a side-by-side comparison. It fails below 0.975 foreground IoU or above 12/255 mean channel error. `node scripts/character-qa.mjs` captures gameplay and multiple views/status combinations.
5. Test lit, airborne, sideways, frozen, scorched, bruised and recovered views. Artist review remains required for inferred views and deformation seams.

Atlas metadata records source, dimensions, spacing, lateral/depth resolution, tile size, layer count, axis, pivot and nearest sampling. Eight columns hold contiguous slice tiles. RGB stores canonical/material color and normalized source normals; alpha stores occupancy. Reconstruction reads these same samples, extrudes boundary texels and emits exposed faces. Whole volumes render as instanced batches; the room is also batched.

Rounded character collision boxes and bomb spheres remain simpler than render geometry. Six rigid parts articulate through limited revolute joints. Bruises, blinking, tears, soot, frost and shock are separate silhouette-masked overlays anchored to the original image's facial landmarks. The old rectangular ice shell is removed. Shared whole-puppet squash, decaying recoil and automatic recovery preserve the base identity and joint continuity.

## Inventory and quality gate

The supplied plan names 386 components/assets/environments in its main inventory sections. `assets/production-inventory.json` records them as planned or first implementations. The ten runtime tool registrations are the authoritative playable set. Missing production dimensions, source files or physics definitions are null for planned content rather than fabricated values.

Before upgrading an asset to final: check front/side/rear silhouettes, crescent and eye positions, black outlines, no unintended gaps, appropriate normals under moving light, coherent world scale, collision match, multi-status readability, resets and performance. The present build has not passed final character/art approval.

## Marketing

`assets/marketing/wassieworld-poster.png` is AI-generated promotional concept art using the original reference. It is labeled **IN DEVELOPMENT** and is not represented as a gameplay screenshot. The built-in image-generation tool was used; the prompt is preserved in `assets/marketing/PROMPT.md`.
