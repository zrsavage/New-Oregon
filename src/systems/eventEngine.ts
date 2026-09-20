import type { GameState } from "../types/game";
import { EVENTS, EVENTS_BY_ID } from "../data/events";
import { weightedPick } from "./rng";
import { currentTerrain } from "./travel";

export function maybeTriggerEvent(draft: GameState, rng: () => number): string | null {
  if (rng() > 0.35) return null;
  const terrain = currentTerrain(draft);
  const eligible = EVENTS.filter((e) => {
    if (e.minMile !== undefined && draft.mile < e.minMile) return false;
    if (e.maxMile !== undefined && draft.mile > e.maxMile) return false;
    if (e.terrains && !e.terrains.includes(terrain)) return false;
    return true;
  });
  const picked = weightedPick(rng, eligible);
  return picked ? picked.id : null;
}

export function resolveEventChoice(draft: GameState, eventId: string, choiceId: string, rng: () => number): string {
  const event = EVENTS_BY_ID[eventId];
  if (!event) return "";
  const choice = event.choices.find((c) => c.id === choiceId);
  if (!choice) return "";
  return choice.effect(draft, rng);
}
