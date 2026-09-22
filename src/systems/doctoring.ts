import type { Character, GameState } from "../types/game";
import { adjustHealth, cureAilment, gainSkill, getItemQty, livingParty, partyHasRole, pushLog, removeItem } from "./mutators";

export function sickPartyMembers(state: GameState): Character[] {
  return livingParty(state).filter((c) => c.ailment !== null);
}

export function doctoringBlockedReason(state: GameState): string | null {
  if (sickPartyMembers(state).length === 0) return "No one in the party needs treatment right now.";
  if (getItemQty(state, "medical_kit") <= 0 && getItemQty(state, "quinine") <= 0) {
    return "You have no medicine on hand.";
  }
  return null;
}

/**
 * Previously the only way to treat an ailment was to hope the right random
 * event fired. This lets the player act on a sick party member directly:
 * spend medicine, and quality from the timing mini-game (steady hands
 * measuring a dose or setting a splint) decides how much it helps — more
 * health back and more days shaved off the illness, occasionally enough to
 * clear it outright.
 */
export function resolveDoctor(draft: GameState, personId: string, quality: number): string {
  const person = draft.party.find((c) => c.id === personId);
  if (!person || person.status === "dead" || !person.ailment) {
    return "There's no one here needing treatment.";
  }

  let medicineUsed: string;
  if (getItemQty(draft, "medical_kit") > 0) {
    removeItem(draft, "medical_kit", 1);
    medicineUsed = "medical kit";
  } else if (getItemQty(draft, "quinine") > 0) {
    removeItem(draft, "quinine", 1);
    medicineUsed = "quinine";
  } else {
    return "You have no medicine on hand.";
  }

  const q = Math.max(0, Math.min(100, quality));
  const healthGain = Math.round(3 + (q / 100) * 12);
  const daysReduced = Math.round((q / 100) * 3);

  adjustHealth(person, healthGain);
  person.ailmentDaysRemaining = Math.max(0, person.ailmentDaysRemaining - daysReduced);

  const healer = partyHasRole(draft, "healer");
  if (healer) gainSkill(draft, healer, 2, "Healer");

  if (person.ailmentDaysRemaining <= 0 || person.health >= 90) {
    const ailmentName = person.ailment;
    cureAilment(person);
    pushLog(draft, `${person.name} recovers from ${ailmentName ?? "illness"} after careful treatment.`, "good");
    return `Careful use of the ${medicineUsed} pays off — ${person.name} pulls through and is back on their feet.`;
  }

  pushLog(draft, `${person.name}'s condition improves after treatment with the ${medicineUsed}.`, "good");
  return `${person.name} is looking a little better after treatment, though they're not out of the woods yet.`;
}
