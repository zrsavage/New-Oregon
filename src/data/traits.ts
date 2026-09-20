import type { TraitDef, TraitId } from "../types/game";

export const TRAITS: Record<TraitId, TraitDef> = {
  tough: { id: "tough", name: "Tough", description: "Recovers from illness and injury faster than most." },
  green_thumb: { id: "green_thumb", name: "Green Thumb", description: "Has a knack for foraging edible plants along the trail." },
  sharpshooter: { id: "sharpshooter", name: "Sharpshooter", description: "Rarely wastes a bullet when hunting." },
  night_owl: { id: "night_owl", name: "Night Owl", description: "Keeps watch well but tires faster on early starts." },
  frail: { id: "frail", name: "Frail", description: "Catches illness more easily than most." },
  charming: { id: "charming", name: "Charming", description: "Gets better deals when trading with other travelers." },
  penny_pincher: { id: "penny_pincher", name: "Penny Pincher", description: "Naturally thrifty, stretches cash a little further." },
  restless: { id: "restless", name: "Restless", description: "Morale drops faster during long rests." },
  steady_hands: { id: "steady_hands", name: "Steady Hands", description: "Better than most at wagon repairs." },
  unlucky: { id: "unlucky", name: "Unlucky", description: "Seems to draw more than their share of bad breaks." },
};

export const TRAIT_LIST = Object.values(TRAITS);
