import type { GameState } from "../types/game";
import { createLeader } from "./character";

export const STARTING_CASH = 1600;

export function createNewGame(leaderName: string, seed: number): GameState {
  return {
    phase: "outfitting",
    seed,
    leaderName,
    party: [createLeader(leaderName)],
    cash: STARTING_CASH,

    wagonType: "standard",
    wagonCondition: 100,
    draftAnimalType: "oxen",
    draftAnimalCount: 4,
    draftAnimalHealth: 100,

    inventory: [],

    mile: 0,
    pace: "steady",
    rations: "filling",
    date: { year: 1846, month: 4, day: 1 },
    weather: "clear",
    currentLandmarkId: "independence",
    nextLandmarkId: "kansas_river",
    route: ["independence"],
    daysTraveled: 0,
    daysRested: 0,
    milesToday: 0,

    visitedForts: [],
    pendingEvent: null,
    pendingRiverCrossing: false,
    pendingFork: false,
    pendingTrade: false,

    log: [],
    ending: null,

    hirePool: [],
  };
}
