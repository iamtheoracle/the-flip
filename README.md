# The Flip

**A dark, cinematic crime life simulation.**

You start as an ordinary person. One irreversible moment flips your life permanently — a favor for the wrong person, a debt, witnessing something you shouldn’t have. There is no grand decision to become a criminal. You simply slide in. By the time you understand how deep you are, the exit is already closing.

> The more successful you become at making dirty money, the harder and more dangerous it becomes to enjoy it.

**Repo:** https://github.com/iamtheoracle/the-flip

---

## Play the Prototype (Browser)

A playable core-systems prototype is included:

**File:** [`index.html`](./index.html)

### How to run
1. Download or clone this repo
2. Open `index.html` in any modern browser  
   (or use a simple local server if you prefer)

### What the prototype includes
- Dirty vs Clean money
- Trust scores for all six main characters
- Evidence log + Case Intensity (Detective Kessler)
- Bail Bond screen on arrest (pay clean / pay dirty / refuse → jail)
- Journal tab with evidence timeline
- Story choices that change money, trust, and evidence
- Betrayal at 0 trust adds specific evidence

This is a **systems prototype**, not the full action game (no real-time shooting, 3D driving, or video cutscenes yet).

---

## Core Fantasy

- Accidental entry into crime
- Dirty money vs clean money tension
- Trust and betrayal as primary engines
- Persistent detective building a real case file
- Legal consequences (bail, plea deals, prison, escape)
- Vehicles, chases, occasional high-cost violence
- Deep reactive story with lasting consequences

---

## Key Systems (Design)

### Money
- **Dirty Money** — powerful on the street, toxic in normal life
- **Clean Money** — safe to spend, hard to create
- Laundering is slow, expensive, and risky

### Evidence & Detective Kessler
- Specific evidence entries (not just a heat number)
- Case Intensity meter
- Journal timeline of documented actions

### Trust Network
| Character | Role |
|-----------|------|
| Sofia Reyes | Partner / Spouse |
| Marcus "Cole" Thompson | Street Contact |
| Dominic "Dom" Hale | Lawyer |
| Lena Voss | Gambling Den |
| Raymond "Ray" Okonkwo | Business Front |
| Evelyn "Eve" Shaw | Money Mover |

Trust at **0** = permanent break + specific evidence added to the case file.

### Legal Pipeline
Arrest → Bail screen → Pay (release) or Refuse (jail) → later prison / escape systems in full design.

### Vehicles & Action (full design)
Ownership, hijacking, hacking, vehicle classes, chase tradeoffs, and high-cost violence are specified in the design direction and will expand beyond this prototype.

### Character Creation (planned)
Player-created characters, personalities, lifestyles, with visual goals (faces, clothing, housing, later video).

---

## Design Pillars

1. Consequence compounds  
2. Trust is lethal  
3. Money is a trap  
4. The detective never fully resets  
5. Action exists but costs  

---

## Project Status

| Layer | Status |
|-------|--------|
| Game design / systems | Documented |
| Browser prototype (core loop) | **Playable** (`index.html`) |
| Full action game + app with video | Not implemented in this repo (requires full production pipeline) |

---

## Vision

*The Flip* is the story of a life that changed in one moment and the long cost of living with it. Quiet moments should often feel more dangerous than gunfire.

---

## License

All rights reserved for now. Design + prototype documentation.
