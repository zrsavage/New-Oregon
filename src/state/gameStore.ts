import { create } from "zustand";
import { persist } from "zustand/middleware";
import { produce } from "immer";
import type {
  Character,
  DraftAnimalId,
  GameState,
  Pace,
  Rations,
  RiverCrossingMethod,
  WagonTypeId,
} from "../types/game";
import { createNewGame, STARTING_CASH } from "../systems/init";
import { mulberry32 } from "../systems/rng";
import { generateHirePool } from "../systems/character";
import { TRAIL_BY_ID } from "../data/trail";
import { WAGON_TYPES, DRAFT_ANIMALS } from "../data/wagonsAndAnimals";
import { buyItem, sellItem, payWeeklyWages, outfittingCost } from "../systems/economy";
import { computeDailyMiles, tickDay, wagonCapacity } from "../systems/travel";
import { maybeTriggerEvent, resolveEventChoice } from "../systems/eventEngine";
import { arriveAtLandmark, checkEnding } from "../systems/progress";
import { attemptCrossing } from "../systems/river";
import { clamp, livingParty, pushLog, totalWeight } from "../systems/mutators";

let rng = mulberry32(Date.now() % 2147483647);

interface StoreExtra {
  lastEventNarrative: string | null;
  lastCrossingNarrative: string | null;
}

interface StoreActions {
  startNewGame: (leaderName: string) => void;
  resetToTitle: () => void;

  setWagonType: (id: WagonTypeId) => void;
  setDraftAnimalType: (id: DraftAnimalId) => void;
  setDraftAnimalCount: (n: number) => void;
  refreshHirePool: () => void;
  hireCandidate: (id: string) => void;
  dismissPartyMember: (id: string) => void;
  buyOutfitItem: (itemId: string, qty: number) => void;
  sellOutfitItem: (itemId: string, qty: number) => void;
  finishOutfitting: () => void;

  setPace: (p: Pace) => void;
  setRations: (r: Rations) => void;
  travelDay: (days?: number) => void;
  restDay: (days?: number) => void;

  resolveEvent: (choiceId: string) => void;
  resolveFork: (optionId: string) => void;
  resolveRiverCrossing: (method: RiverCrossingMethod) => void;

  openTrade: () => void;
  closeTrade: () => void;
  tradeBuy: (itemId: string, qty: number) => void;
  tradeSell: (itemId: string, qty: number) => void;
  repairWagon: () => void;

  clearNarratives: () => void;
}

export type Store = GameState & StoreExtra & StoreActions;

function fresh(leaderName: string): GameState {
  const seed = Math.floor(Math.random() * 2147483647);
  rng = mulberry32(seed);
  return createNewGame(leaderName, seed);
}

/** Applies an immer recipe to the GameState slice of the store and commits it in one set() call. */
function mutate(
  set: (partial: Partial<Store>) => void,
  get: () => Store,
  recipe: (draft: GameState) => void
): GameState {
  const current = get();
  const next = produce<GameState>(current, recipe);
  set(next);
  return next;
}

export const useGameStore = create<Store>()(
  persist(
    (set, get) => ({
      ...fresh("Traveler"),
      phase: "title",
      lastEventNarrative: null,
      lastCrossingNarrative: null,

      startNewGame: (leaderName) => {
        set({ ...fresh(leaderName), phase: "outfitting" });
        get().refreshHirePool();
      },

      resetToTitle: () => {
        set({ ...fresh("Traveler"), phase: "title" });
      },

      setWagonType: (id) =>
        mutate(set, get, (d) => {
          d.wagonType = id;
          const minAnimals = WAGON_TYPES[id].minDraftAnimals;
          if (d.draftAnimalCount < minAnimals) d.draftAnimalCount = minAnimals;
        }),

      setDraftAnimalType: (id) => mutate(set, get, (d) => { d.draftAnimalType = id; }),

      setDraftAnimalCount: (n) =>
        mutate(set, get, (d) => {
          const min = WAGON_TYPES[d.wagonType].minDraftAnimals;
          d.draftAnimalCount = clamp(n, min, 12);
        }),

      refreshHirePool: () =>
        mutate(set, get, (d) => {
          d.hirePool = generateHirePool(rng, 6);
        }),

      hireCandidate: (id) =>
        mutate(set, get, (d) => {
          const candidate = d.hirePool.find((c) => c.id === id);
          if (!candidate) return;
          d.party.push(candidate);
          d.hirePool = d.hirePool.filter((c) => c.id !== id);
          pushLog(d, `${candidate.name} joins the party as ${candidate.role}.`, "good");
        }),

      dismissPartyMember: (id) =>
        mutate(set, get, (d) => {
          const member = d.party.find((c) => c.id === id);
          if (!member || member.isLeader) return;
          d.party = d.party.filter((c) => c.id !== id);
        }),

      buyOutfitItem: (itemId, qty) => mutate(set, get, (d) => { buyItem(d, itemId, qty); }),
      sellOutfitItem: (itemId, qty) => mutate(set, get, (d) => { sellItem(d, itemId, qty); }),

      finishOutfitting: () =>
        mutate(set, get, (d) => {
          const cost = outfittingCost(d);
          if (d.cash < cost.total) return;
          d.cash -= cost.total;
          d.wagonCondition = WAGON_TYPES[d.wagonType].durability;
          d.draftAnimalHealth = 100;
          d.phase = "travel";
          pushLog(d, `The journey begins! ${d.party.length} souls set out from Independence.`, "good");
        }),

      setPace: (p) => mutate(set, get, (d) => { d.pace = p; }),
      setRations: (r) => mutate(set, get, (d) => { d.rations = r; }),

      travelDay: (days = 1) => {
        for (let i = 0; i < days; i++) {
          const s = get();
          if (s.phase !== "travel" || s.pendingEvent || s.pendingFork || s.pendingRiverCrossing || s.pendingTrade) {
            return;
          }

          const next = mutate(set, get, (d) => {
            tickDay(d, rng);
            if (d.daysTraveled % 7 === 0) payWeeklyWages(d);
            checkEnding(d);
            if (d.ending) return;

            let milesRemaining = computeDailyMiles(d);
            d.milesToday = 0;

            while (milesRemaining > 0) {
              const nextId = d.nextLandmarkId;
              if (!nextId) break;
              const landmark = TRAIL_BY_ID[nextId];
              if (!landmark) break;
              const distance = landmark.mileMarker - d.mile;
              if (distance <= milesRemaining) {
                d.mile = landmark.mileMarker;
                d.milesToday += distance;
                milesRemaining -= distance;
                arriveAtLandmark(d, landmark);
                checkEnding(d);
                if (d.ending || d.pendingFork || d.pendingRiverCrossing) break;
              } else {
                d.mile += milesRemaining;
                d.milesToday += milesRemaining;
                milesRemaining = 0;
              }
            }

            if (!d.ending && !d.pendingFork && !d.pendingRiverCrossing) {
              const eventId = maybeTriggerEvent(d, rng);
              if (eventId) d.pendingEvent = eventId;
            }
          });

          if (next.pendingEvent || next.pendingFork || next.pendingRiverCrossing || next.ending) {
            return;
          }
        }
      },

      restDay: (days = 1) => {
        for (let i = 0; i < days; i++) {
          const s = get();
          if (s.phase !== "travel" || s.pendingEvent || s.pendingFork || s.pendingRiverCrossing || s.pendingTrade) {
            return;
          }
          const next = mutate(set, get, (d) => {
            tickDay(d, rng, { resting: true });
            d.milesToday = 0;
            d.daysRested += 1;
            if (d.daysTraveled % 7 === 0) payWeeklyWages(d);
            checkEnding(d);
          });
          if (next.ending) return;
        }
      },

      resolveEvent: (choiceId) => {
        const s = get();
        if (!s.pendingEvent) return;
        let narrative = "";
        mutate(set, get, (d) => {
          narrative = resolveEventChoice(d, s.pendingEvent!, choiceId, rng);
          d.pendingEvent = null;
          checkEnding(d);
        });
        set({ lastEventNarrative: narrative });
      },

      resolveFork: (optionId) =>
        mutate(set, get, (d) => {
          const landmark = TRAIL_BY_ID[d.currentLandmarkId];
          const option = landmark?.fork?.options.find((o) => o.id === optionId);
          if (!option) return;
          d.pendingFork = false;
          d.nextLandmarkId = option.targetLandmarkId;
          pushLog(d, `You choose: ${option.label}.`, "info");
        }),

      resolveRiverCrossing: (method) => {
        let narrative = "";
        mutate(set, get, (d) => {
          const landmark = TRAIL_BY_ID[d.currentLandmarkId];
          if (!landmark?.riverCrossing) return;
          const result = attemptCrossing(d, landmark.riverCrossing, method, rng);
          narrative = result.narrative;
          if (method === "wait") {
            tickDay(d, rng, { resting: true });
            checkEnding(d);
            return;
          }
          if (result.success) d.pendingRiverCrossing = false;
          checkEnding(d);
        });
        set({ lastCrossingNarrative: narrative });
      },

      openTrade: () =>
        mutate(set, get, (d) => {
          const landmark = TRAIL_BY_ID[d.currentLandmarkId];
          if (landmark?.hasFort) d.pendingTrade = true;
        }),
      closeTrade: () => mutate(set, get, (d) => { d.pendingTrade = false; }),
      tradeBuy: (itemId, qty) => mutate(set, get, (d) => { buyItem(d, itemId, qty); }),
      tradeSell: (itemId, qty) => mutate(set, get, (d) => { sellItem(d, itemId, qty); }),

      repairWagon: () =>
        mutate(set, get, (d) => {
          const landmark = TRAIL_BY_ID[d.currentLandmarkId];
          if (!landmark?.hasFort) return;
          const missing = 100 - d.wagonCondition;
          if (missing <= 0) return;
          const cost = Math.round(missing * 0.6 * 100) / 100;
          if (d.cash < cost) return;
          d.cash -= cost;
          d.wagonCondition = 100;
          pushLog(d, `Paid $${cost.toFixed(2)} to repair the wagon at ${landmark.name}.`, "good");
        }),

      clearNarratives: () => set({ lastEventNarrative: null, lastCrossingNarrative: null }),
    }),
    {
      name: "new-oregon-save",
      version: 1,
    }
  )
);

// Selectors / derived helpers usable outside React components.
export function selectTotalWeight(state: GameState): number {
  return totalWeight(state);
}
export function selectCapacity(state: GameState): number {
  return wagonCapacity(state);
}
export function selectLivingParty(state: GameState): Character[] {
  return livingParty(state);
}
export const START_CASH = STARTING_CASH;
export const ALL_WAGON_TYPES = Object.values(WAGON_TYPES);
export const ALL_DRAFT_ANIMALS = Object.values(DRAFT_ANIMALS);
export { outfittingCost };
