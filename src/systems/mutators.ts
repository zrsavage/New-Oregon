import type { Ailment, Character, GameState, HealthStatus, LogEntry } from "../types/game";
import { ITEMS } from "../data/items";

let logCounter = 0;
export function pushLog(draft: GameState, text: string, tone: LogEntry["tone"] = "info") {
  logCounter += 1;
  const entry: LogEntry = {
    id: `log_${draft.daysTraveled}_${logCounter}`,
    date: { ...draft.date },
    mile: Math.round(draft.mile),
    text,
    tone,
  };
  draft.log.unshift(entry);
  if (draft.log.length > 200) draft.log.length = 200;
}

export function getItemQty(draft: GameState, itemId: string): number {
  return draft.inventory.find((s) => s.itemId === itemId)?.quantity ?? 0;
}

export function addItem(draft: GameState, itemId: string, qty: number) {
  const stack = draft.inventory.find((s) => s.itemId === itemId);
  if (stack) {
    stack.quantity = Math.max(0, stack.quantity + qty);
  } else if (qty > 0) {
    draft.inventory.push({ itemId, quantity: qty });
  }
  draft.inventory = draft.inventory.filter((s) => s.quantity > 1e-6);
}

export function removeItem(draft: GameState, itemId: string, qty: number): boolean {
  const have = getItemQty(draft, itemId);
  if (have < qty) return false;
  addItem(draft, itemId, -qty);
  return true;
}

export function totalWeight(state: GameState): number {
  return state.inventory.reduce((sum, s) => {
    const def = ITEMS[s.itemId];
    if (!def) return sum;
    return sum + def.weightPerUnit * s.quantity;
  }, 0);
}

export function livingParty(state: GameState): Character[] {
  return state.party.filter((c) => c.status !== "dead");
}

export function adjustHealth(person: Character, delta: number) {
  person.health = clamp(person.health + delta, 0, 100);
  if (person.health <= 0) {
    person.status = "dead";
    person.ailment = null;
    person.ailmentDaysRemaining = 0;
  } else if (person.status !== "dead") {
    person.status = deriveStatus(person);
  }
}

function deriveStatus(person: Character): HealthStatus {
  if (person.ailment) return person.health < 30 ? "gravely_ill" : "sick";
  if (person.health < 35) return "fatigued";
  return "healthy";
}

export function afflict(person: Character, ailment: Ailment, days: number) {
  if (person.status === "dead") return;
  person.ailment = ailment;
  person.ailmentDaysRemaining = days;
  person.status = deriveStatus(person);
}

export function cureAilment(person: Character) {
  person.ailment = null;
  person.ailmentDaysRemaining = 0;
  person.status = deriveStatus(person);
}

export function adjustMorale(draft: GameState, delta: number) {
  for (const person of draft.party) {
    if (person.status === "dead") continue;
    person.morale = clamp(person.morale + delta, 0, 100);
  }
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function averagePartyMorale(state: GameState): number {
  const alive = livingParty(state);
  if (alive.length === 0) return 0;
  return alive.reduce((s, c) => s + c.morale, 0) / alive.length;
}

export function partyHasRole(state: GameState, role: Character["role"]): Character | undefined {
  return livingParty(state).find((c) => c.role === role && c.status !== "gravely_ill");
}

export function skillFor(state: GameState, role: Character["role"]): number {
  const person = partyHasRole(state, role);
  return person ? person.skillLevel : 0;
}

/**
 * Grows a party member's skill through use. Logs a note only when they cross
 * a 5-point tier, so routine +1/+2 gains don't spam the trail log.
 */
export function gainSkill(draft: GameState, person: Character, amount: number, roleLabel: string) {
  const before = person.skillLevel;
  person.skillLevel = clamp(person.skillLevel + amount, 0, 100);
  const beforeTier = Math.floor(before / 5);
  const afterTier = Math.floor(person.skillLevel / 5);
  if (afterTier > beforeTier) {
    pushLog(draft, `${person.name} grows more skilled as a ${roleLabel} (skill ${person.skillLevel}).`, "good");
  }
}
