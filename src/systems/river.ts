import type { GameState, RiskAssessment, RiverCrossing, RiverCrossingMethod } from "../types/game";
import { adjustHealth, gainSkill, getItemQty, livingParty, partyHasRole, pushLog, removeItem, totalWeight } from "./mutators";
import { assessChanceFor, factorsOf, roleDangerReduction, rollAgainst } from "./risk";
import { randInt } from "./rng";
import { ITEMS } from "../data/items";

export interface CrossingResult {
  success: boolean;
  narrative: string;
  clean: boolean; // true if no wagon condition or cargo was lost
}

function severity(crossing: RiverCrossing): number {
  return crossing.depthFt * 1.2 + crossing.currentSpeed;
}

/**
 * Odds of a bad outcome for a given crossing method, factoring in the party's
 * scout (fords) or wainwright (caulk-and-float). Ferry and wait have no risk
 * roll of their own, so they return null. Used both to render the odds in
 * the crossing modal and to roll the real outcome below.
 */
export function assessCrossingRisk(state: GameState, crossing: RiverCrossing, method: RiverCrossingMethod): RiskAssessment | null {
  const risk = severity(crossing);
  if (method === "ford") {
    const base = (risk / 55) * 100;
    const factors = factorsOf(roleDangerReduction(state, "scout", "Scout", 35));
    return assessChanceFor(state, base, factors, "danger");
  }
  if (method === "caulk_float") {
    const base = (risk / 90) * 100;
    const factors = factorsOf(roleDangerReduction(state, "wainwright", "Wainwright", 35));
    return assessChanceFor(state, base, factors, "danger");
  }
  if (method === "guide") {
    const base = (risk / 200) * 100;
    return assessChanceFor(state, base, [], "danger");
  }
  return null;
}

/**
 * Ford and caulk-float are hands-on efforts: a well-timed push at the wagon
 * wheels or the float ropes measurably improves the odds. Quality (0-100,
 * from the timing mini-game) scales the danger chance from the assessment
 * without ever overriding the underlying skill-based roll.
 */
function qualityAdjustedChance(assessment: RiskAssessment, quality: number): number {
  const q = Math.max(0, Math.min(100, quality));
  const multiplier = 1.3 - (q / 100) * 0.8; // 1.3x danger at quality 0, 0.5x at quality 100
  return Math.max(2, Math.min(98, Math.round(assessment.chance * multiplier)));
}

export function attemptCrossing(
  draft: GameState,
  crossing: RiverCrossing,
  method: RiverCrossingMethod,
  quality: number,
  rng: () => number
): CrossingResult {
  if (method === "ferry") {
    if (!crossing.hasFerry) return { success: false, narrative: "There's no ferry operating here.", clean: true };
    if (draft.cash < crossing.ferryCost) return { success: false, narrative: "You can't afford the ferry fee.", clean: true };
    draft.cash -= crossing.ferryCost;
    pushLog(draft, `Paid $${crossing.ferryCost} for the ferry across ${crossing.name}.`, "info");
    return { success: true, narrative: "The ferry carries you safely across, wagon and all.", clean: true };
  }

  if (method === "wait") {
    pushLog(draft, "You make camp and wait for the river to calm.", "info");
    return { success: true, narrative: "You wait a day. The water may be calmer tomorrow.", clean: false };
  }

  const wagonBefore = draft.wagonCondition;
  const weightBefore = totalWeight(draft);
  const wasClean = () => draft.wagonCondition >= wagonBefore - 0.01 && totalWeight(draft) >= weightBefore - 0.01;

  if (method === "guide") {
    if (!crossing.hasGuide) return { success: false, narrative: "No guide is available here.", clean: true };
    if (draft.cash < crossing.guideCost) return { success: false, narrative: "You can't afford the guide's fee.", clean: true };
    draft.cash -= crossing.guideCost;
    const assessment = assessCrossingRisk(draft, crossing, "guide")!;
    if (rollAgainst(assessment, rng)) {
      const lost = Math.min(getItemQty(draft, "flour"), randInt(rng, 5, 20));
      removeItem(draft, "flour", lost);
      pushLog(draft, `Even with a guide, ${crossing.name} claims some supplies.`, "bad");
      return { success: true, narrative: "Even with a guide's help, the crossing is rough and you lose some supplies.", clean: wasClean() };
    }
    pushLog(draft, `A hired guide brings you safely across ${crossing.name}.`, "good");
    return { success: true, narrative: "The guide knows every rock and eddy. You cross without incident.", clean: wasClean() };
  }

  // ford or caulk_float
  const assessment = assessCrossingRisk(draft, crossing, method)!;
  const adjusted = { ...assessment, chance: qualityAdjustedChance(assessment, quality) };
  if (rollAgainst(adjusted, rng)) {
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
    return { success: true, narrative: `The current catches the wagon. You make it across, but not without paying a price.`, clean: false };
  }

  pushLog(draft, `You cross ${crossing.name} without serious trouble.`, "good");
  if (method === "ford") {
    const scout = partyHasRole(draft, "scout");
    if (scout) gainSkill(draft, scout, 1, "Scout");
  } else {
    const wainwright = partyHasRole(draft, "wainwright");
    if (wainwright) gainSkill(draft, wainwright, 1, "Wainwright");
  }
  return { success: true, narrative: "With care and effort, you make it to the far bank safely.", clean: true };
}
