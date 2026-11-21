# Character and asset production

## Canonical source

`public/references/wassie-canonical.png` is the high-resolution attachment recovered from **Sprite Stacking Character**. Its silhouette, eyes, glossy highlights, folded brow lines, horizontal orange-pink lips, white crescent, tucked arms and pointed white feet define Wassie. The supplied unmodified master directive is in `MASTER_PLAN.md`.

All six parts now use one source-pixel coordinate system defined in `src/assets/character.ts`: 432 original source pixels per world meter. Crops, joint positions and geometry dimensions share that scale. The baking script flood-fills the original image's exterior once, retaining the white eyes, chest and feet. Authored arm masks extract the actual tucked arms; the earlier invented ellipsoid arms have been removed.

The source mask now bounds an authored front/back depth envelope. Smoothed row contours and rounded cross-sections form the back of the head, tapered neck, torso, arms and feet. Eye hemispheres and a projecting lip volume provide a readable side profile. The back envelope is independent of facial relief; eyes and mouth are not mirrored onto the rear. White eyes and feet retain appropriate material colors around their sides.

The supplied artwork remains projected in its original X/Y source coordinates onto the front relief. Front material response preserves that drawing's colors; stronger rear/side lighting and grazing outlines describe the new volume. Shared alignment and small overlap ordering retain the neck and arm joins. Every exported horizontal slice still samples a coherent closed source volume.

The neutral front reconstruction retains approximately **98.7% foreground intersection-over-union** against the supplied image at 398×782, measured from an isolated Three.js render. This checks the supplied view, not identity under every light or deformation. Side/rear forms are authored interpretations of the single reference; final art approval remains open. The turnaround sheet contains actual engine renders, not additional canonical reference images.

## Coordinates and density

Y up, front +Z, centered pivots, meters. Character X/Y samples use one texel per four source pixels; parts use 40–209 horizontal layers and **64 depth samples**. The head is 1.48 m deep with 0.32 m of facial relief allowance; the torso is 1.12 m deep. Arms wrap the flank in 1.14 m source bounds, and feet have 1.1 m heel/toe depth. Source normals derive from front/back envelope gradients. Atlas tiles record both lateral and depth resolution. Props retain their existing sample counts. Full per-material normal/roughness atlases remain planned.

Palette anchors: skin `#5e8e3d`, ink `#17241b`, warm white `#f5f1d8`, steel `#869c9b`, orange/red `#e56d53`, wood `#bc8756`. Canonical reference front colors are preserved rather than reduced to these anchors. Runtime uses nearest-neighbor volume samples and crisp geometry; no blurry rescaling of source artwork.

## Reproduction

1. `node scripts/bake-reference.mjs` only after an intentional reference/profile change.
2. `npm run assets` generates color/normal PNG atlases, metadata and the manifest in `public/generated/`.
3. `npm run dev`, then **Asset laboratory**. The default assembled Wassie view shows the original reference beside the reconstruction. Select front, three-quarter, side, rear or turntable, then preview light/heavy impacts, frost, shock, combined layers and bandaged recovery. Individual volumes still expose slice inspection.
4. With the dev server running, `node scripts/compare-reference.mjs` captures the actual neutral front render and a side-by-side comparison. It fails below 0.975 foreground IoU or above 12/255 mean channel error. `node scripts/character-qa.mjs` captures gameplay and multiple views/status combinations.
5. `node scripts/turnaround-qa.mjs` captures front, three-quarter, side and rear anatomy plus side/rear impacts and rear frost. The studio exposes left/right views and side/rear impact presets. Review these alongside gameplay, airborne and recovery views.

Atlas metadata records source, dimensions, spacing, lateral/depth resolution, tile size, layer count, axis, pivot and nearest sampling. Eight columns hold contiguous slice tiles. RGB stores canonical/material color and normalized source normals; alpha stores occupancy. Reconstruction reads these same samples, extrudes boundary texels and emits exposed faces. Whole volumes render as instanced batches; the room is also batched.

Rounded character collision boxes and bomb spheres remain simpler than render geometry. Six parts articulate through limited revolute joints with passive inertia-scaled settling. Damage decals conform to the same reconstructed surface geometry, rather than floating on front-only planes. Marks record part and front/back/flank surface; global soot, frost and shock cover the full volume. Eyelids and tears use the original image's landmarks. Shared directional squash and continuous recoil preserve rig continuity.

## Inventory and quality gate

The supplied plan names 386 components/assets/environments in its main inventory sections. `assets/production-inventory.json` records them as planned or first implementations. The ten runtime tool registrations are the authoritative playable set. Missing production dimensions, source files or physics definitions are null for planned content rather than fabricated values.

Before upgrading an asset to final: check front/side/rear silhouettes, crescent and eye positions, black outlines, no unintended gaps, appropriate normals under moving light, coherent world scale, collision match, multi-status readability, resets and performance. The present build has not passed final character/art approval.

## Marketing

`assets/marketing/wassieworld-poster.png` is AI-generated promotional concept art using the original reference. It is labeled **IN DEVELOPMENT** and is not represented as a gameplay screenshot. The built-in image-generation tool was used; the prompt is preserved in `assets/marketing/PROMPT.md`.

## Rounded turnaround refinement

The head is 1.48m deep and torso 1.12m deep within the existing source-pixel scale. Both envelopes now curve across the silhouette instead of keeping a flat front cap. The crown tapers into a deeper cranium; a lower neck shift and torso taper give the profile more mass. Character cross-sections sample 64 depth texels. A thin closed rim retains occupied source columns at the silhouette.

The rebake fills continuous green torso skin underneath the traced arm masks. Arm envelopes follow the underlying torso surface with a small overlap, so rotation no longer opens a gap between the chest and floating arm panels. The source arm ink belongs to the independently moving arms. Color/normal/side-material atlases are reproducible through the exporter.

Front-facing artwork remains reference-aligned. At oblique angles, painted silhouette ink and antialiasing near the rim blend into the appropriate skin/eye/lip/foot material; this prevents a stretched black/white stripe on curved surfaces. The frontal material treatment gives way to volume lighting at side/rear angles. This is a material treatment on one closed 3D volume, not a separate side sprite.

## Nape, flank and heel pass

Row contours use a wider triangular smoothing window to reduce horizontal lighting bands. Rear cranium and shoulder masses are authored separately from the source facial relief. The head and torso reserve room inside their atlas bounds for displacement: the former envelope exceeded the head bounds and was clipped to a flat rear cap. Regression tests now check all six envelopes for clipping and retain headroom behind the cranium.

Arm envelopes now follow both the front and back torso surface, with a small outer bulge. Their posterior material and inner seam keep them legible from behind without copying front arm ink. Heel depth reaches toward the back of the body, giving the side stance a fuller base. Original X/Y crops, facial landmarks and the unmodified canonical image remain the source of the front view.

## Oblique and compact-view polish

Original silhouette ink now fades gradually toward its side material as the camera leaves the front, reducing stretched dark seams at quarter angles. Posterior arm bulges taper at the shoulder/hand ends rather than ending in flat strips. The unchanged source front remains gated by the existing comparison. Compact camera framing shows the same source volumes and reaction surfaces at a larger useful screen size; it does not swap in a flatter mobile character.
