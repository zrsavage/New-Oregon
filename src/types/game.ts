// Core domain types for the game.

export type Role =
  | "leader"
  | "scout"
  | "hunter"
  | "wainwright" // wagon/wheel repair
  | "healer"
  | "cook"
  | "teamster" // animal handling
  | "farmer"
  | "merchant";

export interface RoleDef {
  id: Role;
  name: string;
  description: string;
  // Which stat this role boosts and roughly how much (0-1 scale, applied as a skill bonus).
  primaryBonus: string;
}

export type TraitId =
  | "tough"
  | "green_thumb"
  | "sharpshooter"
  | "night_owl"
  | "frail"
  | "charming"
  | "penny_pincher"
  | "restless"
  | "steady_hands"
  | "unlucky";

export interface TraitDef {
  id: TraitId;
  name: string;
  description: string;
}

export type HealthStatus =
  | "healthy"
  | "fatigued"
  | "sick"
  | "injured"
  | "gravely_ill"
  | "dead";

export type Ailment =
  | "dysentery"
  | "cholera"
  | "typhoid"
  | "measles"
  | "broken_limb"
  | "snakebite"
  | "exhaustion"
  | "food_poisoning"
  | "hypothermia";

export interface Character {
  id: string;
  name: string;
  role: Role;
  age: number;
  isLeader: boolean;
  isFamily: boolean; // family members are unpaid but their loss hits morale harder
  wage: number; // per-week wage if hired hand, 0 for family/leader
  traits: TraitId[];
  skillLevel: number; // 0-100, proficiency in their role
  health: number; // 0-100
  status: HealthStatus;
  ailment: Ailment | null;
  ailmentDaysRemaining: number;
  morale: number; // 0-100, personal morale
  fatigue: number; // 0-100, rises with strenuous pace, drops with rest
}

export type WagonTypeId = "light" | "standard" | "heavy";

export interface WagonTypeDef {
  id: WagonTypeId;
  name: string;
  description: string;
  cost: number;
  baseCapacityLbs: number;
  baseSpeedModifier: number; // multiplier on base miles/day
  durability: number; // 0-100 starting condition ceiling
  minDraftAnimals: number;
}

export type DraftAnimalId = "oxen" | "horses" | "mules";

export interface DraftAnimalDef {
  id: DraftAnimalId;
  name: string;
  costPerHead: number;
  speedModifier: number;
  toughness: number; // resistance to illness/death, 0-100
  grazingNeed: number; // relative food/grazing requirement
}

export type ItemCategory =
  | "food"
  | "spare_part"
  | "tool"
  | "ammunition"
  | "medicine"
  | "clothing"
  | "trade_good";

export interface ItemDef {
  id: string;
  category: ItemCategory;
  name: string;
  unit: string; // "lbs", "each", "box"
  weightPerUnit: number; // lbs per unit
  basePrice: number; // dollars per unit at a typical fort
  spoilRate?: number; // fraction lost per day if food, 0 if non-perishable
  description: string;
}

export interface InventoryStack {
  itemId: string;
  quantity: number;
}

export type TerrainType =
  | "plains"
  | "hills"
  | "river"
  | "mountains"
  | "desert"
  | "forest";

export type Pace = "steady" | "strenuous" | "grueling";
export type Rations = "filling" | "meager" | "bare_bones";

export type RiverCrossingMethod = "ford" | "caulk_float" | "ferry" | "guide" | "wait";

export interface RiverCrossing {
  name: string;
  depthFt: number; // baseline depth, modified by season/rainfall
  currentSpeed: number; // 0-10 severity
  ferryCost: number;
  guideCost: number;
  hasFerry: boolean;
  hasGuide: boolean;
}

export interface TrailFork {
  id: string;
  prompt: string;
  options: {
    id: string;
    label: string;
    description: string;
    targetLandmarkId: string;
  }[];
}

export interface FortKeeper {
  name: string;
  blurb: string;
  priceModifier: number; // multiplier applied to prices at this fort, e.g. 0.92 = 8% cheaper
}

export interface Landmark {
  id: string;
  name: string;
  mileMarker: number; // cumulative miles from Independence
  hasFort: boolean;
  hasFerryTown?: boolean;
  terrain: TerrainType;
  riverCrossing?: RiverCrossing;
  fork?: TrailFork;
  notes?: string;
  keeper?: FortKeeper;
  // Explicit graph pointer to the next landmark. Undefined means "end of trail"
  // or "must be resolved via fork". Branch legs use this to merge back onto the
  // main line at a point that may not be adjacent in the display list.
  nextId?: string;
}

export type WeatherCondition =
  | "clear"
  | "rain"
  | "storm"
  | "heat_wave"
  | "cold_snap"
  | "snow"
  | "blizzard";

export interface DateState {
  year: number;
  month: number; // 1-12
  day: number; // 1-30 (simplified calendar)
}

export type GamePhase = "title" | "outfitting" | "travel" | "ending";

export type EndingReason =
  | "arrived"
  | "leader_died"
  | "party_wiped"
  | "starved_stranded"
  | "settled"
  | "practice_complete";

/** A single contribution to a risk assessment, e.g. a party member's skill or a trait. */
export interface RiskFactor {
  label: string;
  delta: number; // percentage points, positive or negative
}

/**
 * A percentage assessment of a choice's outcome, built from a base rate plus
 * party-derived factors. `frame` says which direction is "the thing being
 * measured": for "success" a higher chance is good, for "danger" a higher
 * chance is bad. The same assessment is used both to render the odds in the
 * UI and to roll the actual outcome, so displayed and real odds never drift.
 */
export interface RiskAssessment {
  chance: number; // 0-100
  frame: "success" | "danger";
  base: number;
  factors: RiskFactor[];
}

export interface EventChoiceDef {
  id: string;
  label: string;
  requiresRole?: Role;
  requiresItem?: string;
  // Party-derived odds for this choice's outcome, shown in the UI before the player commits.
  risk?: (state: GameState) => RiskAssessment;
  // Mutates the draft state directly (immer) and returns narrative outcome text.
  effect: (draft: GameState, rng: () => number) => string;
}

export interface EventDef {
  id: string;
  title: string;
  category: "illness" | "mechanical" | "wildlife" | "social" | "weather" | "resource" | "hazard";
  weight: number;
  minMile?: number;
  maxMile?: number;
  terrains?: TerrainType[];
  description: string;
  choices: EventChoiceDef[];
}

export interface LogEntry {
  id: string;
  date: DateState;
  mile: number;
  text: string;
  tone: "info" | "good" | "bad" | "critical";
}

export interface GameState {
  phase: GamePhase;
  seed: number;

  // Party & leader
  leaderName: string;
  party: Character[];
  cash: number;

  // Wagon
  wagonType: WagonTypeId;
  wagonCondition: number; // 0-100
  draftAnimalType: DraftAnimalId;
  draftAnimalCount: number;
  draftAnimalHealth: number; // 0-100 average

  // Inventory
  inventory: InventoryStack[];

  // Travel
  mile: number;
  pace: Pace;
  rations: Rations;
  date: DateState;
  weather: WeatherCondition;
  currentLandmarkId: string;
  nextLandmarkId: string | null;
  route: string[]; // ordered landmark ids chosen so far (accounts for forks)
  daysTraveled: number;
  daysRested: number;
  milesToday: number;

  // Flags/progress
  visitedForts: string[];
  pendingEvent: string | null; // event definition id awaiting player resolution
  pendingRiverCrossing: boolean;
  pendingFork: boolean;
  pendingTrade: boolean;
  pendingHunt: boolean;

  log: LogEntry[];
  ending: EndingReason | null;

  // Outfitting-only scratch data (irrelevant once travel begins).
  hirePool: Character[];

  // Achievements earned so far THIS run (see state/achievementsStore.ts for
  // the cross-run persisted set).
  runAchievements: string[];
  // River crossings completed with no loss of wagon condition or supplies.
  cleanRiverCrossings: number;

  // A short, low-stakes trial run: generous cash, eased odds, a shorter
  // trail target, and no permanent achievement unlocks.
  isPractice: boolean;
}
