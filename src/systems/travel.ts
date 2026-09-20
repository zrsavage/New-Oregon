import type { DateState, GameState, Pace, Rations, TerrainType, WeatherCondition } from "../types/game";
import { WAGON_TYPES, DRAFT_ANIMALS } from "../data/wagonsAndAnimals";
import { TRAIL_BY_ID } from "../data/trail";
import {
  adjustHealth,
  clamp,
  cureAilment,
  getItemQty,
  livingParty,
  pushLog,
  removeItem,
  skillFor,
  totalWeight,
} from "./mutators";
import { ITEMS } from "../data/items";

export const PACE_TABLE: Record<Pace, { baseMiles: number; fatigueCost: number; wearMultiplier: number }> = {
  steady: { baseMiles: 15, fatigueCost: 3, wearMultiplier: 1.0 },
  strenuous: { baseMiles: 20, fatigueCost: 7, wearMultiplier: 1.4 },
  grueling: { baseMiles: 25, fatigueCost: 14, wearMultiplier: 2.0 },
};

export const RATIONS_TABLE: Record<Rations, { lbsPerPerson: number; healthDelta: number }> = {
  filling: { lbsPerPerson: 3, healthDelta: 1 },
  meager: { lbsPerPerson: 2, healthDelta: -1 },
  bare_bones: { lbsPerPerson: 1, healthDelta: -3 },
};

const TERRAIN_SPEED_MOD: Record<TerrainType, number> = {
  plains: 1.0,
  hills: 0.9,
  river: 0.7,
  mountains: 0.6,
  desert: 0.85,
  forest: 0.85,
};

const TERRAIN_WEAR: Record<TerrainType, number> = {
  plains: 0.3,
  hills: 0.6,
  river: 0.2,
  mountains: 1.2,
  desert: 0.7,
  forest: 0.5,
};

const WEATHER_SPEED_MOD: Record<WeatherCondition, number> = {
  clear: 1.0,
  rain: 0.85,
  storm: 0.6,
  heat_wave: 0.85,
  cold_snap: 0.9,
  snow: 0.6,
  blizzard: 0.25,
};

const WEATHER_HEALTH_DELTA: Record<WeatherCondition, number> = {
  clear: 0,
  rain: -1,
  storm: -2,
  heat_wave: -2,
  cold_snap: -1,
  snow: -3,
  blizzard: -6,
};

const FOOD_PRIORITY = ["fresh_meat", "bacon", "cornmeal", "beans", "flour", "dried_fruit", "sugar"];

export function currentTerrain(state: GameState): TerrainType {
  return TRAIL_BY_ID[state.currentLandmarkId]?.terrain ?? "plains";
}

export function wagonCapacity(state: GameState): number {
  return WAGON_TYPES[state.wagonType].baseCapacityLbs;
}

export function isOverloaded(state: GameState): boolean {
  return totalWeight(state) > wagonCapacity(state);
}

export function computeDailyMiles(state: GameState): number {
  const terrain = currentTerrain(state);
  const wagonDef = WAGON_TYPES[state.wagonType];
  const animalDef = DRAFT_ANIMALS[state.draftAnimalType];
  const pace = PACE_TABLE[state.pace];

  let miles = pace.baseMiles;
  miles *= wagonDef.baseSpeedModifier;
  miles *= animalDef.speedModifier;
  miles *= TERRAIN_SPEED_MOD[terrain];
  miles *= WEATHER_SPEED_MOD[state.weather];
  miles *= clamp(state.draftAnimalHealth / 100, 0.25, 1.15);
  miles *= clamp(state.wagonCondition / 100, 0.3, 1.1);

  const teamsterSkill = skillFor(state, "teamster");
  miles *= 1 + teamsterSkill / 400; // up to +25%

  if (isOverloaded(state)) {
    const overage = totalWeight(state) / wagonCapacity(state);
    miles /= overage;
  }

  return Math.max(2, Math.round(miles));
}

export function rollWeather(state: GameState, rng: () => number): WeatherCondition {
  const terrain = currentTerrain(state);
  const month = state.date.month; // 1-12
  const winter = month === 12 || month <= 2;
  const lateFall = month === 10 || month === 11;
  const summer = month >= 6 && month <= 8;

  const roll = rng();

  if (terrain === "mountains" && winter) {
    if (roll < 0.15) return "blizzard";
    if (roll < 0.4) return "snow";
    if (roll < 0.55) return "cold_snap";
  }
  if (terrain === "mountains" && lateFall) {
    if (roll < 0.1) return "snow";
    if (roll < 0.25) return "cold_snap";
  }
  if (terrain === "desert" && summer) {
    if (roll < 0.3) return "heat_wave";
  }
  if (winter) {
    if (roll < 0.1) return "cold_snap";
  }
  if (roll < 0.08) return "storm";
  if (roll < 0.22) return "rain";
  return "clear";
}

export function advanceCalendar(date: DateState, days: number): DateState {
  let { year, month, day } = date;
  day += days;
  while (day > 30) {
    day -= 30;
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return { year, month, day };
}

function consumeFood(draft: GameState) {
  const alive = livingParty(draft);
  const rationsInfo = RATIONS_TABLE[draft.rations];
  const cookSkill = skillFor(draft, "cook");
  const efficiency = 1 - cookSkill / 300; // up to ~28% less food used
  let needed = alive.length * rationsInfo.lbsPerPerson * efficiency;

  for (const itemId of FOOD_PRIORITY) {
    if (needed <= 0) break;
    const have = getItemQty(draft, itemId);
    const used = Math.min(have, needed);
    if (used > 0) {
      removeItem(draft, itemId, used);
      needed -= used;
    }
  }

  if (needed > 0.01) {
    // Starvation: not enough food to go around.
    for (const person of alive) adjustHealth(person, -8);
    pushLog(draft, "Food runs short. The party goes hungry.", "bad");
  } else {
    for (const person of alive) adjustHealth(person, rationsInfo.healthDelta);
  }
}

function applySpoilage(draft: GameState) {
  const cookSkill = skillFor(draft, "cook");
  const spoilResist = 1 - cookSkill / 250;
  const rainy = draft.weather === "rain" || draft.weather === "storm";
  const hot = draft.weather === "heat_wave";
  for (const stack of draft.inventory) {
    const def = ITEMS[stack.itemId];
    if (!def || !def.spoilRate) continue;
    let rate = def.spoilRate * spoilResist;
    if (rainy) rate *= 1.4;
    if (hot) rate *= 1.6;
    stack.quantity = Math.max(0, stack.quantity * (1 - rate));
  }
  draft.inventory = draft.inventory.filter((s) => s.quantity > 0.5);
}

function progressAilments(draft: GameState, rng: () => number) {
  const healerSkill = skillFor(draft, "healer");
  for (const person of draft.party) {
    if (person.status === "dead" || !person.ailment) continue;
    adjustHealth(person, -3);
    person.ailmentDaysRemaining -= 1;
    if (person.health <= 0) {
      pushLog(draft, `${person.name} has died of ${person.ailment ?? "illness"}.`, "critical");
      continue;
    }
    if (person.ailmentDaysRemaining <= 0) {
      const recoverChance = 0.5 + healerSkill / 200;
      if (rng() < recoverChance) {
        cureAilment(person);
        pushLog(draft, `${person.name} has recovered.`, "good");
      } else {
        person.ailmentDaysRemaining = 3;
        pushLog(draft, `${person.name}'s condition lingers.`, "bad");
      }
    }
  }
}

function updateFatigueAndAnimals(draft: GameState, resting: boolean) {
  const terrain = currentTerrain(draft);

  if (resting) {
    for (const person of livingParty(draft)) {
      person.fatigue = clamp(person.fatigue - 15, 0, 100);
    }
    const grazingQuality = terrain === "plains" || terrain === "hills" ? 4 : terrain === "desert" ? -1 : 2;
    draft.draftAnimalHealth = clamp(draft.draftAnimalHealth + grazingQuality, 0, 100);
    return;
  }

  const paceInfo = PACE_TABLE[draft.pace];
  for (const person of livingParty(draft)) {
    person.fatigue = clamp(person.fatigue + paceInfo.fatigueCost - 4, 0, 100);
    if (person.fatigue > 80) adjustHealth(person, -2);
  }

  const grazingQuality = terrain === "plains" || terrain === "hills" ? 1 : terrain === "desert" ? -2 : 0.3;
  const animalWear = paceInfo.wearMultiplier * (terrain === "mountains" ? 1.5 : 1);
  draft.draftAnimalHealth = clamp(draft.draftAnimalHealth - animalWear + grazingQuality, 0, 100);

  const wagonWear = TERRAIN_WEAR[terrain] * paceInfo.wearMultiplier * (isOverloaded(draft) ? 1.6 : 1);
  draft.wagonCondition = clamp(draft.wagonCondition - wagonWear, 0, 100);
}

/** Advances one full day: consumption, spoilage, health/fatigue drift, weather, calendar. */
export function tickDay(draft: GameState, rng: () => number, opts: { resting?: boolean } = {}) {
  draft.weather = rollWeather(draft, rng);
  consumeFood(draft);
  applySpoilage(draft);
  progressAilments(draft, rng);
  updateFatigueAndAnimals(draft, opts.resting ?? false);

  const weatherDelta = WEATHER_HEALTH_DELTA[draft.weather];
  if (weatherDelta !== 0) {
    for (const person of livingParty(draft)) adjustHealth(person, weatherDelta);
  }

  draft.date = advanceCalendar(draft.date, 1);
  draft.daysTraveled += 1;
}
