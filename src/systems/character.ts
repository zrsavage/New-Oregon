import type { Character, Role, TraitId } from "../types/game";
import { randomName } from "../data/names";
import { pick, randInt } from "./rng";
import { nanoid } from "nanoid";

const ROLE_WAGE: Record<Role, number> = {
  leader: 0,
  scout: 6,
  hunter: 5,
  wainwright: 6,
  healer: 7,
  cook: 4,
  teamster: 5,
  farmer: 4,
  merchant: 5,
};

export function createLeader(name: string): Character {
  return {
    id: nanoid(8),
    name,
    role: "leader",
    age: 32,
    isLeader: true,
    isFamily: true,
    wage: 0,
    traits: [],
    skillLevel: 40,
    health: 100,
    status: "healthy",
    ailment: null,
    ailmentDaysRemaining: 0,
    morale: 80,
    fatigue: 0,
  };
}

export function createFamilyMember(name: string, role: Role, age: number): Character {
  return {
    id: nanoid(8),
    name,
    role,
    age,
    isLeader: false,
    isFamily: true,
    wage: 0,
    traits: [],
    skillLevel: randInt(() => Math.random(), 15, 35),
    health: 100,
    status: "healthy",
    ailment: null,
    ailmentDaysRemaining: 0,
    morale: 75,
    fatigue: 0,
  };
}

const ALL_TRAITS: TraitId[] = [
  "tough", "green_thumb", "sharpshooter", "night_owl", "frail",
  "charming", "penny_pincher", "restless", "steady_hands", "unlucky",
];

export function generateHireCandidate(rng: () => number, role: Role): Character {
  const age = randInt(rng, 18, 55);
  const skillLevel = randInt(rng, 35, 85);
  const traitCount = rng() < 0.6 ? 1 : 2;
  const traits: TraitId[] = [];
  const pool = [...ALL_TRAITS];
  for (let i = 0; i < traitCount; i++) {
    if (pool.length === 0) break;
    const idx = Math.floor(rng() * pool.length);
    traits.push(pool.splice(idx, 1)[0]);
  }
  const wage = ROLE_WAGE[role] + Math.round((skillLevel - 50) / 10);
  return {
    id: nanoid(8),
    name: randomName(rng),
    role,
    age,
    isLeader: false,
    isFamily: false,
    wage: Math.max(2, wage),
    traits,
    skillLevel,
    health: 100,
    status: "healthy",
    ailment: null,
    ailmentDaysRemaining: 0,
    morale: 65,
    fatigue: 0,
  };
}

export function generateHirePool(rng: () => number, count: number): Character[] {
  const roles: Role[] = ["scout", "hunter", "wainwright", "healer", "cook", "teamster", "farmer", "merchant"];
  const pool: Character[] = [];
  for (let i = 0; i < count; i++) {
    pool.push(generateHireCandidate(rng, pick(rng, roles)));
  }
  return pool;
}
