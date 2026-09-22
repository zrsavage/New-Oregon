import type { WagonTypeDef, DraftAnimalDef, WagonTypeId, DraftAnimalId } from "../types/game";

export const WAGON_TYPES: Record<WagonTypeId, WagonTypeDef> = {
  light: {
    id: "light",
    name: "Light Spring Wagon",
    description: "Fast and cheap, but cramped. Good for a small, quick-moving party willing to travel light.",
    cost: 60,
    baseCapacityLbs: 1200,
    baseSpeedModifier: 1.15,
    durability: 80,
    minDraftAnimals: 2,
  },
  standard: {
    id: "standard",
    name: "Standard Farm Wagon",
    description: "The workhorse of the trail. Balanced capacity and speed, forgiving of mistakes.",
    cost: 100,
    baseCapacityLbs: 2000,
    baseSpeedModifier: 1.0,
    durability: 100,
    minDraftAnimals: 4,
  },
  heavy: {
    id: "heavy",
    name: "Heavy Freight Wagon",
    description: "Hauls a mountain of supplies but wears out animals faster and moves slowly.",
    cost: 150,
    baseCapacityLbs: 3200,
    baseSpeedModifier: 0.82,
    durability: 100,
    minDraftAnimals: 6,
  },
};

export const DRAFT_ANIMALS: Record<DraftAnimalId, DraftAnimalDef> = {
  oxen: {
    id: "oxen",
    name: "Oxen",
    costPerHead: 20,
    speedModifier: 0.95,
    toughness: 85,
    grazingNeed: 1.0,
  },
  horses: {
    id: "horses",
    name: "Horses",
    costPerHead: 35,
    speedModifier: 1.2,
    toughness: 55,
    grazingNeed: 1.3,
  },
  mules: {
    id: "mules",
    name: "Mules",
    costPerHead: 28,
    speedModifier: 1.05,
    toughness: 70,
    grazingNeed: 0.9,
  },
};
