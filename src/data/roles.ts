import type { RoleDef, Role } from "../types/game";

export const ROLES: Record<Role, RoleDef> = {
  leader: {
    id: "leader",
    name: "Wagon Leader",
    description: "Makes the final call on the trail. A steady leader keeps morale from collapsing.",
    primaryBonus: "party morale decay resistance",
  },
  scout: {
    id: "scout",
    name: "Scout",
    description: "Rides ahead to read the trail, warn of danger, and find the safest fords.",
    primaryBonus: "river crossing safety, fork information",
  },
  hunter: {
    id: "hunter",
    name: "Hunter",
    description: "Brings in fresh meat to stretch the larder and boost spirits.",
    primaryBonus: "hunting yield",
  },
  wainwright: {
    id: "wainwright",
    name: "Wainwright",
    description: "A wheelwright and carpenter who keeps the wagon rolling.",
    primaryBonus: "wagon repair success, wagon wear reduction",
  },
  healer: {
    id: "healer",
    name: "Healer",
    description: "Knows herbs and doctoring. Cuts the odds of sickness turning fatal.",
    primaryBonus: "illness/injury recovery odds",
  },
  cook: {
    id: "cook",
    name: "Cook",
    description: "Stretches rations further and keeps food from spoiling as fast.",
    primaryBonus: "food spoilage reduction, ration efficiency",
  },
  teamster: {
    id: "teamster",
    name: "Teamster",
    description: "Handles the oxen, mules, or horses, keeping them healthy and pulling well.",
    primaryBonus: "draft animal health, pace efficiency",
  },
  farmer: {
    id: "farmer",
    name: "Farmer",
    description: "Knows how to forage, garden, and judge good grazing land.",
    primaryBonus: "foraging yield, grazing quality",
  },
  merchant: {
    id: "merchant",
    name: "Merchant",
    description: "A shrewd trader who gets better prices at forts and with other travelers.",
    primaryBonus: "buy/sell prices",
  },
};

export const ROLE_LIST = Object.values(ROLES);
