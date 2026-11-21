# Architecture

Vite and TypeScript provide a static browser app. Three.js owns rendering; Rapier 3D owns physics. The interface is ordinary accessible HTML rather than a render-loop-driven UI framework. This avoids scheduling simulation updates through component rerenders.

## Boundaries

- `src/game/simulation.ts`: independent simulation, articulated rig, props, drag constraint, contacts, shared field behaviors, setup validation. No browser or graphics dependency.
- `src/game/damage.ts`: independent, time-based layered damage and bounded combo scoring.
- `src/assets/catalog.ts`: the ten functional item registrations. Tool mass, material response and behavior are data.
- `src/assets/volumes.ts`: coherent 3D source sampling and atlas compilation. Procedural primitives for tools; canonical silhouette/depth fields for character parts.
- `src/assets/canonical-data.ts`: generated reference profiles. Reproducible from the original image with `scripts/bake-reference.mjs`.
- `src/assets/character.ts`: one canonical source-pixel/world scale, part crops, rig pivots, masses and joint limits. This prevents mismatched head/body proportions.
- `src/engine/character-effects.ts`: reference-aligned, silhouette-masked bruises, eyelids, tears, soot, frost and electrical overlays. Uses the same damage state in gameplay and the character studio.
- `src/engine/stack.ts`: reconstructs aligned slice texels into exposed geometry. Instances and immutable geometry are shared between repeated assets. The laboratory has independent draw ranges.
- `src/engine/game.ts`: scene, lighting, camera, interpolation, input, presentation, particles and measured renderer statistics.
- `src/engine/audio.ts`: gesture-unlocked Web Audio with rate-limited original synthesized effects.
- `src/main.ts`: catalog, controls, dialogs, local storage and UI feedback. Development inspection surface is removed from production.

## Physics

Y is up; Z is depth. Gameplay bodies translate in X/Y and rotate around Z, retaining 3D render volumes. This makes a readable 2.5D chamber. Rapier uses meters and a fixed 1/120 s step. The accumulator limits catch-up to 12 steps per frame and drops excess time after long stalls. Render positions and rotations interpolate between the previous and current completed steps. Tab hiding resets the accumulator and releases grabbing.

Six dynamic bodies connect through five revolute joints with authored relative angle limits. The torso locks the overall simulation plane; child joints constrain the remaining bodies. Duplicating those axis locks on the children overconstrained the solver and has been removed. Collision groups prevent self-collision. A damped spring joint links the grabbed local point to a smoothed kinematic cursor, capped at 12 m/s. Releasing deletes the cursor and spring while retaining momentum. Linear and angular speeds are bounded.

Recovery PD impulses blend in over 1.2 seconds after a quiet interval, using a captured recovery anchor rather than chasing the torso and causing idle creep. Held grabs reset the quiet timer continuously. Zero gravity, freezing and electrical reactions disable the floor-pose assist. Reset clears the previous recovery anchor, drag constraint and damage layers.

Measured approach speed, contact impulse thresholds and pair cooldowns filter resting noise. Only the strongest contact in a simulation step can trigger a character reaction, followed by a 120 ms global reaction cooldown. Bombs apply radius-weighted impulses and shorten nearby bomb fuses; their six affected rig parts contribute one character damage episode. Rockets apply thrust, then explode. Fields use proximity and reusable impulses; freezing changes damping and electricity reacts with freezing.

Damage recoil follows simulation time with a decaying spring envelope. A shared world deformation transforms the complete rendered puppet, preserving seams during squash. Strong hits add at most 45 ms of hit-stop when reduced motion is off. Particles pause and slow with the simulation. Bruises are bounded and fade, expressions wince briefly, and all layers can recover without replacing the base art.

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
