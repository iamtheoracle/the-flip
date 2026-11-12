# Real-Time Chase Mechanics — The Flip

## Design goals
- Chases feel physical and stressful, not arcade-weightless.
- Escape is about line-of-sight, terrain, and vehicle choice — not only top speed.
- Every chase feeds the case file (plates, cameras, damage, witnesses).
- Performance cars help *during* the chase and hurt *after* (visibility, heat).

## Chase phases
1. **Contact** — player chooses run / comply / misdirect.
2. **Break** — acceleration and first corners; stress rises.
3. **Sustain** — route choice, traffic, alleys, highway.
4. **Separation or containment** — LOS break vs spike strips / more units / box-in.
5. **Aftermath** — dump vehicle, change clothes/region, evidence entries land.

## Player controls (real-time)
- Steer, accelerate, brake, handbrake
- Optional: look back, horn (rarely useful), bail on foot
- No magic nitro by default; boosts if any are limited and noisy

## Police AI behavior
- Units join based on heat + region response level
- They cut routes, do not all follow the same path blindly
- Radio delay: not instant perfect knowledge of player position
- Ramming is possible but riskier for them in civilian areas
- Air support (later regions) increases LOS recovery

## Vehicle class effects in chase
| Class | Chase strength | Aftermath cost |
|-------|----------------|----------------|
| Low-profile | Weak pure speed; good in dense alleys | Low memorability |
| Standard | Balanced | Medium |
| Performance | Best separation | High witness/camera profile |
| Heavy | Ramming / blocking | Slow; easy to track |

## Stress & shooting while driving
- High speed + incoming pressure raises stress
- Accuracy while moving is poor (see weapon handling docs)
- Firing in chase spikes evidence and response level hard

## Escape conditions
- Break LOS for a sustained timer that scales with pursuit size
- Enter structured hide options (garage, lot, region edge) if available
- On-foot bail: slower, different evidence profile

## Failure conditions
- PIT / box-in / immobilization
- Player stops and is surrounded
- Catastrophic crash
- On-foot tackle / arrest after bail

## Evidence outputs (examples)
- Plate reader hits along route
- Camera corridor matches
- Witness vehicle description
- Damage pattern / paint transfer
- Weapon discharge during pursuit

## Multiplayer notes (later)
- Players can block, bait, or sell out routes
- One player's chase can raise regional heat for others nearby
- Crew extraction (second vehicle) is high trust, high betrayal risk
