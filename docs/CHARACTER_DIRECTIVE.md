Perfect — this higher-quality character image should now be treated as the **canonical source-of-truth reference** for Wassie’s final in-game look.

That means from this point forward, the pipeline should **lock the character silhouette and facial identity** to this version:

- big glossy round eyes
- layered brow folds
- long green tubular body
- orange-pink lips
- white crescent chest mark
- black outline styling
- white pointed feet
- thin tucked arms
- neutral / blank / slightly concerned expression

And yes — if the game is built around abusing him in funny ways, then we absolutely need a **visual damage-state system** so the player feels escalating feedback. The important thing is to make it look **cartoonishly damaged**, not gory. So instead of realism, we go for:

- bruised / scuffed
- dizzy / stars
- flattened
- stretched
- soot-covered
- frozen
- electrocuted
- bent / crumpled
- crying
- missing tooth / chipped lip look
- bandaged recovery state
- cracked cartoon shell / fracture overlays
- swollen eye variants
- wobbling / unstable stance
- “near KO” state

Below is the **updated master prompt** I’d use now, specifically revised to incorporate the new higher-quality Wassie reference and a complete damage-state production pipeline.

---

# UPDATED MASTER PROMPT — WASSIEWORLD CHARACTER + ASSET PIPELINE DIRECTIVE

You are a **senior game developer, technical artist, gameplay systems designer, art director, physics designer, and production architect** tasked with building the foundation for **WASSIEWORLD**, a polished browser-based physics sandbox game centered on a small green meme character called **Wassie**.

Your job is not to create a prototype or loose concept art pack.

Your job is to establish the **full production-ready asset pipeline, art direction, character fidelity standard, damage-state system, and content framework** for a premium-quality browser game.

Repository: **lifelessrealm/wassieworld**

Deployment target: **Vercel**

Primary goal: Create the most polished, funny, addictive, visually beautiful, sprite-stacked browser sandbox game possible.

---

## 1. CORE CHARACTER DIRECTIVE

The user has supplied a **high-quality Wassie reference image**.  
This image is now the **single canonical visual source of truth** for the main character.

Every future Wassie asset, render, rig, sprite stack, damage state, animation, expression, and variant must preserve the identity of this reference.

### Wassie identity requirements

Preserve all of the following faithfully:

- large rounded eyes with glossy highlights
- thick black pupils
- heavy curved brow folds above the eyes
- sad / empty / concerned neutral expression
- long horizontal orange-pink lips
- simple green body with slight forward head projection
- thin tucked arms
- white crescent chest marking
- white pointed duck-like / claw-like feet
- clean black outlines
- overall simple meme-like silhouette

Do **not** redesign Wassie into a different art style.

Do **not** make him furry, detailed like a realistic frog, or overcomplicate the design.

The humor depends on him remaining visually simple, recognizable, and iconic.

### Character style goal

The finished character should feel like:

- a faithful Wassie
- rendered as a premium 2.5D sprite-stacked game character
- with beautiful lighting
- with subtle material depth
- with strong silhouette readability
- with expressive damage reactions
- while still looking like the original meme

---

## 2. CHARACTER FIDELITY RULES

The most important rule in the project is:

**Wassie must remain instantly recognizable in every state.**

That applies to:

- idle state
- ragdoll state
- airborne state
- damaged state
- extreme impact state
- frozen / burnt / shocked / inflated state
- flattened or stretched cartoon states
- different facial expressions
- all animation and sprite-stack render angles

When rotated or lit differently, the character must still obviously read as the same Wassie.

### Required deliverables for character fidelity

Create:

1. **Canonical front 3/4 hero view**
2. **Front view**
3. **Rear view**
4. **Side view**
5. **Top-down silhouette reference**
6. **Orthographic turnaround sheet**
7. **Sprite-stack source volume**
8. **Final sprite-stack slices**
9. **Rig mapping specification**
10. **Facial expression set**
11. **Damage-state set**
12. **Recovery-state set**

---

## 3. DAMAGE-STATE SYSTEM

A major part of the game fantasy is that the player can repeatedly abuse Wassie in absurd slapstick ways.

To make this satisfying, implement a **layered visual damage-state system**.

This system must be **cartoonish, readable, modular, and combinable**.

It must never become graphic or realistic.

### 3.1 Design philosophy for damage

The damage system should communicate:

- impact intensity
- accumulated suffering
- temporary status effects
- type of attack
- physical condition
- emotional reaction

Damage should feel funny and responsive, not disturbing.

Think **Looney Tunes**, old Flash games, slapstick cartoons, and exaggerated meme suffering.

### 3.2 Damage-state categories

Create modular art support for the following state categories:

#### A. Light damage
- tiny scuffs
- dirt smears
- small cheek bruise
- lip dent
- minor eye wobble
- annoyed facial expression
- brief dizzy reaction

#### B. Moderate damage
- more visible bruising
- reddened / swollen lip
- scrapes
- slightly bent posture
- one eye slightly dazed
- stars circling head
- tears pooling in eyes
- wobble stance

#### C. Heavy damage
- blackened soot face
- swollen eye
- split or dented lip shape
- stronger body bend
- limp arm pose
- dented silhouette
- strong trembling
- tooth chip variant if stylistically appropriate
- more pronounced crying / panic face

#### D. Extreme cartoon damage
- flattened pancake body
- stretched noodle body
- accordion-compressed body
- inflated balloon body
- frozen ice-coated Wassie
- electrocuted crispy outline state
- burnt soot state
- x-ray shock gag
- shell-cracked / impact-fracture overlay
- spinning dizziness
- detached cartoon limbs that quickly reassemble
- folded / pretzeled body state

#### E. Recovery states
- bandage on face
- head wrap
- ice pack
- dazed blinking
- recovering wobble
- soot shaking off
- limp-to-normal transition
- self-reforming squash/stretch recovery

### 3.3 Emotional reaction states

Create facial expression variants for:

- neutral
- mildly annoyed
- uncomfortable
- confused
- dizzy
- crying
- panicked
- shocked
- devastated
- angry
- empty thousand-yard stare
- smug recovery
- fully broken / dissociated meme stare

### 3.4 Status effect visuals

Create overlays and variants for:

- fire / burning
- electricity
- freezing
- slime
- radiation / glow
- poison / green sickness
- sleep
- stun
- magnetized
- zero gravity
- wet / soaked
- muddy / dirty
- ghostly / cursed
- glitch / internet corruption
- “financial damage” crypto joke states

### 3.5 Technical implementation requirement

The damage-state system must be **modular**, not manually redrawn as completely separate full characters every time.

Prefer a layered approach such as:

- base character sprite-stack
- facial feature overlays
- bruise / soot / crack overlays
- deformation state swaps
- effect-specific material variants
- rig-driven state changes
- blendable expression layers
- temporary procedural effects where possible

This allows combinations such as:

- dizzy + bruised + crying
- frozen + cracked + panicked
- electrocuted + soot + twitching
- flattened + stunned + blinking
- swollen lip + watery eyes + wobbling stance

---

## 4. SPRITE-STACKING REQUIREMENTS FOR WASSIE

Wassie must be built as a **high-quality coherent sprite-stacked asset**.

Do not fake this using simple layer-scaling tricks.

### Required stack goals

- preserve exact character identity
- maintain silhouette accuracy
- support 3/4 camera view
- support subtle rotation
- support convincing lighting
- support expressive facial states
- support deformation states
- support modular damage overlays
- support real-time gameplay rendering

### Recommended character structure

Split the character into modular stackable parts:

- head
- torso
- left arm
- right arm
- left foot
- right foot
- facial features
- lips
- chest marking
- damage overlays
- effects overlays

This should allow:

- ragdoll movement
- separate impact reactions
- independent arm motion
- foot placement
- head wobble
- mouth expression changes
- eye state swaps
- modular hurt states

### Stack fidelity standard

The sprite stack should look excellent under:

- neutral light
- warm dramatic light
- cool lab light
- strong side light
- top-down shadowing
- explosion flashes
- emissive environmental lighting

---

## 5. WASSIE ASSET LIST

Create a dedicated character asset list before broader world asset production.

### 5.1 Core character assets
- canonical Wassie hero render
- front orthographic reference
- side orthographic reference
- rear orthographic reference
- top silhouette
- rig map
- sprite-stack slices
- sprite atlas
- collider map
- animation bind data
- damage state metadata

### 5.2 Expression assets
- neutral
- sad
- empty stare
- concerned
- shocked
- crying
- dizzy
- angry
- smug
- terrified
- exhausted
- defeated
- KO stare

### 5.3 Body deformation assets
- normal
- compressed
- stretched
- flattened
- bent
- twisted
- inflated
- frozen
- electrified
- charred
- liquified cartoon wobble
- shattered-cartoon state
- paper-thin flattened state

### 5.4 Hurt overlay assets
- left cheek bruise
- right cheek bruise
- forehead bump
- lip swelling
- eye puff
- soot marks
- scrape marks
- small crack overlays
- tears
- stars
- bandages
- ice pack
- sweat drops
- bloodless cartoon impact dents
- confusion spirals

### 5.5 Animation state assets
- idle
- blink
- look left
- look right
- eye dart
- subtle breathing
- wobble
- ragdoll limp
- getting grabbed
- thrown
- impact recoil
- bounce
- stunned shake
- recovery wobble

---

## 6. ART DIRECTION FOR POLISH

The character and all game assets must be elevated by **beautiful rendering and lighting**.

We are not aiming for raw meme art dropped into a game.

We are aiming for **premium presentation of simple iconic forms**.

### Required visual polish
- cinematic but readable lighting
- contact shadows
- subtle rim lights
- material-aware shading
- stable black outline preservation
- crisp nearest-neighbor pixel handling
- tasteful bloom only on emissive objects
- dramatic environmental color grading
- layered parallax backgrounds
- coherent material palette
- satisfying particles

### Important constraint
Do not over-render the character so much that he stops feeling like Wassie.

The rendering should enhance him, not transform him into another franchise or style.

---

## 7. PIPELINE REQUIREMENTS

Create a full asset production pipeline specifically designed for sprite-stacked game assets.

### Pipeline stages
1. asset manifest definition
2. source concept normalization
3. coherent source volume creation
4. sprite-stack slicing
5. atlas export
6. metadata export
7. rig assignment
8. lighting validation
9. damage-layer validation
10. in-engine preview
11. performance validation
12. final QA

### For Wassie specifically
The pipeline must support:
- canonical sprite generation
- hurt-state generation
- expression swaps
- overlay stacking
- deformed state generation
- rig preview
- export to in-engine runtime format

---

## 8. CHARACTER QA CHECKLIST

Before approving the Wassie asset set, verify:

- does he look identical to the supplied reference?
- are the eyes the right size and placement?
- are the lips the right shape and color?
- is the chest crescent preserved?
- are the feet correct?
- are the proportions correct?
- does the silhouette still read as Wassie?
- does he still read correctly when rotated slightly?
- do the damage states remain readable?
- do the damage states remain funny?
- do the damage states avoid gore?
- do overlays combine cleanly?
- do lighting conditions improve the model?
- do deformations preserve recognizability?

If the answer is no to any of the above, revise before scaling production.

---

## 9. INITIAL IMPLEMENTATION ORDER

Do not mass-produce all assets yet.

Implement in this exact order:

### Phase 1 — Character lock
- ingest the new high-quality Wassie reference
- define the canonical proportions
- create orthographic turnarounds
- define palette and outlines
- create art bible for Wassie fidelity

### Phase 2 — Wassie sprite-stack prototype
- build coherent source volume
- generate high-quality stack
- validate front/side/3/4 views
- tune lighting and shading
- verify recognizability

### Phase 3 — Hurt-state framework
- build modular expression system
- build modular bruise / soot / tear / dent overlays
- build deformation-state system
- build recovery-state system
- test combined states

### Phase 4 — In-engine character test
- import Wassie into runtime
- add ragdoll / articulation
- add grabbing / throwing
- add hit reactions
- add damage accumulation visuals
- add automatic recovery cycle

### Phase 5 — Asset standardization
Once Wassie is perfect, use him as the fidelity benchmark for every other sprite-stacked asset in the game.

---

## 10. FINAL CREATIVE DIRECTION

Wassie is the star of the game.

He must be:
- pathetic
- lovable
- funny
- resilient
- expressive
- highly readable
- instantly iconic

Players should laugh not just because objects hit him, but because **his visual reactions sell the suffering**.

His damage states should create the feeling that:
- he has clearly been through a lot
- he somehow survives everything
- he looks worse and worse in hilarious ways
- the player wants to keep experimenting just to see what happens next

The character fidelity and reaction quality are more important than sheer quantity of tools early on.

**Perfect Wassie first. Expand the universe second.**

---

## My practical recommendation

If you want, I can next make you **two follow-up prompts** that plug directly into the workflow:

1. **a dedicated “Wassie character pipeline prompt”** just for building the main character, sprite stack, hurt states, and animation states  
2. **a dedicated “full asset spreadsheet/spec prompt”** for generating the entire game asset registry in structured format

That would split the big vision into two highly usable production prompts.
