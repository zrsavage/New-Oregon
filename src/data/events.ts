import type { EventDef } from "../types/game";
import { addItem, adjustHealth, adjustMorale, afflict, getItemQty, livingParty, pushLog, removeItem, skillFor } from "../systems/mutators";
import { randInt } from "../systems/rng";
import { ITEMS } from "./items";

function randomAlive(draft: Parameters<EventDef["choices"][number]["effect"]>[0], rng: () => number) {
  const alive = livingParty(draft);
  if (alive.length === 0) return null;
  return alive[Math.floor(rng() * alive.length)];
}

const STEALABLE_FOOD = ["bacon", "flour", "cornmeal", "beans", "dried_fruit", "fresh_meat"];

function stealFood(
  draft: Parameters<EventDef["choices"][number]["effect"]>[0],
  rng: () => number,
  min: number,
  max: number
): { itemName: string; amount: number } | null {
  let best: { itemId: string; qty: number } | null = null;
  for (const itemId of STEALABLE_FOOD) {
    const qty = getItemQty(draft, itemId);
    if (qty > (best?.qty ?? 0)) best = { itemId, qty };
  }
  if (!best || best.qty <= 0) return null;
  const amount = Math.min(best.qty, randInt(rng, min, max));
  removeItem(draft, best.itemId, amount);
  return { itemName: ITEMS[best.itemId].name, amount };
}

export const EVENTS: EventDef[] = [
  {
    id: "wagon_wheel_break",
    title: "A Wheel Splinters",
    category: "mechanical",
    weight: 12,
    terrains: ["hills", "mountains", "desert"],
    description: "A sickening crack echoes from the rear axle. One of the wagon wheels has splintered on the rough ground.",
    choices: [
      {
        id: "use_spare",
        label: "Fit the spare wheel",
        effect: (draft) => {
          if (removeItem(draft, "spare_wheel", 1)) {
            pushLog(draft, "You fit the spare wheel. The wagon rolls on.", "good");
            return "You mount the spare wheel and are back on the trail within the hour.";
          }
          draft.wagonCondition = Math.max(0, draft.wagonCondition - 20);
          pushLog(draft, "No spare wheel on hand — you lash together a rough repair.", "bad");
          return "Without a spare, you lash the wheel together with rope and green wood. It won't hold long.";
        },
      },
      {
        id: "repair_wainwright",
        label: "Attempt a field repair",
        requiresRole: "wainwright",
        effect: (draft, rng) => {
          const skill = skillFor(draft, "wainwright");
          if (rng() * 100 < skill + 20) {
            draft.wagonCondition = Math.min(100, draft.wagonCondition + 5);
            pushLog(draft, "Your wainwright repairs the wheel expertly.", "good");
            return "Your wainwright saws, shaves, and fits new spokes. The wheel is as good as new.";
          }
          draft.wagonCondition = Math.max(0, draft.wagonCondition - 10);
          pushLog(draft, "The field repair holds, but only barely.", "bad");
          return "The repair is shaky. It'll hold for now, but the wheel is weaker than before.";
        },
      },
      {
        id: "push_on",
        label: "Lash it together and push on",
        effect: (draft) => {
          draft.wagonCondition = Math.max(0, draft.wagonCondition - 25);
          pushLog(draft, "You push on with a badly weakened wheel.", "bad");
          return "You do what you can without proper parts. The wagon groans with every mile.";
        },
      },
    ],
  },
  {
    id: "river_current_scare",
    title: "Swift Water",
    category: "hazard",
    weight: 8,
    terrains: ["river"],
    description: "Wading out to check the ford, your scout finds the current far stronger than it looked from the bank.",
    choices: [
      {
        id: "heed_warning",
        label: "Heed the warning, look for a safer spot",
        effect: (draft) => {
          draft.milesToday = Math.max(0, draft.milesToday - 3);
          pushLog(draft, "You lose time finding a safer crossing, but stay dry.", "info");
          return "You spend the better part of a day working upstream until you find calmer water.";
        },
      },
      {
        id: "cross_anyway",
        label: "Cross anyway",
        effect: (draft, rng) => {
          if (rng() < 0.35) {
            const lost = Math.min(getItemQty(draft, "flour"), randInt(rng, 10, 40));
            removeItem(draft, "flour", lost);
            draft.wagonCondition = Math.max(0, draft.wagonCondition - 10);
            pushLog(draft, "The current nearly takes the wagon. Supplies are swept away.", "bad");
            return "Water rushes over the wagon bed. You barely keep it upright, but the river claims some of your flour.";
          }
          pushLog(draft, "A tense crossing, but you make it across.", "good");
          return "Hearts pounding, you make it to the far bank without serious loss.";
        },
      },
    ],
  },
  {
    id: "wild_game_spotted",
    title: "Game in the Distance",
    category: "wildlife",
    weight: 14,
    terrains: ["plains", "hills", "forest"],
    description: "A small herd grazes within rifle range. Fresh meat would do the party good.",
    choices: [
      {
        id: "hunt",
        label: "Send the hunter out",
        requiresItem: "bullets",
        effect: (draft, rng) => {
          if (!removeItem(draft, "bullets", 1)) {
            return "You reach for ammunition, but the box is empty.";
          }
          const skill = skillFor(draft, "hunter") + 10;
          const yieldLbs = Math.round(20 + (skill / 100) * 80 + rng() * 20);
          addItem(draft, "fresh_meat", yieldLbs);
          adjustMorale(draft, 4);
          pushLog(draft, `A successful hunt brings in ${yieldLbs} lbs of fresh meat.`, "good");
          return `The hunt succeeds — ${yieldLbs} lbs of fresh meat, and the party's spirits lift.`;
        },
      },
      {
        id: "let_pass",
        label: "Let them pass, keep moving",
        effect: () => "You decide the delay isn't worth it and keep the wagon rolling.",
      },
    ],
  },
  {
    id: "dysentery_outbreak",
    title: "Sickness in the Party",
    category: "illness",
    weight: 10,
    description: "Bad water or spoiled food has caught up with someone in your party. They're doubled over and feverish.",
    choices: [
      {
        id: "treat",
        label: "Treat with the medical kit",
        requiresItem: "medical_kit",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to fall ill.";
          if (!removeItem(draft, "medical_kit", 1)) {
            afflict(victim, "dysentery", 6);
            adjustHealth(victim, -15);
            pushLog(draft, `${victim.name} falls ill with dysentery — no medical kit on hand.`, "bad");
            return `${victim.name} falls ill, and you have nothing to treat it with.`;
          }
          const healerSkill = skillFor(draft, "healer");
          const recover = rng() * 100 < healerSkill + 40;
          if (recover) {
            adjustHealth(victim, -5);
            afflict(victim, "dysentery", 2);
            pushLog(draft, `${victim.name} is treated quickly and shakes off dysentery.`, "good");
            return `${victim.name} is dosed and rested. The illness passes quickly.`;
          }
          adjustHealth(victim, -15);
          afflict(victim, "dysentery", 5);
          pushLog(draft, `${victim.name} is sick with dysentery despite treatment.`, "bad");
          return `Despite your care, ${victim.name} is laid low for several days.`;
        },
      },
      {
        id: "rest",
        label: "Stop and rest a day",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to fall ill.";
          afflict(victim, "dysentery", 4);
          adjustHealth(victim, -10);
          draft.milesToday = 0;
          pushLog(draft, `${victim.name} rests, but sickness sets in.`, "bad");
          return `You make camp early so ${victim.name} can rest, but the sickness still takes hold.`;
        },
      },
      {
        id: "push_through",
        label: "Push on regardless",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to fall ill.";
          afflict(victim, "dysentery", 7);
          adjustHealth(victim, -20);
          pushLog(draft, `${victim.name} suffers badly, forced to travel while sick.`, "critical");
          return `You press on. ${victim.name} suffers with every jolt of the wagon.`;
        },
      },
    ],
  },
  {
    id: "broken_axle_grade",
    title: "Steep Grade",
    category: "mechanical",
    weight: 9,
    terrains: ["mountains"],
    description: "The trail drops sharply ahead. Loaded as you are, the wagon risks a snapped axle on the way down.",
    choices: [
      {
        id: "rope_down",
        label: "Rope the wagon down slowly",
        effect: (draft) => {
          draft.milesToday = Math.max(0, draft.milesToday - 4);
          pushLog(draft, "You lower the wagon carefully with ropes. Slow, but safe.", "info");
          return "Using ropes and brute effort, you lower the wagon down the grade without incident.";
        },
      },
      {
        id: "drive_down",
        label: "Drive down carefully",
        effect: (draft, rng) => {
          if (rng() < 0.3) {
            draft.wagonCondition = Math.max(0, draft.wagonCondition - 30);
            pushLog(draft, "The axle cracks under the strain of the descent.", "bad");
            return "Halfway down, the axle cracks under the load. You'll need to repair it.";
          }
          pushLog(draft, "A tense but successful descent.", "good");
          return "The team holds steady and you make it down without damage.";
        },
      },
    ],
  },
  {
    id: "friendly_travelers",
    title: "Fellow Travelers",
    category: "social",
    weight: 10,
    description: "You come across another party camped by the trail, willing to trade.",
    choices: [
      {
        id: "trade_food",
        label: "Trade tobacco for flour",
        effect: (draft) => {
          if (!removeItem(draft, "tobacco", 5)) {
            return "You don't have enough tobacco to interest them.";
          }
          addItem(draft, "flour", 30);
          pushLog(draft, "You trade tobacco for 30 lbs of flour.", "good");
          return "A fair trade — your tobacco for a good sack of flour.";
        },
      },
      {
        id: "swap_news",
        label: "Just swap news of the trail",
        effect: (draft) => {
          adjustMorale(draft, 6);
          pushLog(draft, "News from home lifts everyone's spirits.", "good");
          return "You trade stories and news of the trail ahead. It does the party good to talk with someone new.";
        },
      },
    ],
  },
  {
    id: "grass_fire",
    title: "Prairie Fire",
    category: "hazard",
    weight: 5,
    terrains: ["plains"],
    description: "Smoke on the horizon — a grass fire is spreading, driven by the wind, and it's headed your way.",
    choices: [
      {
        id: "flee",
        label: "Push the team hard to outrun it",
        effect: (draft, rng) => {
          draft.draftAnimalHealth = Math.max(0, draft.draftAnimalHealth - 8);
          if (rng() < 0.2) {
            const lost = Math.min(getItemQty(draft, "cornmeal"), 20);
            removeItem(draft, "cornmeal", lost);
            pushLog(draft, "You outrun the fire but singe some supplies.", "bad");
            return "You whip the team into a run. You outpace the flames, but not before losing some stores.";
          }
          pushLog(draft, "You outrun the fire cleanly.", "good");
          return "The team strains but pulls you clear of the flames in time.";
        },
      },
      {
        id: "backfire",
        label: "Set a backfire to burn a safe zone",
        requiresRole: "farmer",
        effect: (draft, rng) => {
          const skill = skillFor(draft, "farmer");
          if (rng() * 100 < skill + 30) {
            pushLog(draft, "A well-set backfire saves the wagon without a scramble.", "good");
            return "Your farmer knows the old trick — a controlled backfire burns a safe patch of ground just in time.";
          }
          draft.wagonCondition = Math.max(0, draft.wagonCondition - 15);
          pushLog(draft, "The backfire catches too late.", "bad");
          return "The backfire is set too late and the flames singe the wagon cover before you escape.";
        },
      },
    ],
  },
  {
    id: "lost_trail",
    title: "Lost the Trail",
    category: "hazard",
    weight: 6,
    description: "Fog or poor markings leave you unsure which way the trail continues.",
    choices: [
      {
        id: "scout_ahead",
        label: "Send the scout to find the way",
        requiresRole: "scout",
        effect: (draft) => {
          pushLog(draft, "Your scout finds the trail again quickly.", "good");
          return "Your scout rides ahead and picks up the trail markers within the hour.";
        },
      },
      {
        id: "best_guess",
        label: "Push on by best guess",
        effect: (draft) => {
          draft.milesToday = Math.max(0, draft.milesToday - 5);
          pushLog(draft, "You lose a half-day wandering before finding the trail.", "bad");
          return "You wander for hours before stumbling back onto the worn ruts of the trail.";
        },
      },
    ],
  },
  {
    id: "snakebite",
    title: "Snakebite",
    category: "illness",
    weight: 5,
    terrains: ["plains", "desert", "hills"],
    description: "While gathering firewood, someone is struck by a rattlesnake.",
    choices: [
      {
        id: "treat_bite",
        label: "Treat the wound immediately",
        requiresItem: "medical_kit",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to be bitten.";
          if (!removeItem(draft, "medical_kit", 1)) {
            afflict(victim, "snakebite", 5);
            adjustHealth(victim, -25);
            pushLog(draft, `${victim.name} is bitten with no medicine to treat it.`, "critical");
            return `${victim.name} is bitten. Without medicine, it's a rough few days.`;
          }
          adjustHealth(victim, -10);
          afflict(victim, "snakebite", 3);
          pushLog(draft, `${victim.name} is treated for a snakebite and should recover.`, "info");
          return `Quick treatment keeps ${victim.name}'s snakebite from turning serious.`;
        },
      },
      {
        id: "ignore",
        label: "Bind it and hope for the best",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to be bitten.";
          afflict(victim, "snakebite", 6);
          adjustHealth(victim, -20);
          pushLog(draft, `${victim.name} is bitten and only roughly bandaged.`, "bad");
          return `You bind the wound as best you can. ${victim.name} will need time to recover.`;
        },
      },
    ],
  },
  {
    id: "cold_snap_hits",
    title: "Sudden Cold Snap",
    category: "weather",
    weight: 7,
    terrains: ["mountains", "hills", "plains"],
    description: "Temperatures plummet overnight, catching the party off guard.",
    choices: [
      {
        id: "bundle_up",
        label: "Bundle up with winter coats",
        effect: (draft) => {
          const have = getItemQty(draft, "winter_coats");
          const alive = livingParty(draft).length;
          if (have >= alive) {
            pushLog(draft, "Everyone stays warm through the cold snap.", "good");
            return "With coats for everyone, the party weathers the cold snap comfortably.";
          }
          for (const person of livingParty(draft)) adjustHealth(person, -4);
          pushLog(draft, "Not enough coats to go around — everyone feels the chill.", "bad");
          return "There aren't enough coats to go around. Everyone shivers through the night.";
        },
      },
      {
        id: "huddle",
        label: "Huddle by the fire and endure it",
        effect: (draft, rng) => {
          for (const person of livingParty(draft)) adjustHealth(person, -8);
          if (rng() < 0.15) {
            const victim = randomAlive(draft, rng);
            if (victim) {
              afflict(victim, "hypothermia", 4);
              pushLog(draft, `${victim.name} suffers from the cold.`, "bad");
            }
          }
          return "You huddle around the fire through a miserable, bitter night.";
        },
      },
    ],
  },
  {
    id: "thief_in_the_night",
    title: "Something's Missing",
    category: "hazard",
    weight: 6,
    description: "You wake to find someone rifled through your supplies in the night.",
    choices: [
      {
        id: "post_watch",
        label: "Post a stronger watch going forward",
        effect: (draft, rng) => {
          const stolen = stealFood(draft, rng, 5, 20);
          if (!stolen) return "Whoever it was left empty-handed — you had little worth taking.";
          pushLog(draft, `Thieves made off with ${stolen.amount} lbs of ${stolen.itemName}.`, "bad");
          return `Whoever it was got away with some ${stolen.itemName.toLowerCase()}. You resolve to keep a better watch.`;
        },
      },
      {
        id: "shrug_off",
        label: "Shrug it off, count your blessings",
        effect: (draft, rng) => {
          const stolen = stealFood(draft, rng, 10, 30);
          if (!stolen) return "Whoever it was left empty-handed — you had little worth taking.";
          pushLog(draft, `Thieves made off with ${stolen.amount} lbs of ${stolen.itemName}.`, "bad");
          return "It could have been worse. You take stock and move on.";
        },
      },
    ],
  },
  {
    id: "wagon_bogged",
    title: "Bogged in the Mud",
    category: "hazard",
    weight: 8,
    terrains: ["plains", "hills", "forest"],
    description: "Recent rain has turned a low stretch of trail into thick mud, and the wagon sinks to its axles.",
    choices: [
      {
        id: "all_hands",
        label: "All hands to push and pull",
        effect: (draft) => {
          for (const person of livingParty(draft)) adjustHealth(person, -3);
          draft.milesToday = Math.max(0, draft.milesToday - 2);
          pushLog(draft, "Everyone pitches in to free the wagon from the mud.", "info");
          return "With everyone pushing, pulling, and cursing, the wagon finally lurches free.";
        },
      },
      {
        id: "unload_first",
        label: "Unload cargo first, then pull free",
        effect: (draft) => {
          draft.milesToday = Math.max(0, draft.milesToday - 4);
          pushLog(draft, "You unload the wagon to free it from the mud, costing time.", "info");
          return "You unload the heaviest crates, pull the wagon free, then reload everything by hand.";
        },
      },
    ],
  },
  {
    id: "measles_outbreak",
    title: "Fever and Rash",
    category: "illness",
    weight: 6,
    description: "A member of the party breaks out in fever and a telltale rash.",
    choices: [
      {
        id: "quarantine_rest",
        label: "Isolate and rest them",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to fall ill.";
          afflict(victim, "measles", 5);
          adjustHealth(victim, -10);
          draft.milesToday = Math.max(0, draft.milesToday - 2);
          pushLog(draft, `${victim.name} is kept isolated and resting with measles.`, "info");
          return `${victim.name} is kept warm and away from the others. It slows you down, but limits the spread.`;
        },
      },
      {
        id: "keep_moving",
        label: "Keep moving, treat as you go",
        requiresItem: "medical_kit",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to fall ill.";
          removeItem(draft, "medical_kit", 1);
          afflict(victim, "measles", 4);
          adjustHealth(victim, -15);
          pushLog(draft, `${victim.name} travels while sick with measles.`, "bad");
          return `${victim.name} rides in the wagon bed, tended to as best you can while still moving.`;
        },
      },
    ],
  },
  {
    id: "good_grazing",
    title: "Good Grazing Ground",
    category: "resource",
    weight: 10,
    terrains: ["plains", "hills"],
    description: "You come across a stretch of lush grass, ideal for the animals to graze and recover.",
    choices: [
      {
        id: "rest_animals",
        label: "Rest here half a day",
        effect: (draft) => {
          draft.draftAnimalHealth = Math.min(100, draft.draftAnimalHealth + 10);
          draft.milesToday = Math.max(0, draft.milesToday - 3);
          pushLog(draft, "The animals graze and recover strength.", "good");
          return "You let the team graze their fill. They'll pull stronger for it.";
        },
      },
      {
        id: "keep_going",
        label: "Keep moving, time is precious",
        effect: () => "You note the good grass but decide to keep moving while daylight lasts.",
      },
    ],
  },
  {
    id: "berries_and_forage",
    title: "Wild Berries",
    category: "resource",
    weight: 10,
    terrains: ["forest", "hills", "plains"],
    description: "Someone spots wild berry bushes heavy with fruit near the trail.",
    choices: [
      {
        id: "forage",
        label: "Stop to forage",
        effect: (draft, rng) => {
          const skill = skillFor(draft, "farmer");
          const amount = Math.round(5 + (skill / 100) * 15 + rng() * 10);
          addItem(draft, "dried_fruit", amount);
          adjustMorale(draft, 3);
          pushLog(draft, `Foraging brings in ${amount} lbs of fruit.`, "good");
          return `A pleasant break from the trail nets ${amount} lbs of fruit, and a boost in spirits.`;
        },
      },
      {
        id: "skip",
        label: "Not worth the delay",
        effect: () => "You leave the berries behind and press on.",
      },
    ],
  },
  {
    id: "wagon_fire",
    title: "Campfire Catches the Wagon",
    category: "hazard",
    weight: 3,
    description: "A gust of wind carries embers from the campfire onto the wagon's canvas cover.",
    choices: [
      {
        id: "douse",
        label: "Douse it immediately",
        effect: (draft, rng) => {
          if (rng() < 0.5) {
            pushLog(draft, "The fire is put out before it spreads.", "good");
            return "Quick thinking with the water barrel puts the fire out before it spreads.";
          }
          if (!removeItem(draft, "canvas", 1)) {
            draft.wagonCondition = Math.max(0, draft.wagonCondition - 15);
            pushLog(draft, "The canvas cover burns through — no spare on hand.", "bad");
            return "The cover burns through before you get it out, and you have no spare canvas.";
          }
          pushLog(draft, "The canvas is damaged but you replace it with your spare.", "info");
          return "The cover is ruined, but you patch things up with your spare canvas.";
        },
      },
    ],
  },
  {
    id: "typhoid_outbreak",
    title: "Typhoid Fever",
    category: "illness",
    weight: 4,
    description: "Contaminated water has brought typhoid fever into the party.",
    choices: [
      {
        id: "treat_typhoid",
        label: "Treat with quinine and rest",
        requiresItem: "quinine",
        effect: (draft, rng) => {
          const victim = randomAlive(draft, rng);
          if (!victim) return "There's no one left to fall ill.";
          if (!removeItem(draft, "quinine", 1)) {
            afflict(victim, "typhoid", 8);
            adjustHealth(victim, -30);
            pushLog(draft, `${victim.name} suffers severe typhoid with no quinine available.`, "critical");
            return `${victim.name} is gravely ill, and you have no quinine to help.`;
          }
          const healerSkill = skillFor(draft, "healer");
          adjustHealth(victim, -10);
          afflict(victim, "typhoid", healerSkill > 40 ? 3 : 6);
          pushLog(draft, `${victim.name} is treated for typhoid fever.`, "bad");
          return `${victim.name} is dosed with quinine. It's serious, but treatable.`;
        },
      },
    ],
  },
  {
    id: "friendly_guide_offer",
    title: "A Guide Offers Help",
    category: "social",
    weight: 6,
    description: "An experienced local offers to guide you through a difficult stretch ahead — for a price.",
    choices: [
      {
        id: "hire_guide",
        label: "Pay for the guide ($8)",
        effect: (draft) => {
          if (draft.cash < 8) return "You can't afford the guide's fee.";
          draft.cash -= 8;
          draft.wagonCondition = Math.min(100, draft.wagonCondition + 3);
          pushLog(draft, "A hired guide helps you through a tricky stretch safely.", "good");
          return "The guide's local knowledge saves you time and trouble on the trail ahead.";
        },
      },
      {
        id: "decline_guide",
        label: "Decline and go it alone",
        effect: () => "You thank them for the offer but decide to save your money.",
      },
    ],
  },
];

export const EVENTS_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
