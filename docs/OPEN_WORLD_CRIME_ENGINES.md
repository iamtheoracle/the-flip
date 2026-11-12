# Open-World Crime Engines — Exploration for The Flip

## What "engine" means here
Not only Unity/Unreal, but the *game systems architecture* that makes a crime sandbox run: world streaming, AI directors, economy, wanted/heat, mission graphs, multiplayer sync.

## Common industry approaches

### 1. Monolithic open world (classic GTA-like)
- One large streamed map, dense activity everywhere
- Pros: immersion, emergent chaos
- Cons: expensive, hard to keep consequence personal, multiplayer authority is hard

### 2. Hub + instance hybrid
- Persistent hubs (districts) + instanced jobs/chases
- Pros: easier netcode, clearer heat boundaries
- Cons: can feel less "one continuous city"

### 3. Session-based crime sandboxes
- Matches/sessions with shared rules, then teardown
- Pros: balance and fairness
- Cons: weaker long-term case-file identity unless meta-progression persists

### 4. Systems-first RPG crime (lighter action)
- Strong simulation of money, factions, heat; action is secondary
- Pros: matches The Flip's soul (trust, evidence, exit)
- Cons: players expecting pure action may bounce

## Recommended path for The Flip
**Phased hybrid:**
1. **Now:** Systems prototype (done) + design docs
2. **Next:** Single-player real-time districts (few states), instanced jobs/chases, persistent meta (money, trust, case file)
3. **Later:** Multiplayer hubs with regional heat, instanced high-stakes scores, shared economy with personal case files

## Core runtime services any build needs
- **World service** — regions/states, streaming, POIs (den, front, lawyer, safe apartment)
- **Economy service** — dirty/clean ledgers, laundering channels, inflation controls (MP)
- **Heat/Case service** — evidence objects, intensity, detective escalation (not only stars)
- **Trust/Social service** — NPC + later player reputation
- **Chase/Combat service** — real-time rules, stress, noise
- **Legal service** — arrest, bail, sentencing flags
- **Progression service** — character identity, lifestyle, unlocks without breaking tone

## Engine tech options (implementation layer)
| Stack | Fit |
|-------|-----|
| Unreal | High-fidelity action, chases, large worlds; heavier team cost |
| Unity | Fast iteration, strong multiplayer ecosystem, mobile/desktop reach |
| Godot | Lighter, good for prototypes; MP and huge worlds need care |
| Custom + dedicated servers | Best long-term control for crime economy fairness |

## Design rule
The "engine" must privilege **consequence** over spectacle. Wanted level is a *case file*, not only a star count. Multiplayer must not erase personal evidence or make betrayal meaningless.
