# The Flip

**A dark, cinematic digital crime world.**

Accidental entry into crime. Dirty vs clean money. Trust and betrayal. A persistent detective case file. Real-time chases and costly action. Multiple states/regions. Later multiplayer. Some players can finish **alive and uncaught** by exiting the life.

> The more successful you become at making dirty money, the harder and more dangerous it becomes to enjoy it.

**Repo:** https://github.com/iamtheoracle/the-flip

---

## Play the systems prototype

**File:** [`index.html`](./index.html) — open in any modern browser.

Includes: character setup, dirty/clean money, trust network, Kessler evidence + journal, bail, jail, vehicles, exit score, quiet endings, caught ending, and a playable **real-time chase** (drive, break line of sight, or get boxed in).

It opens on the case-file landing from the original build — pick The Favor, The Debt, or The Witness to seed the run — then hands off to the systems and chase.

**Chase engine:** [`js/chase.js`](./js/chase.js) is a standalone, event-driven `FlipChase.ChaseRun`. It owns the canvas, loop, pursuit AI and input, and never touches game state — it reports `start`, `hud`, `phase`, `shot`, `collision`, `escape`, `busted` and `end` events. `index.html` subscribes and applies evidence, vehicle heat, reward, story and bail, so the chase can be invoked from any screen with `new FlipChase.ChaseRun(...).start({vehicleClass, intensity, reward, units})`.

This is the **consequence brain**. Full real-time 3D/multiplayer is the production target, not this file alone.

---

## Design docs

| Doc | Contents |
|-----|----------|
| [docs/REALTIME_CHASES.md](./docs/REALTIME_CHASES.md) | Real-time chase phases, AI, vehicles, evidence |
| [docs/OPEN_WORLD_CRIME_ENGINES.md](./docs/OPEN_WORLD_CRIME_ENGINES.md) | Sandbox engine patterns, services, tech path |
| [docs/AI_BUILDER_MASTER_PROMPT.md](./docs/AI_BUILDER_MASTER_PROMPT.md) | **Copy-paste prompt for other AI builders** |

---

## Vision roadmap

1. Systems prototype (playable) 
2. Real-time operable districts + chases 
3. Multi-state world + challenges 
4. Multiplayer hubs, shared economy, personal case files 

---

## Design pillars

1. Consequence compounds  
2. Trust is lethal  
3. Money is a trap  
4. The detective never fully resets  
5. Action exists but costs  
6. Exit is possible  

---

## License

All rights reserved for now. Design + prototype.
