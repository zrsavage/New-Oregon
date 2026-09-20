import type { ItemDef } from "../types/game";

export const ITEMS: Record<string, ItemDef> = {
  // Food
  flour: { id: "flour", category: "food", name: "Flour", unit: "lbs", weightPerUnit: 1, basePrice: 0.08, spoilRate: 0.002, description: "The staple of trail baking. Keeps reasonably well if kept dry." },
  bacon: { id: "bacon", category: "food", name: "Salt Pork & Bacon", unit: "lbs", weightPerUnit: 1, basePrice: 0.1, spoilRate: 0.004, description: "Smoked and salted meat. A dense source of calories for hard travel." },
  cornmeal: { id: "cornmeal", category: "food", name: "Cornmeal", unit: "lbs", weightPerUnit: 1, basePrice: 0.06, spoilRate: 0.003, description: "Cheap and filling, but spoils faster than flour in the wet." },
  coffee: { id: "coffee", category: "food", name: "Coffee", unit: "lbs", weightPerUnit: 1, basePrice: 0.2, spoilRate: 0.0005, description: "A morale booster on cold mornings." },
  sugar: { id: "sugar", category: "food", name: "Sugar", unit: "lbs", weightPerUnit: 1, basePrice: 0.12, spoilRate: 0.0005, description: "Sweetens the trail diet, keeps almost indefinitely." },
  beans: { id: "beans", category: "food", name: "Dried Beans", unit: "lbs", weightPerUnit: 1, basePrice: 0.05, spoilRate: 0.001, description: "Cheap protein that keeps well dry." },
  dried_fruit: { id: "dried_fruit", category: "food", name: "Dried Fruit", unit: "lbs", weightPerUnit: 1, basePrice: 0.18, spoilRate: 0.003, description: "Helps ward off scurvy on the long haul." },
  fresh_meat: { id: "fresh_meat", category: "food", name: "Fresh Meat", unit: "lbs", weightPerUnit: 1, basePrice: 0, spoilRate: 0.15, description: "Game meat from a successful hunt. Spoils quickly if not eaten soon." },

  // Spare parts
  spare_wheel: { id: "spare_wheel", category: "spare_part", name: "Spare Wagon Wheel", unit: "each", weightPerUnit: 60, basePrice: 10, description: "A replacement wheel for when one splinters on rough ground." },
  spare_axle: { id: "spare_axle", category: "spare_part", name: "Spare Axle", unit: "each", weightPerUnit: 40, basePrice: 8, description: "Axles snap on rocky descents more often than travelers expect." },
  spare_tongue: { id: "spare_tongue", category: "spare_part", name: "Spare Wagon Tongue", unit: "each", weightPerUnit: 25, basePrice: 6, description: "The pole connecting the wagon to the team. Cheap insurance." },
  canvas: { id: "canvas", category: "spare_part", name: "Spare Canvas", unit: "each", weightPerUnit: 15, basePrice: 5, description: "Patches or replaces a torn wagon cover." },

  // Tools
  axe: { id: "axe", category: "tool", name: "Axe", unit: "each", weightPerUnit: 6, basePrice: 2, description: "For firewood, repairs, and clearing brush." },
  shovel: { id: "shovel", category: "tool", name: "Shovel", unit: "each", weightPerUnit: 5, basePrice: 1.5, description: "Digging, mud, and graves — you'll need it for at least one." },
  rope: { id: "rope", category: "tool", name: "Rope", unit: "lbs", weightPerUnit: 1, basePrice: 0.3, description: "Essential for river crossings and lowering the wagon down grades." },
  grease_bucket: { id: "grease_bucket", category: "tool", name: "Grease Bucket", unit: "each", weightPerUnit: 8, basePrice: 1, description: "Keeps the axles turning smoothly, slows wagon wear." },
  water_barrel: { id: "water_barrel", category: "tool", name: "Water Barrel", unit: "each", weightPerUnit: 30, basePrice: 4, description: "Extra water storage, critical for the desert stretches." },

  // Ammunition
  bullets: { id: "bullets", category: "ammunition", name: "Bullets", unit: "box", weightPerUnit: 2, basePrice: 1.5, description: "Needed for hunting and defense." },
  rifle: { id: "rifle", category: "ammunition", name: "Rifle", unit: "each", weightPerUnit: 10, basePrice: 20, description: "You'll need at least one to hunt or defend the party." },

  // Medicine
  medical_kit: { id: "medical_kit", category: "medicine", name: "Medical Kit", unit: "each", weightPerUnit: 5, basePrice: 8, description: "Bandages, splints, and basic remedies." },
  quinine: { id: "quinine", category: "medicine", name: "Quinine", unit: "box", weightPerUnit: 1, basePrice: 3, description: "Treats fevers. Worth its weight when sickness strikes." },

  // Clothing
  winter_coats: { id: "winter_coats", category: "clothing", name: "Winter Coats", unit: "each", weightPerUnit: 4, basePrice: 3, description: "Protects against cold snaps and mountain weather." },
  boots: { id: "boots", category: "clothing", name: "Sturdy Boots", unit: "pair", weightPerUnit: 3, basePrice: 2.5, description: "Worn boots mean blisters and worse on the long walk." },

  // Trade goods
  tobacco: { id: "tobacco", category: "trade_good", name: "Tobacco", unit: "lbs", weightPerUnit: 1, basePrice: 0.4, description: "Valuable for bartering with other travelers and at trading posts." },
  cloth_bolts: { id: "cloth_bolts", category: "trade_good", name: "Bolts of Cloth", unit: "each", weightPerUnit: 5, basePrice: 2, description: "Useful trade good, sought after at remote posts." },
  whiskey: { id: "whiskey", category: "trade_good", name: "Whiskey", unit: "bottle", weightPerUnit: 2, basePrice: 1, description: "A reliable bartering good, though it can sour morale if overused." },
};

export const ITEM_LIST = Object.values(ITEMS);

export const STARTING_SHOP_ITEMS = ITEM_LIST.filter((i) => i.id !== "fresh_meat");
