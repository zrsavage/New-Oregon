import type { GameState } from "../types/game";
import { TOTAL_TRAIL_MILES } from "./trail";

export type AchievementUnlockKind = "trophy" | "wagon_icon";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  tier: 1 | 2;
  unlockKind: AchievementUnlockKind;
  unlockId?: string; // emoji id, when unlockKind is "wagon_icon"
  unlockLabel: string;
  isEarned: (state: GameState) => boolean;
}

const FOOD_IDS = ["flour", "bacon", "cornmeal", "beans", "dried_fruit", "fresh_meat", "coffee", "sugar"];

function foodWeight(state: GameState): number {
  return state.inventory.filter((s) => FOOD_IDS.includes(s.itemId)).reduce((sum, s) => sum + s.quantity, 0);
}

const hasDeparted = (s: GameState) => s.phase === "travel" || s.phase === "ending";
const arrivedSafely = (s: GameState) => s.phase === "ending" && s.ending === "arrived";

export const ACHIEVEMENTS: AchievementDef[] = [
  // Tier 1 — earned naturally in a normal run or two.
  {
    id: "on_the_trail",
    name: "On the Trail",
    description: "Depart Independence for the first time.",
    tier: 1,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: hasDeparted,
  },
  {
    id: "well_provisioned",
    name: "Well Provisioned",
    description: "Depart with at least 400 lbs of food.",
    tier: 1,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => hasDeparted(s) && foodWeight(s) >= 400,
  },
  {
    id: "first_fort",
    name: "First Fort",
    description: "Trade at a fort.",
    tier: 1,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => s.visitedForts.length >= 1,
  },
  {
    id: "safe_crossing",
    name: "Safe Crossing",
    description: "Cross a river without losing supplies or wagon condition.",
    tier: 1,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => s.cleanRiverCrossings >= 1,
  },
  {
    id: "full_wagon",
    name: "Full Wagon",
    description: "Depart with a party of 6 or more.",
    tier: 1,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => hasDeparted(s) && s.party.length >= 6,
  },
  {
    id: "halfway_there",
    name: "Halfway There",
    description: "Reach the midpoint of the trail.",
    tier: 1,
    unlockKind: "wagon_icon",
    unlockId: "🐂",
    unlockLabel: "Ox-team wagon marker",
    isEarned: (s) => s.mile >= TOTAL_TRAIL_MILES / 2,
  },

  // Tier 2 — take real skill, luck, or a well-built run.
  {
    id: "unbroken",
    name: "Unbroken",
    description: "Reach Oregon City without losing a single party member.",
    tier: 2,
    unlockKind: "wagon_icon",
    unlockId: "🚚",
    unlockLabel: "Sturdy wagon marker",
    isEarned: (s) => arrivedSafely(s) && s.party.every((c) => c.status !== "dead"),
  },
  {
    id: "iron_wagon",
    name: "Iron Wagon",
    description: "Arrive with your wagon in top condition (80% or better).",
    tier: 2,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => arrivedSafely(s) && s.wagonCondition >= 80,
  },
  {
    id: "fat_purse",
    name: "Fat Purse",
    description: "Arrive in Oregon City with $500 or more in hand.",
    tier: 2,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => arrivedSafely(s) && s.cash >= 500,
  },
  {
    id: "beat_the_clock",
    name: "Beat the Clock",
    description: "Reach Oregon City before the first of October.",
    tier: 2,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => arrivedSafely(s) && s.date.month < 10,
  },
  {
    id: "road_less_traveled",
    name: "Road Less Traveled",
    description: "Take the Sublette Cutoff or raft the Columbia rapids.",
    tier: 2,
    unlockKind: "wagon_icon",
    unlockId: "🛶",
    unlockLabel: "Canoe wagon marker",
    isEarned: (s) => s.route.includes("sublette_desert") || s.route.includes("columbia_rapids"),
  },
  {
    id: "new_beginnings",
    name: "New Beginnings",
    description: "Settle down along the trail instead of finishing the journey.",
    tier: 1,
    unlockKind: "trophy",
    unlockLabel: "Bragging rights",
    isEarned: (s) => s.phase === "ending" && s.ending === "settled",
  },
  {
    id: "frontier_legend",
    name: "Frontier Legend",
    description: "Reach Oregon City with your whole party alive, wagon above 80%, and $500+ in hand.",
    tier: 2,
    unlockKind: "wagon_icon",
    unlockId: "🏆",
    unlockLabel: "Golden wagon marker",
    isEarned: (s) =>
      arrivedSafely(s) && s.party.every((c) => c.status !== "dead") && s.wagonCondition >= 80 && s.cash >= 500,
  },
];

export const ACHIEVEMENTS_BY_ID: Record<string, AchievementDef> = Object.fromEntries(
  ACHIEVEMENTS.map((a) => [a.id, a])
);
