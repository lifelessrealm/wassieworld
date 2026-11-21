# Architecture

Vite and TypeScript provide a static browser app. Three.js owns rendering; Rapier 3D owns physics. The interface is ordinary accessible HTML rather than a render-loop-driven UI framework. This avoids scheduling simulation updates through component rerenders.

## Boundaries

- `src/game/simulation.ts`: independent simulation, articulated rig, props, drag constraint, contacts, shared field behaviors, setup validation. No browser or graphics dependency.
- `src/game/damage.ts`: independent, time-based layered damage and bounded combo scoring.
- `src/assets/catalog.ts`: the ten functional item registrations. Tool mass, material response and behavior are data.
- `src/assets/volumes.ts`: coherent 3D source sampling and atlas compilation. Procedural primitives for tools; canonical silhouette/depth fields for character parts.
- `src/assets/canonical-data.ts`: generated reference profiles. Reproducible from the original image with `scripts/bake-reference.mjs`.
- `src/assets/character.ts`: one canonical source-pixel/world scale, part crops, rig pivots, masses and joint limits. This prevents mismatched head/body proportions.
- `src/engine/character-effects.ts`: geometry-conforming decals, per-surface/per-limb marks, eyelids, tears, soot, frost, electrical effects and volumetric orbiting stars. The gameplay and studio share one damage model.
- `src/game/rig-physics.ts`: bounded contact-response math and inertia-scaled passive joint springs.
- `src/engine/stack.ts`: reconstructs aligned slice texels into exposed geometry. Instances and immutable geometry are shared between repeated assets. The laboratory has independent draw ranges.
- `src/engine/game.ts`: scene, lighting, camera, interpolation, input, presentation, particles and measured renderer statistics.
- `src/engine/audio.ts`: gesture-unlocked Web Audio with rate-limited original synthesized effects.
- `src/main.ts`: catalog, controls, dialogs, local storage and UI feedback. Development inspection surface is removed from production.

## Physics

Y is up; Z is depth. Gameplay bodies translate in X/Y and rotate around Z, retaining 3D render volumes. This makes a readable 2.5D chamber. Rapier uses meters and a fixed 1/120 s step. The accumulator limits catch-up to 12 steps per frame and drops excess time after long stalls. Render positions and rotations interpolate between the previous and current completed steps. Tab hiding resets the accumulator and releases grabbing.

Six dynamic bodies connect through five revolute joints with authored relative angle limits. The torso locks the overall simulation plane; child joints constrain the remaining bodies. Duplicating those axis locks on the children overconstrained the solver and has been removed. Collision groups prevent self-collision. A damped spring joint links the grabbed local point to a smoothed kinematic cursor, capped at 12 m/s. Releasing deletes the cursor and spring while retaining momentum. Linear and angular speeds are bounded.

Recovery requires measured support, a quiet interval and sufficiently low body speed. Contact manifolds identify the support surface and its height. A brief support grace period handles solver contact flicker; it cannot sustain a pose during an actual flight. The pose controller blends a torso-led rise over 2.2 seconds after an interaction and uses that support height, so standing on a platform does not pull Wassie through it. It captures a new horizontal anchor after a throw, impact or real flight, rather than chasing brief changes in eligibility. Held grabs, zero gravity, freezing and electrical reactions disable floor recovery.

Passive relative joint springs use each part's rotational inertia and apply equal/opposite torques to the torso. They let the head and limbs lag and settle without stiff motors. Recovery angular acceleration is bounded in inertia space, replacing mass-scaled torques that made light limbs too rigid.

Contact-point velocity includes angular motion. Impact strength combines measured contact impulse, incoming speed and reduced mass, so light objects and large constraint-force spikes do not produce disproportionate damage. Local contact positions and normals select the actual struck body part and surface. Only the strongest contact in a step triggers a reaction, with a 120 ms global cooldown. Bombs apply radius-weighted impulses and contribute one character damage episode. The existing rocket, field and elemental behaviors remain available.

Damage recoil is an integrated damped spring. New hits add velocity while keeping the current deformation continuous. Its compression axis follows the contact normal with axis symmetry, so landing does not rotate the squash through a half-turn. A shared transform deforms the complete puppet and preserves seams. Strong hits add at most 45 ms of hit-stop when reduced motion is off; particles follow pause and time scale.

Decals reuse immutable volume geometry, with per-instance shader uniforms and a face texture for eyelids/tears. Front, back, left and right wounds remain distinct. Global frost/soot/shock render over all six parts and orbiting stars have real depth. Removing an overlay disposes its material, texture and instance resources, while preserving the shared source geometry.

## Save boundary

Version 1 saves prop identity, position and angle. Validate the entire payload before replacing the current room. Unknown tools, nonfinite numbers, incompatible versions and oversized arrays fail atomically. Position limits are clamped on spawn. It intentionally does not serialize WASM world state, transient effects or player settings.

## Extending content

1. Author a coherent source volume and validate the reconstruction at multiple angles.
2. Add a catalog registration with physical parameters and an existing behavior, or implement a reusable new behavior.
3. Regenerate atlases and update production inventory status.
4. Test the actual collision, effect, reset and persistence path. Recheck graphics budgets.

## Rendering research decisions

[Three.js InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) supports repeated geometry with independent transforms and reduced draw overhead. The original thin-plane approach exposed gaps during tumbling. The selected implementation reconstructs the same horizontal atlas into extruded boundary texels and eliminates hidden interior faces. Curved normals come from the source volume, rather than assigning a flat upward normal to every slice. This trades some geometry for closed silhouettes. Further greedy meshing and asset LOD remain future optimizations.

[Rapier's joint documentation](https://rapier.rs/docs/user_guides/javascript/joints/) supports articulated dynamic bodies. [Contact-force events](https://rapier.rs/docs/user_guides/javascript/advanced_collision_detection/) provide the measured collision input to reactions and scoring. Fixed stepping, CCD and independent simplified colliders keep rendering detail outside collision computation.

## Cursor tools and recovery refinement

The catalog marks mallet and glove as `held`. Hover shows a shared-geometry preview without creating a physics body. Pointer down creates one dynamic tool and a kinematic cursor connected through a damped handle spring. Fixed-step cursor motion is speed-limited; angular targets follow the sweep with inertia. The mallet collider covers the head rather than its entire empty bounding box, and the glove uses a rounded fist collider. Release, cancellation, blur, hidden tabs, selection changes, laboratory entry and resets remove the held body, cursor and spring. Held tools never enter setup saves or the loose-prop budget. Legacy setup placements still load through the ordinary prop path.

A collision with the held tool delays recovery even when a gentle nudge is below the damage threshold. After quiet supported settling, a smooth 2.2-second phase raises and rotates the torso toward its standing pose. The other parts follow passive joint springs and angular damping; there are no six independent positional pulls. Newly reset standing bodies settle in 0.65 seconds. Freefall still has no pose force.

Bomb radius is 5.6m with power falling as `(1-distance/radius)^1.2`; one strongest character hit is applied per blast. Temporary shockwave/fireball/light groups are capped at four; particles retain the shared 100-particle cap. Expired graphics and active effects at disposal free their resources. Reduced motion suppresses camera shake and the moving flash/ring.
