import type { Landmark } from "../types/game";

// Simplified but geographically ordered Oregon Trail, Independence MO -> Oregon City.
// Mile markers are cumulative and approximate historical distances.
// `nextId` is an explicit graph pointer so branch legs (Sublette Cutoff, Barlow Road,
// Columbia Rapids) can merge back onto the main line correctly.
export const TRAIL: Landmark[] = [
  { id: "independence", name: "Independence, Missouri", mileMarker: 0, hasFort: true, terrain: "plains", notes: "Jumping-off point. Last chance to outfit before the real trail begins.", nextId: "kansas_river", keeper: { name: "Jedediah Marsh", blurb: "The outfitter who's seen a thousand families off on this same road.", priceModifier: 1.0 } },
  { id: "kansas_river", name: "Kansas River Crossing", mileMarker: 102, hasFort: false, terrain: "river", riverCrossing: { name: "Kansas River", depthFt: 5, currentSpeed: 4, ferryCost: 3, guideCost: 2, hasFerry: true, hasGuide: true }, nextId: "big_blue" },
  { id: "big_blue", name: "Big Blue River Crossing", mileMarker: 185, hasFort: false, terrain: "river", riverCrossing: { name: "Big Blue River", depthFt: 4, currentSpeed: 5, ferryCost: 0, guideCost: 2, hasFerry: false, hasGuide: true }, nextId: "fort_kearny" },
  { id: "fort_kearny", name: "Fort Kearny", mileMarker: 316, hasFort: true, terrain: "plains", nextId: "chimney_rock", keeper: { name: "Colonel Josiah Pratt", blurb: "Runs the post like a drill line — prices are fixed, no haggling.", priceModifier: 1.05 } },
  { id: "chimney_rock", name: "Chimney Rock", mileMarker: 483, hasFort: false, terrain: "plains", notes: "A famous spire visible for days before you reach it.", nextId: "fort_laramie" },
  { id: "fort_laramie", name: "Fort Laramie", mileMarker: 549, hasFort: true, terrain: "hills", nextId: "independence_rock", keeper: { name: "Constance Hale", blurb: "A trader who's made a small fortune reselling to desperate travelers.", priceModifier: 1.05 } },
  { id: "independence_rock", name: "Independence Rock", mileMarker: 690, hasFort: false, terrain: "hills", notes: "Tradition holds you should reach this by Independence Day to beat the mountain snows.", nextId: "south_pass" },
  { id: "south_pass", name: "South Pass", mileMarker: 823, hasFort: false, terrain: "mountains", nextId: "parting_of_ways" },
  {
    id: "parting_of_ways",
    name: "Parting of the Ways",
    mileMarker: 850,
    hasFort: false,
    terrain: "hills",
    fork: {
      id: "parting_of_ways_fork",
      prompt: "The trail splits. The Sublette Cutoff saves days but crosses fifty dry, waterless miles. The Fort Bridger route is longer but safer, with water and a chance to resupply.",
      options: [
        { id: "sublette", label: "Take the Sublette Cutoff", description: "Shaves days off the trip, but the dry stretch is brutal on animals and water stores.", targetLandmarkId: "sublette_desert" },
        { id: "bridger", label: "Go by way of Fort Bridger", description: "Longer, but you can resupply and rest along the way.", targetLandmarkId: "fort_bridger" },
      ],
    },
  },
  { id: "fort_bridger", name: "Fort Bridger", mileMarker: 930, hasFort: true, terrain: "mountains", nextId: "soda_springs", keeper: { name: "Jim Hollis", blurb: "An old mountain man who'd rather talk trail gossip than money.", priceModifier: 0.95 } },
  { id: "sublette_desert", name: "Sublette Cutoff (Dry Drive)", mileMarker: 900, hasFort: false, terrain: "desert", notes: "Fifty miles with no reliable water. Ration carefully.", nextId: "soda_springs" },
  { id: "soda_springs", name: "Soda Springs", mileMarker: 990, hasFort: false, terrain: "hills", nextId: "fort_hall" },
  { id: "fort_hall", name: "Fort Hall", mileMarker: 1030, hasFort: true, terrain: "plains", nextId: "snake_river", keeper: { name: "Nathaniel Grey", blurb: "The Hudson's Bay Company's man here — correct, formal, and fair.", priceModifier: 1.0 } },
  { id: "snake_river", name: "Snake River Crossing", mileMarker: 1200, hasFort: false, terrain: "river", riverCrossing: { name: "Snake River", depthFt: 7, currentSpeed: 7, ferryCost: 4, guideCost: 3, hasFerry: true, hasGuide: true }, nextId: "fort_boise" },
  { id: "fort_boise", name: "Fort Boise", mileMarker: 1300, hasFort: true, terrain: "desert", nextId: "blue_mountains", keeper: { name: "Sarah Boone", blurb: "Runs the post alone since her husband passed; glad for the company and the coin.", priceModifier: 0.92 } },
  { id: "blue_mountains", name: "Blue Mountains", mileMarker: 1450, hasFort: false, terrain: "mountains", notes: "Steep grades that punish a worn-out wagon and tired animals.", nextId: "whitman_mission" },
  { id: "whitman_mission", name: "Whitman Mission", mileMarker: 1550, hasFort: true, terrain: "hills", nextId: "the_dalles", keeper: { name: "Reverend Elias Thorne", blurb: "Keeps a small mission store to help the last stretch of travelers.", priceModifier: 0.97 } },
  {
    id: "the_dalles",
    name: "The Dalles",
    mileMarker: 1720,
    hasFort: true,
    terrain: "river",
    riverCrossing: { name: "Columbia River (approach)", depthFt: 10, currentSpeed: 6, ferryCost: 5, guideCost: 4, hasFerry: true, hasGuide: true },
    keeper: { name: "Otis Pruitt", blurb: "Controls the ferry and knows it — his prices reflect that.", priceModifier: 1.08 },
    fork: {
      id: "dalles_fork",
      prompt: "Ahead lies the final barrier: the Cascade Mountains. You can pay the toll to take the Barlow Road over Mount Hood, or raft the wagon down the treacherous Columbia River rapids.",
      options: [
        { id: "barlow", label: "Take the Barlow Road (toll)", description: "A grueling but well-worn wagon road over the mountains. Costs a toll but far less risk of losing the wagon.", targetLandmarkId: "barlow_road" },
        { id: "raft", label: "Raft the Columbia River", description: "Free, but the rapids can capsize a wagon and its cargo. Faster if it goes well.", targetLandmarkId: "columbia_rapids" },
      ],
    },
  },
  { id: "barlow_road", name: "Barlow Road", mileMarker: 1830, hasFort: false, terrain: "mountains", notes: "A toll road cut through dense forest around Mount Hood.", nextId: "oregon_city" },
  { id: "columbia_rapids", name: "Columbia River Rapids", mileMarker: 1780, hasFort: false, terrain: "river", riverCrossing: { name: "Columbia River Rapids", depthFt: 12, currentSpeed: 9, ferryCost: 0, guideCost: 6, hasFerry: false, hasGuide: true }, nextId: "oregon_city" },
  { id: "oregon_city", name: "Oregon City", mileMarker: 1900, hasFort: true, terrain: "plains", notes: "Journey's end. The Willamette Valley awaits.", keeper: { name: "Franklin Reed", blurb: "One of the valley's first settlers, delighted to see new arrivals.", priceModifier: 0.95 } },
];

export const TRAIL_BY_ID: Record<string, Landmark> = Object.fromEntries(TRAIL.map((l) => [l.id, l]));

export const TOTAL_TRAIL_MILES = TRAIL_BY_ID["oregon_city"].mileMarker;
