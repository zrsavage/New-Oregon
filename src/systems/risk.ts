import type { GameState, RiskAssessment, RiskFactor, Role, TraitId } from "../types/game";
import { clamp, livingParty, partyHasRole } from "./mutators";

/** Combines a base rate with factors into a clamped, displayable assessment. */
export function assessChance(base: number, factors: RiskFactor[], frame: "success" | "danger"): RiskAssessment {
  const total = base + factors.reduce((sum, f) => sum + f.delta, 0);
  return { chance: clamp(Math.round(total), 2, 98), frame, base: Math.round(base), factors };
}

/** Rolls the outcome an assessment describes: true means the framed event happens. */
export function rollAgainst(assessment: RiskAssessment, rng: () => number): boolean {
  return rng() * 100 < assessment.chance;
}

export function factorsOf(...items: (RiskFactor | null)[]): RiskFactor[] {
  return items.filter((f): f is RiskFactor => f !== null);
}

/** A positive contribution scaled by a role-holder's skill — use for "success" framed assessments. */
export function roleFactor(state: GameState, role: Role, roleLabel: string, maxBonus: number): RiskFactor | null {
  const person = partyHasRole(state, role);
  if (!person) return null;
  const delta = Math.round((person.skillLevel / 100) * maxBonus);
  if (delta === 0) return null;
  return { label: `${person.name} the ${roleLabel} (skill ${person.skillLevel})`, delta };
}

/** A negative contribution scaled by a role-holder's skill — use for "danger" framed assessments. */
export function roleDangerReduction(state: GameState, role: Role, roleLabel: string, maxReduction: number): RiskFactor | null {
  const person = partyHasRole(state, role);
  if (!person) return null;
  const delta = -Math.round((person.skillLevel / 100) * maxReduction);
  if (delta === 0) return null;
  return { label: `${person.name} the ${roleLabel} (skill ${person.skillLevel})`, delta };
}

export function traitFactor(state: GameState, trait: TraitId, label: string, delta: number): RiskFactor | null {
  const carrier = livingParty(state).find((c) => c.traits.includes(trait));
  if (!carrier) return null;
  return { label: `${carrier.name}'s ${label}`, delta };
}
