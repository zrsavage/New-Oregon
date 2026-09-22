import type { GameState } from "../types/game";
import { adjustHealth, adjustMorale, gainSkill, getItemQty, livingParty, partyHasRole, pushLog, removeItem } from "./mutators";

const MEAL_FOOD_PRIORITY = ["fresh_meat", "bacon", "cornmeal", "beans", "flour", "dried_fruit", "sugar"];
const LBS_PER_PERSON = 0.75;

export function estimateMealFoodCost(state: GameState): number {
  return Math.round(livingParty(state).length * LBS_PER_PERSON * 10) / 10;
}

export function cookingBlockedReason(state: GameState): string | null {
  if (state.cookedToday) return "You've already cooked a special meal today.";
  const alive = livingParty(state);
  if (alive.length === 0) return "There's no one left to cook for.";
  const needed = estimateMealFoodCost(state);
  const have = MEAL_FOOD_PRIORITY.reduce((sum, id) => sum + getItemQty(state, id), 0);
  if (have < needed) return "Not enough food on hand to cook a proper meal.";
  return null;
}

/**
 * A quick, once-a-day treat that doesn't cost the wagon a mile — unlike
 * hunting, cooking is something the party can do alongside travel. Quality
 * from the timing mini-game doesn't gate success (a meal always comes out),
 * it just decides how good it is: a bigger morale lift and a small health
 * bump for everyone at the table.
 */
export function resolveCook(draft: GameState, quality: number): string {
  const reason = cookingBlockedReason(draft);
  if (reason) return reason;

  const alive = livingParty(draft);
  let needed = estimateMealFoodCost(draft);
  for (const itemId of MEAL_FOOD_PRIORITY) {
    if (needed <= 0) break;
    const have = getItemQty(draft, itemId);
    const used = Math.min(have, needed);
    if (used > 0) {
      removeItem(draft, itemId, used);
      needed -= used;
    }
  }

  draft.cookedToday = true;
  const q = Math.max(0, Math.min(100, quality));
  const moraleGain = Math.round(2 + (q / 100) * 13);
  const healthGain = Math.round((q / 100) * 4);

  adjustMorale(draft, moraleGain);
  if (healthGain > 0) {
    for (const person of alive) adjustHealth(person, healthGain);
  }

  const cook = partyHasRole(draft, "cook");
  if (cook) gainSkill(draft, cook, 1, "Cook");

  if (q < 25) {
    pushLog(draft, "A scorched, half-cooked meal — edible, but nobody's thrilled.", "info");
    return "The meal comes out scorched and a little underwhelming, but it's hot food, and everyone's glad for that much.";
  }
  if (q < 65) {
    pushLog(draft, `A decent meal lifts spirits a little. (+${moraleGain} morale)`, "good");
    return "A solid, simple meal. Nothing fancy, but it fills bellies and lifts spirits around the fire.";
  }
  pushLog(draft, `A hearty, well-cooked meal boosts morale. (+${moraleGain} morale)`, "good");
  return "A genuinely good meal — maybe the best since Independence. The whole party eats well and spirits rise.";
}
