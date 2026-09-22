import type { GameState, TerrainType } from "../types/game";
import { WAGON_TYPES, DRAFT_ANIMALS } from "../data/wagonsAndAnimals";
import { TRAIL, TOTAL_TRAIL_MILES } from "../data/trail";
import { PACE_TABLE, RATIONS_TABLE } from "./travel";

const TERRAIN_SPEED_MOD: Record<TerrainType, number> = {
  plains: 1.0,
  hills: 0.9,
  river: 0.7,
  mountains: 0.6,
  desert: 0.85,
  forest: 0.85,
};

/** Mile-weighted average terrain slowdown across the actual trail data, not a guess. */
function averageTerrainSpeedMod(): number {
  const sorted = [...TRAIL].sort((a, b) => a.mileMarker - b.mileMarker);
  let weighted = 0;
  let total = 0;
  for (let i = 0; i < sorted.length - 1; i++) {
    const dist = sorted[i + 1].mileMarker - sorted[i].mileMarker;
    weighted += TERRAIN_SPEED_MOD[sorted[i + 1].terrain] * dist;
    total += dist;
  }
  return total > 0 ? weighted / total : 1;
}

const AVERAGE_TERRAIN_MOD = averageTerrainSpeedMod();
// Most days are clear, but rain/storms/snow knock the average down a bit.
const AVERAGE_WEATHER_MOD = 0.93;

/** A rough trip-length estimate at a steady pace, given the player's current wagon/team choice. */
export function estimateTripDays(state: GameState): number {
  const wagonMod = WAGON_TYPES[state.wagonType].baseSpeedModifier;
  const animalMod = DRAFT_ANIMALS[state.draftAnimalType].speedModifier;
  const estMilesPerDay = PACE_TABLE.steady.baseMiles * wagonMod * animalMod * AVERAGE_TERRAIN_MOD * AVERAGE_WEATHER_MOD;
  return Math.ceil(TOTAL_TRAIL_MILES / Math.max(1, estMilesPerDay));
}

// A practical amount to actually carry at once — enough for a couple of
// months, topped up at forts and stretched by hunting/foraging along the
// way. Carrying enough for the *entire* trip up front is neither expected
// nor, for a slow wagon, even physically possible to fit in the wagon.
const STARTER_DAYS_COVERAGE = 75;

export interface ProvisionEstimate {
  days: number;
  starterDaysCovered: number;
  partySize: number;
  starterFoodPerPersonLbs: number;
  starterFoodTotalLbs: number;
  fullTripFoodPerPersonLbs: number;
  fullTripFoodTotalLbs: number;
}

export function estimateProvisions(state: GameState): ProvisionEstimate {
  const days = estimateTripDays(state);
  const starterDaysCovered = Math.min(days, STARTER_DAYS_COVERAGE);
  const partySize = Math.max(1, state.party.length);
  const perPersonPerDay = RATIONS_TABLE.filling.lbsPerPerson;
  const starterFoodPerPersonLbs = Math.round(starterDaysCovered * perPersonPerDay);
  const fullTripFoodPerPersonLbs = Math.round(days * perPersonPerDay);
  return {
    days,
    starterDaysCovered,
    partySize,
    starterFoodPerPersonLbs,
    starterFoodTotalLbs: starterFoodPerPersonLbs * partySize,
    fullTripFoodPerPersonLbs,
    fullTripFoodTotalLbs: fullTripFoodPerPersonLbs * partySize,
  };
}
