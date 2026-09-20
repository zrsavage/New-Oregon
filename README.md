# The Oregon Trail: A Detailed Journey West

A from-scratch, much more detailed reimagining of The Oregon Trail, built as a
browser game with React, TypeScript, and Zustand.

## What's different from the original

- **Wagon & supply logistics**: choose a wagon class, draft animals, and haul
  a real inventory of food (with individual spoilage rates), spare parts,
  tools, ammunition, medicine, clothing, and trade goods, all tracked by
  weight against your wagon's capacity.
- **A real party system**: hire named travelers with roles (scout, hunter,
  wainwright, healer, cook, teamster, farmer, merchant), each with a skill
  level, traits, wages, health, morale, and fatigue. Roles meaningfully
  affect hunting yield, repair odds, illness recovery, food spoilage, river
  crossing safety, and trade prices.
- **Route and terrain decisions**: a ~1900-mile trail with real forks
  (Sublette Cutoff vs. Fort Bridger, Barlow Road vs. the Columbia River
  rapids), five river-crossing methods (ford, caulk-and-float, ferry, hire a
  guide, or wait it out), weather that shifts by season and terrain, and a
  pace/rations tradeoff that drives day-to-day risk.
- **An economy**: fluctuating prices, buying and selling at forts, weekly
  wages for hired hands, and a merchant skill that improves your prices.
- **~20 branching random events** covering illness, mechanical breakdowns,
  wildlife, weather, hazards, and other travelers, each with meaningful
  choices tied to your party's roles and supplies.

## Running it

```bash
npm install
npm run dev
```

Then open the printed local URL. `npm run build` produces a production
build; `npm run dev` starts the Vite dev server with hot reload.

## Project structure

- `src/types` — the core domain model (characters, wagon, inventory, trail,
  events, game state).
- `src/data` — static content: the trail itself, roles, traits, items,
  wagons/animals, and the event catalog.
- `src/systems` — pure game logic: character generation, economy, travel and
  the daily tick, river crossings, event resolution, ending checks.
- `src/state/gameStore.ts` — the Zustand store tying systems to UI actions,
  with automatic local-storage save/load.
- `src/components` — the title, outfitting, travel, and ending screens, plus
  the event/fork/river/trade modals.

## Save data

Progress auto-saves to `localStorage` under the key `new-oregon-save`. The
title screen offers "Continue Journey" whenever a save is in progress.
