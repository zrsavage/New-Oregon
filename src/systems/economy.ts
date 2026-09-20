import type { GameState } from "../types/game";
import { ITEMS } from "../data/items";
import { WAGON_TYPES, DRAFT_ANIMALS } from "../data/wagonsAndAnimals";
import { addItem, pushLog, removeItem, skillFor } from "./mutators";

export function outfittingCost(state: GameState): { wagon: number; animals: number; total: number } {
  const wagon = WAGON_TYPES[state.wagonType].cost;
  const animals = DRAFT_ANIMALS[state.draftAnimalType].costPerHead * state.draftAnimalCount;
  return { wagon, animals, total: wagon + animals };
}

// Prices swing per-fort so trading isn't static; seeded off mile marker for determinism.
export function priceAt(state: GameState, itemId: string): number {
  const def = ITEMS[itemId];
  if (!def) return 0;
  const wobble = Math.sin(state.mile * 0.017 + itemId.length) * 0.15;
  const merchantSkill = skillFor(state, "merchant");
  const merchantDiscount = 1 - merchantSkill / 500; // up to ~17% better prices
  return Math.max(0.01, def.basePrice * (1 + wobble) * merchantDiscount);
}

export function buyItem(draft: GameState, itemId: string, qty: number): boolean {
  if (qty <= 0) return false;
  const cost = priceAt(draft, itemId) * qty;
  if (draft.cash < cost) return false;
  draft.cash -= cost;
  addItem(draft, itemId, qty);
  pushLog(draft, `Bought ${qty} ${ITEMS[itemId]?.unit ?? ""} of ${ITEMS[itemId]?.name ?? itemId} for $${cost.toFixed(2)}.`, "info");
  return true;
}

export function sellItem(draft: GameState, itemId: string, qty: number): boolean {
  if (qty <= 0) return false;
  if (!removeItem(draft, itemId, qty)) return false;
  const revenue = priceAt(draft, itemId) * qty * 0.7; // sell below buy price
  draft.cash += revenue;
  pushLog(draft, `Sold ${qty} ${ITEMS[itemId]?.unit ?? ""} of ${ITEMS[itemId]?.name ?? itemId} for $${revenue.toFixed(2)}.`, "info");
  return true;
}

export function payWeeklyWages(draft: GameState): void {
  const owed = draft.party
    .filter((c) => c.status !== "dead" && !c.isFamily)
    .reduce((sum, c) => sum + c.wage, 0);
  if (owed <= 0) return;
  if (draft.cash >= owed) {
    draft.cash -= owed;
    pushLog(draft, `Paid $${owed.toFixed(2)} in wages to hired hands.`, "info");
  } else {
    draft.cash = 0;
    for (const c of draft.party) {
      if (!c.isFamily && c.status !== "dead") c.morale = Math.max(0, c.morale - 20);
    }
    pushLog(draft, "Couldn't cover wages this week — morale suffers among the hired hands.", "bad");
  }
}
