import type { GameState, RiverCrossing, RiverCrossingMethod } from "../types/game";
import { adjustHealth, getItemQty, livingParty, pushLog, removeItem, skillFor } from "./mutators";
import { randInt } from "./rng";
import { ITEMS } from "../data/items";

export interface CrossingResult {
  success: boolean;
  narrative: string;
}

function riskScore(crossing: RiverCrossing): number {
  return crossing.depthFt * 1.2 + crossing.currentSpeed;
}

export function attemptCrossing(
  draft: GameState,
  crossing: RiverCrossing,
  method: RiverCrossingMethod,
  rng: () => number
): CrossingResult {
  const scoutSkill = skillFor(draft, "scout");
  const wainwrightSkill = skillFor(draft, "wainwright");
  const risk = riskScore(crossing);

  if (method === "ferry") {
    if (!crossing.hasFerry) return { success: false, narrative: "There's no ferry operating here." };
    if (draft.cash < crossing.ferryCost) return { success: false, narrative: "You can't afford the ferry fee." };
    draft.cash -= crossing.ferryCost;
    pushLog(draft, `Paid $${crossing.ferryCost} for the ferry across ${crossing.name}.`, "info");
    return { success: true, narrative: "The ferry carries you safely across, wagon and all." };
  }

  if (method === "guide") {
    if (!crossing.hasGuide) return { success: false, narrative: "No guide is available here." };
    if (draft.cash < crossing.guideCost) return { success: false, narrative: "You can't afford the guide's fee." };
    draft.cash -= crossing.guideCost;
    const failChance = Math.max(0.03, risk / 200);
    if (rng() < failChance) {
      const lost = Math.min(getItemQty(draft, "flour"), randInt(rng, 5, 20));
      removeItem(draft, "flour", lost);
      pushLog(draft, `Even with a guide, ${crossing.name} claims some supplies.`, "bad");
      return { success: true, narrative: "Even with a guide's help, the crossing is rough and you lose some supplies." };
    }
    pushLog(draft, `A hired guide brings you safely across ${crossing.name}.`, "good");
    return { success: true, narrative: "The guide knows every rock and eddy. You cross without incident." };
  }

  if (method === "wait") {
    pushLog(draft, "You make camp and wait for the river to calm.", "info");
    return { success: true, narrative: "You wait a day. The water may be calmer tomorrow." };
  }

  // ford or caulk_float
  const skillBonus = method === "caulk_float" ? wainwrightSkill : scoutSkill;
  const baseFailChance = method === "caulk_float" ? risk / 90 : risk / 55;
  const failChance = Math.max(0.02, baseFailChance - skillBonus / 300);

  if (rng() < failChance) {
    // Failure: lose cargo, damage wagon, possible injury.
    const weightLossFrac = 0.05 + rng() * 0.15;
    for (const stack of draft.inventory) {
      const def = ITEMS[stack.itemId];
      if (!def) continue;
      stack.quantity = Math.max(0, stack.quantity * (1 - weightLossFrac));
    }
    draft.inventory = draft.inventory.filter((s) => s.quantity > 0.5);
    draft.wagonCondition = Math.max(0, draft.wagonCondition - randInt(rng, 10, 30));

    if (rng() < 0.25) {
      const alive = livingParty(draft);
      if (alive.length > 0) {
        const victim = alive[Math.floor(rng() * alive.length)];
        adjustHealth(victim, -randInt(rng, 15, 35));
        pushLog(draft, `${victim.name} is swept in the current at ${crossing.name} but pulled to safety.`, "critical");
      }
    }
    pushLog(draft, `The crossing at ${crossing.name} goes badly. Supplies and wagon condition are lost.`, "bad");
    return { success: true, narrative: `The current catches the wagon. You make it across, but not without paying a price.` };
  }

  pushLog(draft, `You cross ${crossing.name} without serious trouble.`, "good");
  return { success: true, narrative: "With care and effort, you make it to the far bank safely." };
}
