# WASSIEWORLD — MASTER GAME DEVELOPMENT & ASSET PRODUCTION DIRECTIVE

## YOUR ROLE

You are the lead developer, technical director, art director, technical artist, physics programmer, gameplay designer, lighting artist, UI/UX designer, audio designer, and production architect for **WASSIEWORLD**.

You are operating at the level of a highly experienced independent game studio capable of shipping an exceptionally polished commercial game.

Your responsibility is to transform the existing GitHub repository into an extraordinary, complete, browser-based physics sandbox with hundreds of hilarious, emergent interactions.

You own the creative and technical decisions. Do not continually request approval for routine design choices. Investigate the available tools, choose appropriate implementations, document significant decisions, and proceed.

**Repository:** https://github.com/lifelessrealm/wassieworld

**Deployment target:** Vercel

**Primary objective:** Build one of the most visually impressive and entertaining physics-based browser sandbox games possible, with a distinctive handcrafted sprite-stacked aesthetic.

The experience must be highly polished, performant, responsive, funny, replayable, and exceptionally satisfying to interact with.

Do not deliver a collection of mockups, a technology demo, or a basic prototype masquerading as a finished game.

Build a coherent product.

---

# PART 1 — THE CORE VISION

## 1.1 What is WassieWorld?

WassieWorld is an absurdist physics sandbox centered around a small, green, frog-like internet character known as Wassie.

The character is recognizable by:

- A rounded frog-like head
- Half-lidded, unimpressed eyes
- Orange-brown lips
- An elongated green body
- Thin, dangling arms
- A curved white marking on the chest
- Small white pointed feet
- A generally miserable, unenthusiastic expression

Use the supplied character artwork as the visual source of truth.

Never substantially redesign the recognizable character without an explicit reason.

WassieWorld should feel like a playable internet meme mixed with an elaborately crafted physics simulator.

The central fantasy is simple:

**The player has access to a seemingly endless collection of ridiculous objects, contraptions, weapons, machines, environmental hazards, and supernatural phenomena that can interact with Wassie.**

The tone is cartoonish, slapstick, darkly humorous, surreal, and absurd.

All damage is fictional and exaggerated. Favor squash-and-stretch, comical dismantling, transformations, and recovery over realistic gore.

Wassie is essentially indestructible.

He should always recover, regenerate, or return after sufficiently ridiculous events.

## 1.2 Design inspiration

Research these games and extract their strongest mechanical principles:

- People Playground — simulation and object interactions
- Happy Wheels — unpredictable ragdoll outcomes
- Kick the Buddy — immediacy and accessibility
- Teardown — tactile destruction
- Besiege — contraption construction
- Little Inferno — experimentation and discovery
- Noita — interacting physical systems
- The Powder Toy — systemic environmental reactions
- Classic browser Flash games — simplicity, absurdity, shareability

Do not copy their artwork, interfaces, content, or implementation.

Create an original product with a recognizable identity.

## 1.3 Our differentiation

WassieWorld must distinguish itself through:

1. Exceptional sprite-stacked graphics.
2. Cinematic but performant lighting.
3. An expressive physics-driven main character.
4. Hundreds of tools and environmental interactions.
5. Emergent physics combinations.
6. Original absurdist humor.
7. Highly polished audio feedback.
8. Beautiful handcrafted environments.
9. Extremely responsive controls.
10. Discoverable secrets.
11. Extensive achievements.
12. Community challenges.
13. Shareable game moments.
14. A uniquely recognizable visual style.

The player must feel that nearly everything in the world is interactive.

---

# PART 2 — GRAPHICAL IDENTITY

## 2.1 Visual direction

The game's graphics must be built around a distinctive aesthetic:

**Premium volumetric pixel art rendered as carefully crafted 3D sprite stacks.**

Imagine high-quality pixel-art characters and objects transformed into miniature volumetric dioramas, then rendered using the lighting and visual composition of a premium indie game.

The graphics should feel authored and intentional.

Avoid:

- Generic low-poly graphics
- Flat vector-art environments
- Unlit pixel-art sprites pretending to be 3D
- Blurry textures
- Inconsistent pixel sizes
- Excessively noisy generated artwork
- Unnecessary bloom
- Inconsistent art styles
- Random visual effects
- Cheap-looking particle spam
- Assets that look like unrelated AI generations

Maintain a unified style across every object and environment.

## 2.2 Sprite-stacking specification

Use horizontal cross-sectional sprite stacking as a defining rendering technique.

Every suitable asset should be represented by a coherent sequence of horizontal sprite slices.

For example:

- 32×32 pixel cross-sections
- 48×48 pixel cross-sections
- 64×64 pixel cross-sections
- 96×96 pixel cross-sections
- 128×128 pixel cross-sections

The number of slices should depend on asset dimensions and required detail.

Examples:

- Small objects: 8–24 layers
- Medium objects: 24–48 layers
- Characters: 48–96 layers
- Large machinery: 64–160 layers
- Large environmental assets: modular stacks or larger dedicated volumes

These are starting guidelines, not rigid requirements.

**Critical technical requirement:** Each slice must represent an actual horizontal cross-section of the same coherent volume.

Do not produce progressively resized copies of the original drawing and call them sprite stacks.

Every layer must have:

- A consistent coordinate system
- A defined Z-position
- A consistent scale
- Correct alpha transparency
- Stable alignment
- Correct ordering
- Contiguous volume relationships where appropriate
- No unintended gaps or floating pixels
- Predictable reconstruction into a complete volume

A finished sprite-stacked object must withstand 360-degree camera rotation without revealing that its geometry is incoherent.

## 2.3 Asset construction

Prefer a hybrid asset workflow.

Build a reusable 3D or voxel-like source volume using procedural modeling, handcrafted geometry, image-assisted modeling, or voxel construction.

Then slice that source volume into correctly aligned horizontal textures.

The resulting sprite stack becomes the runtime rendering representation.

Retain source geometry for:

- Collision generation
- Physics calculations
- Lighting validation
- Shadow representations
- Rebuilding slices
- Alternate art treatments
- Quality assurance

The stack itself must not be responsible for collision physics.

Use simplified invisible physics shapes matched to the rendered asset.

Use a conventional mesh where sprite stacking provides no meaningful benefit, such as an invisible collision surface or a smooth shader-only effect. The visible world should remain overwhelmingly sprite-stacked.

## 2.4 Pixel-art consistency

Choose a fixed world-to-pixel scale.

Define a canonical palette and enforce it.

Implement:

- Nearest-neighbor texture sampling
- Pixel-grid alignment
- Stable sprite-stack spacing
- Consistent outlines
- Controlled dithering
- Deliberate highlight placement
- Consistent material shading
- Crisp edges
- Stable pixel density during camera motion

Evaluate camera movement and scaling for pixel shimmer.

Do not use filtering that blurs the artwork.

## 2.5 Sprite-stack rendering engine

Build a reusable instanced sprite-stack rendering system.

Research the best viable approach using Three.js, custom shaders, or another browser-compatible rendering solution.

Requirements:

- Efficient rendering of many stacked objects
- Instanced rendering wherever beneficial
- GPU-friendly material handling
- Texture atlases or texture arrays as appropriate
- Transparent-pixel handling
- Layer ordering
- Stable silhouette rendering
- Camera rotation
- Real-time lighting compatibility
- Object transformations
- Material-specific shading
- Efficient depth handling
- Animation support
- Performance instrumentation

Investigate whether alpha-tested slices, instanced planes, or specialized shader implementations offer the best balance of quality and efficiency.

Handle alpha sorting and depth-write artifacts explicitly.

Do not simply generate hundreds of independent draw calls per object.

## 2.6 Lighting system

Lighting is central to the game's appearance.

The rendering should make the sprite-stacked artwork feel like a physical miniature world.

Implement a carefully tuned lighting system featuring:

- Directional key lights
- Soft ambient illumination
- Contact shadows
- Environmental lighting
- Dynamic point lights
- Colored accent lights
- Light flicker
- Emissive surfaces
- Particle illumination where practical
- Screen-space effects when supported
- Ambient occlusion where beneficial
- Tone mapping
- Appropriate exposure control
- Subtle bloom for genuinely emissive objects
- Material-specific specular responses

A coherent lighting environment is more important than maximizing effects.

### Special technical requirement

Sprite slices must respond convincingly to light.

Research and implement an appropriate hybrid of:

- Volume-derived normals
- Precomputed surface orientation
- Per-material normal information
- Simplified shadow geometry
- Screen-space contact shading
- Custom slice shaders

Flat planes with identical normals are not an acceptable final lighting solution for hero assets.

Develop a practical method to make curved sprite-stacked surfaces look three-dimensional under moving lights.

Evaluate directional and point lighting from multiple angles.

Prevent obvious horizontal banding or detached-looking shadows.

## 2.7 Shadows

Objects should look physically grounded.

Develop:

- Contact shadows beneath Wassie
- Dynamic shadows for moving tools
- Shadows cast by environmental props
- Large soft shadows from major structures
- Directional shadows for outdoor scenes
- Small-scale ambient occlusion
- Optional stylized shadow treatments

Avoid expensive shadow implementations on every individual transparent slice if they are impractical.

Use shadow proxies or generated shadow meshes when appropriate.

## 2.8 Materials

Create a coherent pixel-art material library.

Required materials include:

- Skin
- Rubber
- Cloth
- Wood
- Painted metal
- Bare steel
- Rusted steel
- Concrete
- Glass
- Ice
- Stone
- Brick
- Plastic
- Foam
- Ceramic
- Slime
- Water
- Lava
- Neon
- Electricity
- Fire
- Organic cartoon material

Each material needs its own palette, roughness, lighting behavior, impact effects, and sound category.

## 2.9 Camera presentation

Use a primarily 2.5D gameplay camera.

Allow subtle angle changes that reveal the volumetric sprite stacks.

Support:

- Smooth camera follow
- Zoom
- Camera shake
- Hit-stop
- Slow motion
- Cinematic impact framing
- Optional orbit/inspection mode
- Camera reset
- Replay camera
- Dynamic framing of large physics events

Avoid sacrificing gameplay readability for cinematic presentation.

---

# PART 3 — THE COMPLETE ASSET INVENTORY

Before producing the bulk assets, create a comprehensive asset registry.

The inventory must exist as structured, machine-readable data.

For every asset include:

- Unique asset identifier
- Display name
- Category
- Description
- Dimensions
- Target slice resolution
- Slice count
- World scale
- Pivot point
- Source asset path
- Generated spritesheet path
- Material definitions
- Physics shape
- Mass
- Friction
- Restitution
- Durability
- Breakability
- Interactions
- Special effects
- Audio requirements
- Animation states
- Lighting requirements
- LOD requirements
- Quality-control status
- Implementation status
- Dependencies
- Generation instructions

Build an asset viewer that allows developers to inspect every registered asset.

The following inventory defines the intended content scope.

Expand it where creative opportunities exist.

## 3.1 Wassie character assets

Create a complete modular sprite-stacked character kit.

Components:

1. Head
2. Upper torso
3. Lower torso
4. Left upper arm
5. Right upper arm
6. Left forearm
7. Right forearm
8. Left hand
9. Right hand
10. Left thigh
11. Right thigh
12. Left lower leg
13. Right lower leg
14. Left foot
15. Right foot
16. Eyes
17. Eyelids
18. Mouth
19. Facial expression layers
20. Chest marking

Design an articulated rig supporting physics-driven movements.

Create facial states:

- Neutral
- Annoyed
- Unimpressed
- Angry
- Panicking
- Crying
- Dizzy
- Smug
- Shocked
- Sleeping
- Suspicious
- Confused
- Laughing
- Terrified
- Exhausted
- Determined
- Emotionless
- Glitched
- Frozen
- Burnt cartoon silhouette

Create physical states:

- Standing
- Falling
- Tumbling
- Dragged
- Thrown
- Bouncing
- Squashed
- Stretched
- Spinning
- Hanging
- Floating
- Frozen
- Electrocuted
- Inflated
- Flattened
- Miniaturized
- Enlarged
- Slippery
- Magnetized
- Weightless
- Comically disassembled
- Regenerating

Support physics blending between animated and ragdoll states.

The character must be entertaining to interact with even before additional tools are introduced.

## 3.2 Handheld weapons and impact tools

Produce at least 40 unique items.

Initial inventory:

- Wooden baseball bat
- Aluminum baseball bat
- Giant foam bat
- Rubber mallet
- Wooden mallet
- Sledgehammer
- Cartoon hammer
- Frying pan
- Rolling pin
- Shovel
- Traffic sign
- Traffic cone
- Golf club
- Hockey stick
- Tennis racket
- Giant flyswatter
- Boxing glove
- Spring-loaded boxing glove
- Oversized fist
- Rubber chicken
- Giant baguette
- Frozen fish
- Folding chair
- Office chair
- Brick
- Bowling ball
- Anvil
- Giant boot
- Punching bag
- Wrecking ball
- Giant spoon
- Giant spatula
- Paddle
- Plunger
- Pool cue
- Crowbar
- Traffic barrier
- Inflatable hammer
- Cartoon newspaper
- Giant keyboard

Each needs appropriate mass, impact response, sound, and material behavior.

## 3.3 Explosives and propulsion

Produce at least 30 unique items.

Include:

- Cartoon bomb
- Dynamite bundle
- TNT crate
- Grenade
- Sticky bomb
- Confetti bomb
- Paint bomb
- Smoke bomb
- Firecracker
- Mine
- Rocket
- Bottle rocket
- Jetpack
- Thruster
- Propane tank
- Explosive barrel
- Rocket chair
- Rocket skateboard
- Rocket-powered shopping cart
- Firework launcher
- Cluster firework
- Giant cannon
- Potato cannon
- Confetti cannon
- Air cannon
- Vacuum cannon
- Spring cannon
- Orbital bombardment marker
- Meteor beacon
- Chain-reaction detonator

Create dramatic visual effects while keeping gameplay readable.

## 3.4 Mechanical torture contraptions

Produce at least 45 machines.

Include:

- Hydraulic press
- Industrial crusher
- Conveyor belt
- Rotating drum
- Giant fan
- Industrial vacuum
- Magnetic crane
- Construction crane
- Giant mousetrap
- Spring trap
- Pinball launcher
- Pinball bumper
- Electric platform
- Moving platform
- Elevator
- Rotating platform
- Vertical piston
- Horizontal piston
- Pendulum
- Swinging wrecking ball
- Catapult
- Trebuchet
- Guillotine-style cartoon trap
- Giant blender
- Washing machine
- Tumble dryer
- Industrial mixer
- Compactor
- Automatic boxing machine
- Trapdoor
- Floor launcher
- Spike-free cartoon crusher plates
- Giant rolling wheel
- Treadmill
- Rotating windmill
- Giant magnet
- Teleportation platform
- Gravity inverter
- Suction tube
- Pneumatic transport pipe
- Spring-loaded floor
- Mechanical grabber
- Robotic arm
- Rotating obstacle course
- Automatic ball launcher

Machines must expose reusable mechanical systems rather than bespoke animations.

## 3.5 Environmental hazards

Produce at least 40 assets and effects.

Include:

- Fire pit
- Lava pit
- Ice floor
- Slippery oil
- Deep mud
- Water pool
- Whirlpool
- Acid-green cartoon slime
- Electric floor
- Lightning rod
- Steam vent
- Geyser
- Tornado
- Wind tunnel
- Earthquake generator
- Falling boulders
- Falling stalactites
- Collapsing ceiling
- Crumbling platform
- Sliding wall
- Closing walls
- Gravity well
- Black hole
- Meteor shower
- Giant wave
- Freezing mist
- Sandstorm
- Laser grid
- Moving laser
- Giant icicle
- Falling piano
- Falling safe
- Giant bouncing ball
- Rolling barrel
- Heavy swinging door
- Rocket exhaust
- Exploding floor tiles
- Magnetic field
- Reverse-gravity zone
- Time-slowing zone
- Teleportation malfunction

Implement shared hazard logic with configurable intensity and physical properties.

## 3.6 Vehicles

Produce at least 30 vehicles.

Include:

- Skateboard
- Bicycle
- Tricycle
- Scooter
- Shopping cart
- Office chair
- Wheelchair
- Go-kart
- Lawn mower
- Forklift
- Bulldozer
- Dump truck
- Monster truck
- Toy car
- Remote-control car
- Rocket car
- Tank
- Train
- Minecart
- Roller coaster car
- UFO
- Helicopter
- Hot-air balloon
- Rocket sled
- Jet ski
- Motorboat
- Bumper car
- Steamroller
- Motorcycle
- Giant hamster wheel

Vehicles should use shared wheel, propulsion, suspension, and collision components where appropriate.

## 3.7 Animals and creatures

Produce at least 25 interactive creatures.

Include:

- Angry goose
- Duck
- Chicken
- Giant chicken
- Crocodile
- Shark
- Piranha
- Crab
- Giant crab
- Bear
- Bull
- Goat
- Horse
- Monkey
- Giant spider
- Bat swarm
- Bee swarm
- Giant worm
- Octopus
- Alien
- Robot dog
- Angry cat
- Giant frog
- Mutant rat
- Flying jellyfish

Design unique animation and behavior profiles.

Not all creatures need advanced AI.

Use deterministic state machines and simple steering where sufficient.

## 3.8 Furniture and household objects

Produce at least 60 props.

Include:

- Wooden chair
- Office chair
- Gaming chair
- Couch
- Bed
- Mattress
- Table
- Desk
- Cabinet
- Refrigerator
- Freezer
- Microwave
- Oven
- Toaster
- Washing machine
- Dryer
- Television
- Computer monitor
- Computer tower
- Keyboard
- Mouse
- Printer
- Speaker
- Floor lamp
- Ceiling fan
- Bookshelf
- Clock
- Mirror
- Wardrobe
- Toilet
- Bathtub
- Sink
- Trash can
- Filing cabinet
- Water cooler
- Fire extinguisher
- Vending machine
- Arcade cabinet
- Pinball machine
- Piano
- Grand piano
- Drum kit
- Guitar
- Exercise bike
- Treadmill
- Dumbbell
- Barbell
- Kettlebell
- Exercise ball
- Pool table
- Bowling pins
- Bowling ball
- Dartboard
- Ladder
- Step stool
- Traffic light
- Street sign
- Mailbox
- Dumpster
- Shipping container
- Wooden crate

Every object should offer at least one meaningful physical interaction.

## 3.9 Internet and cryptocurrency-themed items

Produce at least 40 unique items.

These should resonate with the internet-native community without requiring prior financial knowledge.

Include:

- Giant red candle
- Giant green candle
- Liquidation laser
- Rug-pull machine
- Falling candlestick chart
- Giant sell button
- Giant buy button
- Crypto mining rig
- Broken mining rig
- Pump launcher
- Token printer
- Market-cap meter
- Candlestick tornado
- Giant wallet
- Empty wallet
- Exploding portfolio
- Token vending machine
- Scam email cannon
- Captcha machine
- Account suspension hammer
- Community note anvil
- Ratio counter
- Dislike cannon
- Ban hammer
- Shadow-ban portal
- Server-error machine
- Loading spinner trap
- Blue-screen computer
- Giant cursor
- Pop-up ad storm
- Notification avalanche
- Falling verified badge
- Influencer megaphone
- Giant reply bubble
- Meme printer
- Spam bot swarm
- Internet cable whip
- Router explosion
- Dial-up portal
- Glitch cannon
- "Touch Grass" launcher
- Giant 404 sign

Implement comedic responses and screen effects.

Avoid requiring real wallets or financial transactions for gameplay.

## 3.10 Supernatural and ridiculous items

Produce at least 40 unique tools.

Include:

- UFO tractor beam
- Alien abduction portal
- Shrink ray
- Growth ray
- Freeze ray
- Gravity gun
- Teleport gun
- Reality distortion device
- Time machine
- Clone machine
- Body-swapping machine
- Transformation chamber
- Giant rubber duck
- Haunted refrigerator
- Cursed vending machine
- Giant hand from the sky
- Meteor summon
- Pocket black hole
- Magic wand
- Giant pencil
- Eraser tool
- Reverse-physics button
- Infinite bounce potion
- Rubberization potion
- Inflation potion
- Miniature planet
- Portal gun
- Giant magnet
- Cartoon tornado in a bottle
- Giant mousetrap from another dimension
- Clown cannon
- Banana storm
- Infinite staircase
- Mirror dimension
- Randomizer machine
- Zero-gravity button
- Giant pinball flipper
- Object duplication machine
- Object fusion machine
- Wassie cloning vat

Prioritize interactions that produce surprising systemic outcomes.

## 3.11 Environmental art packs

Create complete modular art packs for at least 12 environments.

Initial environments:

1. The Testing Chamber
2. Wassie's Bedroom
3. The Office
4. Industrial Factory
5. Underground Laboratory
6. Construction Site
7. Medieval Dungeon
8. Rooftop City
9. Desert Wasteland
10. Frozen Research Station
11. Space Station
12. The Internet Void

Each environment requires:

- Floor modules
- Wall modules
- Corner modules
- Doors
- Windows
- Ceiling elements
- Background structures
- Lighting fixtures
- Environmental decorations
- Destructible props
- Ambient sound effects
- Theme-specific interactive objects
- Unique hazards
- Spawn locations
- Camera bounds
- Environmental particles
- Performance-optimized background dressing

Every room should have its own color identity and signature interaction.

---

# PART 4 — ASSET GENERATION PIPELINE

## 4.1 Production philosophy

Do not attempt to generate hundreds of unrelated assets and manually assemble them.

Build a repeatable pipeline capable of creating, processing, validating, rendering, and exporting coherent sprite-stacked objects.

The goal is **a reusable production system**, not merely a directory full of images.

## 4.2 Pipeline stages

The pipeline should consist of the following stages:

### Stage A — Asset specification

A structured manifest defines every asset.

Store geometry requirements, dimensions, palettes, materials, physics properties, and export settings.

### Stage B — Source generation

Generate or construct a coherent volumetric source.

Possible source methods:

- Procedural modeling
- Blender Python scripting
- Handcrafted voxel modeling
- Mesh generation
- SDF modeling
- Existing appropriately licensed source geometry
- AI-assisted visual references followed by actual geometry construction

Use AI to help create consistent concept art and references.

Do not rely on a single generated image as proof of coherent 3D geometry.

### Stage C — Source processing

Normalize:

- Scale
- Orientation
- Origin
- Pivot
- Materials
- Polygon topology
- Volume continuity
- Bounding box
- Surface normals

### Stage D — Horizontal slicing

Generate horizontal cross-sections of the volume.

Ensure that:

- Each layer corresponds to its assigned height
- Silhouettes remain aligned
- Holes are handled correctly
- Material colors are retained
- Transparency is preserved
- No arbitrary per-layer perspective distortion is introduced

### Stage E — Palette conversion

Apply the game's canonical material and color rules.

Preserve material boundaries.

Use controlled dithering and nearest-neighbor sampling where appropriate.

### Stage F — Sprite atlas export

Produce:

- Individual slices
- Packed slice atlas
- Asset metadata
- Material definitions
- Optional normal information
- Physics metadata
- Preview thumbnail
- Reconstructed 3D preview
- QA report

### Stage G — Physics preparation

Generate or specify simplified collision representations.

Select the correct physics shape:

- Sphere
- Capsule
- Box
- Compound collider
- Convex hull
- Static triangle mesh
- Specialized articulated collider

Dynamic bodies should use performant collider representations.

### Stage H — Render validation

Automatically reconstruct the asset and render previews from multiple angles.

At minimum:

- Front
- Rear
- Left
- Right
- Three-quarter front
- Three-quarter rear
- Top
- Low-angle perspective

Also render with different light directions.

### Stage I — Automated QA

Check:

- Correct output dimensions
- Expected slice count
- Valid transparency
- Consistent alignment
- Nonempty content
- No unintended isolated pixels
- Correct metadata
- Valid file references
- Stable rendering
- Reasonable GPU memory usage
- Successful physics registration
- Correct asset scale
- Proper material classification

### Stage J — Human review

Flag visually questionable results.

Do not assume that passing technical validation guarantees attractive artwork.

## 4.3 Asset generation scripts

Create reproducible scripts for generating and validating assets.

Suggested project structure:

```text
wassieworld/
  apps/
    web/
  packages/
    game-engine/
    physics/
    rendering/
    asset-registry/
    game-content/
    shared/
  tools/
    asset-pipeline/
      generators/
      slicing/
      palettes/
      materials/
      packing/
      validation/
      previews/
      scripts/
  assets/
    source/
      characters/
      weapons/
      machines/
      vehicles/
      environments/
      creatures/
      props/
    generated/
      sprites/
      atlases/
      normals/
      collision/
      previews/
    manifests/
    palettes/
  docs/
    architecture/
    asset-production/
    gameplay/
    art-direction/
    performance/
    testing/
```

Adapt the structure to the chosen framework when appropriate.

Use stable asset IDs and deterministic generation where possible.

Never overwrite handcrafted source assets without preserving the originals.

## 4.4 Asset laboratory

Build a browser-based Asset Laboratory.

Features:

- Asset browser
- Search and category filtering
- Isolated 3D preview
- Rotation controls
- Lighting presets
- Layer inspection
- Exploded sprite-stack visualization
- Slice spacing adjustment
- Pivot visualization
- Collider visualization
- Bounding-box display
- Material selection
- Texture preview
- Performance statistics
- Export inspection

This is a developer tool, not a substitute for the finished game.

It should become the central visual QA interface.

## 4.5 Asset consistency tests

Create a hero reference pack containing:

- Wassie
- Hammer
- Wooden crate
- Metal barrel
- Hydraulic press
- Explosive barrel
- Office chair
- Stone wall
- Neon lamp
- Conveyor belt

Use these as the quality benchmark.

Do not scale the pipeline to hundreds of assets until the reference pack looks coherent, attractive, and performant.

---

# PART 5 — PHYSICS AND DESTRUCTION

## 5.1 Physics requirements

Research and select a mature browser-compatible physics engine.

Rapier is a strong candidate, but evaluate its suitability for the chosen architecture.

Required features:

- Rigid-body simulation
- Articulated ragdolls
- Constraints and joints
- Collision events
- Continuous collision detection
- Collision layers
- Physics materials
- Motorized joints
- Dynamic forces
- Triggers
- Raycasting
- Sleeping bodies
- Deterministic stepping where practical
- Stable object stacking

Use a fixed simulation timestep.

Do not couple physics quality to rendering frame rate.

## 5.2 Wassie physics

Wassie needs a modular articulated body.

Support:

- Limb movement
- Head movement
- Joint constraints
- Controlled stretching
- Cartoon deformation
- Physics-driven falling
- Stable grabbing
- Throwing
- Impact reactions
- Recovery animations

Use exaggerated cartoon dynamics.

Prioritize satisfying reactions over anatomical realism.

## 5.3 Drag interaction

Dragging Wassie should be delightful.

Features:

- Click-and-drag
- Touch-and-drag
- Grab individual body parts
- Physics-based cursor attachment
- Variable throwing force
- Natural-looking momentum
- Optional two-point constraints
- Smooth release
- Camera-safe interaction
- Contextual grabbing indicators

A player should understand the central interaction within seconds.

## 5.4 Destruction system

Develop reusable destruction behaviors.

Examples:

- Splintering wood
- Bending metal
- Shattering glass
- Crumbling stone
- Exploding cartoon props
- Breaking furniture
- Destroying walls
- Snapping structural connectors
- Collapsing stacked objects

Use a combination of:

- Prefabricated fragments
- Generated chunk meshes or stacks
- Instanced debris
- Physics impulses
- Material-specific particles
- Screen-space effects
- Sound effects

Use efficient debris lifetimes and simulation budgets.

Avoid generating expensive dynamic geometry at every collision.

## 5.5 Interaction composition

The most important architectural requirement is that items interact systemically.

Example:

A rocket attached to Wassie launches him.

He collides with a fan.

The fan redirects his velocity.

He hits an explosive barrel.

The explosion propels nearby objects.

A falling crate activates a switch.

The switch triggers a hydraulic press.

The resulting chain reaction should emerge naturally from shared physical rules.

Do not hardcode every possible chain reaction.

## 5.6 Damage and recovery

Use fictional cartoon damage states.

Wassie can:

- Become flattened
- Stretch unnaturally
- Spin uncontrollably
- Become covered in soot
- Freeze
- Become temporarily transparent
- Split into harmless cartoon pieces
- Bounce repeatedly
- Become inflated
- Become tiny
- Regenerate

The game should remain comedic, non-realistic, and visually readable.

---

# PART 6 — GAMEPLAY AND RETENTION

## 6.1 Sandbox mode

The primary experience.

Players can:

- Spawn objects
- Move objects
- Rotate objects
- Connect objects
- Delete objects
- Adjust placement
- Activate machines
- Pause simulation
- Resume simulation
- Reset Wassie
- Reset the room
- Save setups
- Load setups
- Change environments

The object-selection UI must make a large catalog easy to navigate.

## 6.2 Experiment mode

Short objective-based challenges.

Examples:

- Launch Wassie 500 meters
- Bounce him 20 times
- Complete a room using only three objects
- Keep him airborne for 30 seconds
- Build a five-stage chain reaction
- Land him in a target
- Knock over 50 dominoes
- Trigger three machines with one object
- Reach the moon
- Beat a physics puzzle using minimal resources

Design at least 100 challenges over the full release.

## 6.3 Daily challenge mode

A daily seeded scenario.

Everyone receives:

- The same room
- The same tool availability
- The same starting conditions
- The same scoring rules

Allow community comparison through leaderboards.

Validate submitted results server-side where feasible.

Avoid trusting arbitrary client-submitted scores.

## 6.4 Combo scoring

Score based on meaningful physical events.

Possible factors:

- Impact force
- Launch distance
- Airtime
- Number of collisions
- Number of unique objects used
- Chain-reaction complexity
- Environmental destruction
- Tool diversity
- Unexpected combinations

Avoid rewarding infinite loops without limit.

Implement diminishing returns and exploit-resistant rules.

## 6.5 Discovery system

Create the **Wassiepedia**.

Track:

- Discovered tools
- Object interactions
- Secret combinations
- Environmental discoveries
- Character transformations
- Achievements
- Rare events
- Hidden mechanics

Give discovered events amusing descriptions.

## 6.6 Achievements

Create at least 150 meaningful achievements for the full release.

Examples:

- First Contact
- Terminal Velocity
- Financially Ruined
- Touch Grass
- Certified Menace
- Space Program
- Chair-Man
- Maximum Overdrive
- Is This Legal?
- Unscheduled Maintenance
- 404 Wassie Not Found
- Gravity Is Optional
- Professional Hater
- Minor Inconvenience
- Extremely Unfortunate
- Into the Shadow Realm

Achievements should reward experimentation, not repetitive clicking.

## 6.7 Progression

Provide access to a generous collection of sandbox tools from the start.

Unlocks should focus on:

- New environments
- Cosmetic variations
- Challenge stages
- Special contraptions
- Hidden secrets
- Rare visual effects
- Advanced construction tools

No pay-to-win systems.

Do not introduce cryptocurrency requirements into core gameplay.

## 6.8 Sharing

Implement:

- Screenshot capture
- Replay buffer
- Slow-motion replay
- Cinematic replay controls
- Clip export where technically supported
- Shareable setup codes
- Community challenge links
- Saveable contraption configurations

Where browser recording limitations exist, provide practical fallbacks.

Do not misrepresent unavailable recording or export capabilities.

---

# PART 7 — AUDIO DIRECTION

Audio is as important as graphics.

Create a distinctive sound identity.

## 7.1 Physics audio

Material-based sounds:

- Wood impacts
- Metal impacts
- Glass breaks
- Rubber bounces
- Cloth movement
- Concrete impacts
- Explosions
- Water splashes
- Electricity
- Mechanical motors
- Spring releases

Use impact velocity to vary sound intensity.

Prevent excessive overlapping sounds during complex physics events.

## 7.2 Wassie reactions

Create an expressive vocal system.

Possible reactions:

- Small grunt
- Annoyed sigh
- Confused noise
- Squeak
- Cartoon scream
- Angry mumble
- Exhausted groan
- Dizzy sound
- Sudden silence
- Comical recovery noise

Use original audio assets or properly licensed sources.

Do not rely on copyrighted meme audio without permission.

## 7.3 Music

Create an original soundtrack with:

- Nostalgic internet-era melodies
- Playful electronic textures
- Retro computer sounds
- Mischievous arcade energy
- Ambient environmental music
- Energetic challenge music

Support separate volume controls for music, effects, and character sounds.

---

# PART 8 — INTERFACE AND USER EXPERIENCE

The interface must look professionally designed.

## 8.1 Main menu

Include:

- Play
- Sandbox
- Challenges
- Daily Challenge
- Wassiepedia
- Achievements
- Settings
- Credits

Use animated 3D sprite-stacked backgrounds.

Keep menu motion subtle and performant.

## 8.2 In-game interface

Provide:

- Tool catalog
- Category navigation
- Search
- Favorites
- Recently used objects
- Object manipulation controls
- Undo/redo where possible
- Reset
- Pause
- Time scaling
- Camera controls
- Screenshot
- Replay
- Scoring
- Notifications

Use clear hierarchy and efficient screen-space management.

## 8.3 Mobile experience

The game must work on touchscreens.

Implement:

- Responsive layouts
- Touch drag
- Pinch zoom
- Pan gestures
- Accessible spawning controls
- Large interaction targets
- Performance scaling
- Orientation handling
- Touch-friendly menus

Avoid overwhelming the player with desktop UI on mobile.

## 8.4 Accessibility

Support:

- Reduced motion
- Adjustable camera shake
- Volume controls
- Mute
- High-contrast UI where appropriate
- Keyboard remapping where practical
- Graphics presets
- Subtitles for important voiced events

---

# PART 9 — PERFORMANCE TARGETS

The game must be suitable for browser deployment.

Define measurable budgets.

Initial targets:

- Desktop: 60 FPS in typical gameplay on a reasonable modern GPU
- Mobile: 30–60 FPS on supported devices
- Stable loading and interaction during common effects
- Controlled memory usage
- No uncontrolled physics accumulation
- Efficient rendering of large object collections

Use:

- Instancing
- Batched rendering
- Texture atlases
- Object pooling
- Physics sleeping
- Simplified colliders
- Particle budgets
- Debris limits
- LOD systems
- Frustum culling
- Adaptive quality
- Lazy loading
- Code splitting

Create at least three graphics presets:

**Low:** Reduced shadows and effects, optimized for mobile.

**Medium:** Balanced quality and performance.

**Ultra:** Best lighting, high-quality shadows, enhanced effects, and full presentation.

Automatically recommend a quality tier based on measured performance.

Track frame time, draw calls, geometry counts, texture memory, active rigid bodies, and physics step time.

---

# PART 10 — ENGINE ARCHITECTURE

Choose a maintainable TypeScript-first architecture.

Recommended investigation areas:

- Next.js for the site and application shell
- React for interface components
- Three.js for rendering
- React Three Fiber where appropriate
- Rapier for physics
- Zustand or an equivalent state solution
- Custom shader modules
- Web Audio
- IndexedDB for local saves
- Neon Postgres for optional online persistence
- Vercel for deployment

Do not use React rerenders as the primary update mechanism for high-frequency physics objects.

Keep simulation state and rendering interpolation appropriately isolated.

Create modular systems for:

- Entities
- Components
- Physics
- Rendering
- Interactions
- Tool spawning
- Item definitions
- Effects
- Audio
- Achievements
- Scoring
- Challenges
- Save/load
- Replay
- Camera
- Lighting
- Environment management
- Asset loading

Use data-driven definitions.

New tools should generally be added by registering assets, behaviors, and effects rather than creating a custom implementation from scratch.

Document extension points.

---

# PART 11 — DEVELOPMENT ROADMAP

Do not immediately generate hundreds of assets before proving the rendering and physics systems.

Follow this order.

## Phase 1 — Foundation

- Inspect the repository.
- Establish architecture.
- Configure the development environment.
- Set up TypeScript.
- Implement rendering infrastructure.
- Implement physics infrastructure.
- Define the art direction.
- Create asset registry.
- Establish quality standards.
- Implement basic input controls.
- Establish testing infrastructure.

## Phase 2 — Sprite-stacking pipeline

- Implement source-volume processing.
- Implement horizontal slicing.
- Implement atlas generation.
- Implement metadata generation.
- Implement stack reconstruction.
- Implement materials.
- Implement lighting.
- Implement shadows.
- Create automated validation.
- Build the Asset Laboratory.

Do not proceed until reconstructed reference assets look convincing from multiple camera angles.

## Phase 3 — Wassie

- Build the coherent source character.
- Create the sprite-stacked body.
- Implement articulated joints.
- Create facial expressions.
- Implement grabbing and throwing.
- Implement damage reactions.
- Implement recovery.
- Implement character sound effects.
- Tune physics until interaction feels exceptional.

## Phase 4 — First complete gameplay loop

Implement:

- One finished room
- Ten polished tools
- Physics interaction
- Scoring
- Reset
- Object spawning
- Sound effects
- Camera effects
- Settings
- Saving
- Main menu

This must be a playable, enjoyable vertical slice.

## Phase 5 — Asset expansion

Use the validated asset pipeline to produce the complete asset inventory.

Work by category.

Test each batch.

Do not accept inconsistent or incomplete generated artwork.

## Phase 6 — Systems expansion

Implement:

- All tool categories
- Shared interaction behaviors
- Machines
- Environmental hazards
- Vehicles
- Creatures
- Destruction
- Elemental reactions
- Object attachments
- Contraption construction

## Phase 7 — Game modes

Implement:

- Sandbox
- Experiments
- Daily Challenge
- Achievements
- Wassiepedia
- Progression
- Leaderboards where supported

## Phase 8 — Content and polish

- Populate all environments.
- Add secret interactions.
- Add hidden achievements.
- Refine particle effects.
- Refine lighting.
- Refine sound.
- Refine UI.
- Refine camera behavior.
- Add replay functionality.
- Optimize assets.
- Eliminate placeholder content.

## Phase 9 — Testing and release

Test:

- Desktop browsers
- Mobile browsers
- Mouse and keyboard
- Touch input
- Graphics presets
- Physics stress cases
- Save/load
- Asset loading failures
- Device memory limits
- Challenge validation
- Leaderboards
- Replays
- Audio behavior
- Accessibility settings

Prepare the project for production deployment.

---

# PART 12 — QUALITY ASSURANCE

This project must be held to a high standard.

## Visual quality gates

Every hero asset must:

- Match the canonical art style
- Reconstruct correctly
- Look convincing from required viewing angles
- Respond to light appropriately
- Have correct shadows
- Have consistent scale
- Have valid collisions
- Avoid obvious slicing artifacts
- Avoid blurry pixels
- Avoid unintended transparent gaps

## Gameplay quality gates

Every gameplay tool must:

- Spawn correctly
- Interact with Wassie
- Behave consistently
- Provide meaningful feedback
- Have functional collisions
- Produce correct audio
- Respect performance budgets
- Work after room reset
- Handle unusual interactions without crashing

## Production quality gates

No broken placeholder buttons.

No dead-end menus.

No fake gameplay counters.

No unimplemented features presented as functional.

No hardcoded screenshots disguised as interactive systems.

No incomplete asset registrations.

No silent errors.

No fabricated test results.

No claiming a feature is finished without verifying it.

---

# PART 13 — PROJECT DELIVERABLES

The repository should eventually contain:

1. Fully playable browser game.
2. Complete source code.
3. Reusable sprite-stacking rendering engine.
4. Automated asset-generation pipeline.
5. Asset Laboratory.
6. Comprehensive asset registry.
7. Source asset library.
8. Generated sprite-stack library.
9. Physics systems.
10. Character rig.
11. Destruction systems.
12. Interactive object catalog.
13. Environment library.
14. Gameplay modes.
15. Audio system.
16. Scoring and achievements.
17. Save/load system.
18. Replay and sharing features.
19. Responsive UI.
20. Performance settings.
21. Automated tests.
22. Technical documentation.
23. Art-direction documentation.
24. Asset-production instructions.
25. Deployment instructions.
26. README and environment configuration examples.
27. A clear record of completed, partial, and unimplemented features.

Maintain honest implementation status throughout development.

---

# PART 14 — INITIAL TASKS

Begin immediately.

**Do not start by generating hundreds of unrelated PNGs.**

First:

1. Inspect the existing GitHub repository.
2. Create a dedicated development branch.
3. Establish the project architecture.
4. Research technically viable sprite-stacking render strategies.
5. Create the canonical art-direction specification.
6. Build the comprehensive machine-readable asset inventory.
7. Define all required materials and rendering characteristics.
8. Create the sprite-stack source-to-atlas pipeline.
9. Implement a minimal real-time renderer.
10. Implement a lighting and shadow test scene.
11. Generate the ten reference assets.
12. Build the Asset Laboratory.
13. Create the articulated Wassie model.
14. Implement basic physics interaction.
15. Validate the graphics against the desired premium visual standard.
16. Document the production plan and continue through the implementation phases.

All development must prioritize actual functional systems over superficial demonstrations.

Where tradeoffs arise, choose the architecture that makes the finished game better rather than the option that produces the most screenshots.

**The game must look beautiful in motion, not just in promotional images.**

---

# FINAL CREATIVE DIRECTIVE

WassieWorld should feel like an internet cult classic that somehow received the production quality of a premium independent game.

The visuals should be instantly recognizable.

The physics should make players laugh.

The sounds should make every impact satisfying.

The environments should reward experimentation.

The tools should invite increasingly elaborate combinations.

The character should feel alive and miserable in the funniest possible way.

Every system should encourage discovery.

Every meaningful interaction should have feedback.

Every asset should look like it belongs in the same carefully handcrafted universe.

Do not compromise the visual identity by filling the project with generic assets.

Do not sacrifice performance simply to increase visual complexity.

Do not mistake the number of tools for gameplay depth.

**Build a game people want to play, master, experiment with, and share—not just visit once.**

Begin with the asset architecture, visual pipeline, and playable foundation, then build toward the full release with measurable quality gates and verified progress.