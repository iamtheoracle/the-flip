# Master Prompt — The Flip (for AI app / game builders)

Copy everything below the line into another AI builder.

---

## Product
Build **The Flip**: a dark, cinematic digital crime world. Players create a character, get pulled into crime by accident, and operate in real time across multiple states/regions. Core fantasy: the more dirty money you make, the harder it is to enjoy; every useful person can betray you; a persistent detective builds a real case file; some players can finish alive and uncaught by exiting the life.

Tone: gritty, tense, consequence-heavy. Not a pure power fantasy. Quiet moments should feel dangerous. Action is real-time and costly.

## Platforms (target)
Start: web or cross-platform client with a playable single-player loop. Architecture should allow later multiplayer.

## Player fantasy loop
1. Character creation (appearance, lifestyle, personality)
2. Accidental entry into crime
3. Earn dirty money via jobs / risk
4. Launder or spend under pressure
5. Manage trust network + police/detective heat
6. Real-time chases and occasional violence
7. Arrest → bail or jail
8. Optional exit the life (quiet ending) OR go deeper OR get caught

## Mandatory systems

### Money
- Dirty vs Clean ledgers
- Laundering channels with loss % and risk (gambling den, business front, movers)
- Dirty bail payments add evidence

### Detective Kessler / Evidence (not only stars)
- Specific evidence entries with weights
- Case Intensity 0–100
- Journal timeline searchable by day
- Escalation to warrants/arrests

### Trust network (six pillars, expandable)
Sofia (partner), Cole (street), Dom (lawyer), Lena (den), Ray (front), Eve (mover)
- Trust 0–100 with states: useful / cautious / unreliable / dangerous
- At 0: they talk; specific evidence quoted onto the case file; romance break has a concrete reason

### Legal
- Bail bond screen: pay clean, pay dirty (flagged), or refuse → jail
- Jail: time passes, trust decays, record grows
- Later: sentencing, prison pressure, rare escape (caught again after escape = hard game over)

### Vehicles
- Own (clean money, registered), stolen, hacked (modern traces)
- Classes: low-profile, standard, performance, heavy
- Vehicle heat; dump hot cars; performance helps chase, hurts aftermath

### Real-time chases
- Phases: contact → break → sustain → separation/containment → aftermath
- LOS timers, route choice, class differences, stress while driving
- Chase always emits evidence (plates, cameras, witnesses)

### Combat (occasional)
- Responsive feel but realistic limits: stress accuracy, movement penalties, noise stats
- Noise and public violence spike evidence and response

### Multi-state world
Multiple regions with different police posture, job types, cameras, laundering options (metro, industrial, port, suburban, night district).

### Exit ramps
- Exit Score from quiet days, clean money, low intensity, refused jobs, dumped dirty cash, preserved relationships
- Endings must include: walked away alive uncaught; faded out; caught by case file; (optional) death only as rare failure — not the default

### Multiplayer (phase 2+)
Shared regions and economy; personal case files persist; players can crew or betray; regional heat; instanced high-stakes jobs; trust/reputation across players.

## Presentation
- Character creator with visual identity (face/clothing/housing as art pipeline allows)
- Cinematic UI: case file, trust board, money dashboard, bail modal
- Prefer atmosphere and tension over clownish chaos

## Tech direction
- Prefer architecture with services: World, Economy, Heat/Case, Trust, Chase/Combat, Legal, Progression
- Single-player first with persistent meta; multiplayer-ready net boundaries (hubs + instances)
- Engine choice flexible (Unity/Unreal/Godot) if systems above are respected

## Success criteria
A player can: create a character, take jobs, launder, get chased in real time, get arrested and post bail, watch evidence grow, lose allies to betrayal, and either escape the life quietly OR get buried by Kessler’s file — without the game requiring murder-porn or cartoon wanted stars as the only pressure.

## Non-goals
- Mindless rampage as the main loop
- Instant guilt-free wealth
- Heat that resets with no memory
- Multiplayer that erases personal consequence

## Reference implementation
GitHub repo `iamtheoracle/the-flip` contains a browser systems prototype (`index.html`) and design docs under `docs/` (chases, engines). Extend toward real-time operable world; do not throw away the consequence model.
