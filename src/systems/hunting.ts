import type { GameState, RiskAssessment } from "../types/game";
import { assessChanceFor, factorsOf, roleFactor, rollAgainst, traitFactor } from "./risk";
import { addItem, gainSkill, getItemQty, partyHasRole, pushLog, removeItem, totalWeight } from "./mutators";
import { currentTerrain, wagonCapacity } from "./travel";
import { randInt } from "./rng";

const HUNTABLE_TERRAIN = new Set(["plains", "hills", "forest"]);

export function canHuntHere(state: GameState): boolean {
  return HUNTABLE_TERRAIN.has(currentTerrain(state));
}

export function huntingBlockedReason(state: GameState): string | null {
  if (!canHuntHere(state)) return "There's no good game to hunt in this terrain.";
  if (getItemQty(state, "rifle") <= 0) return "You need a rifle to hunt.";
  if (getItemQty(state, "bullets") <= 0) return "You're out of bullets.";
  return null;
}

export interface HuntTarget {
  id: string;
  label: string;
  description: string;
  bulletCost: number;
  yieldMin: number;
  yieldMax: number;
  risk: (state: GameState) => RiskAssessment;
}

function smallGameRisk(state: GameState): RiskAssessment {
  const factors = factorsOf(roleFactor(state, "hunter", "Hunter", 25), traitFactor(state, "sharpshooter", "Sharpshooter", 10));
  return assessChanceFor(state, 65, factors, "success");
}

function deerRisk(state: GameState): RiskAssessment {
  const factors = factorsOf(roleFactor(state, "hunter", "Hunter", 35), traitFactor(state, "sharpshooter", "Sharpshooter", 12));
  return assessChanceFor(state, 45, factors, "success");
}

function bigGameRisk(state: GameState): RiskAssessment {
  const factors = factorsOf(roleFactor(state, "hunter", "Hunter", 40), traitFactor(state, "sharpshooter", "Sharpshooter", 15));
  return assessChanceFor(state, 25, factors, "success");
}

export const HUNT_TARGETS: HuntTarget[] = [
  {
    id: "small_game",
    label: "Track Small Game",
    description: "Rabbits and prairie birds. Safe and quick, but there's not much meat on them.",
    bulletCost: 1,
    yieldMin: 10,
    yieldMax: 25,
    risk: smallGameRisk,
  },
  {
    id: "deer",
    label: "Stalk Deer",
    description: "A fair hunt for a fair amount of meat.",
    bulletCost: 2,
    yieldMin: 30,
    yieldMax: 60,
    risk: deerRisk,
  },
  {
    id: "big_game",
    label: "Go After Big Game",
    description: "Elk or bison. A real gamble, but a successful hunt could feed the party for weeks.",
    bulletCost: 3,
    yieldMin: 70,
    yieldMax: 150,
    risk: bigGameRisk,
  },
];

export const HUNT_TARGETS_BY_ID: Record<string, HuntTarget> = Object.fromEntries(HUNT_TARGETS.map((t) => [t.id, t]));

/**
 * Resolves a hunt attempt. Unlike a flat "100 lbs and the rest is wasted"
 * rule, how much meat actually comes home is capped by how much room is
 * genuinely left in the wagon — a limit the player can see coming and plan
 * around, tied to the same cargo system as everything else they carry.
 */
export function resolveHunt(draft: GameState, targetId: string, quality: number, rng: () => number): string {
  const target = HUNT_TARGETS_BY_ID[targetId];
  if (!target) return "";
  if (!removeItem(draft, "bullets", target.bulletCost)) {
    return "You don't have enough bullets for that.";
  }

  const assessment = target.risk(draft);
  if (!rollAgainst(assessment, rng)) {
    pushLog(draft, `The hunt for ${target.label.toLowerCase()} comes up empty.`, "bad");
    return "No luck this time. The game gets away, and you head back to the wagon empty-handed.";
  }

  const shotMultiplier = 0.6 + (Math.max(0, Math.min(100, quality)) / 100) * 0.7;
  const rawYield = Math.round(randInt(rng, target.yieldMin, target.yieldMax) * shotMultiplier);
  const room = Math.max(0, Math.round(wagonCapacity(draft) - totalWeight(draft)));
  const takenYield = Math.min(rawYield, room);

  if (takenYield <= 0) {
    pushLog(draft, "A successful hunt, but the wagon has no room left to carry any of it home.", "bad");
    return "You make the kill, but the wagon is packed to the limit. There's nowhere to put the meat, so you leave it behind.";
  }

  addItem(draft, "fresh_meat", takenYield);
  const hunter = partyHasRole(draft, "hunter");
  if (hunter) gainSkill(draft, hunter, 2, "Hunter");

  if (takenYield < rawYield) {
    pushLog(draft, `Successful hunt, but the wagon could only fit ${takenYield} of ${rawYield} lbs.`, "good");
    return `A successful hunt! But the wagon can't hold it all — you bring back ${takenYield} lbs and have to leave the rest for the coyotes.`;
  }

  pushLog(draft, `Successful hunt: ${takenYield} lbs of fresh meat.`, "good");
  return `A successful hunt! You bring back ${takenYield} lbs of fresh meat.`;
}
