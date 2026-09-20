export const FIRST_NAMES = [
  "Abigail", "Amos", "Beatrice", "Caleb", "Clara", "Cyrus", "Dorothy", "Edgar",
  "Eliza", "Ephraim", "Flora", "Gideon", "Hattie", "Isaiah", "Josephine", "Levi",
  "Lucinda", "Mabel", "Malachi", "Martha", "Nathaniel", "Ola", "Orville", "Permelia",
  "Silas", "Susannah", "Thaddeus", "Vesta", "Wilbur", "Zilpha",
];

export const LAST_NAMES = [
  "Abernathy", "Boone", "Calloway", "Dunmore", "Ellison", "Fairweather", "Granger",
  "Holt", "Ingram", "Jessup", "Kinnard", "Lachlan", "Mercer", "Norwood", "Osgood",
  "Pruitt", "Quinlan", "Ridgeway", "Stanfield", "Tolliver", "Underhill", "Vance",
  "Whitfield", "Yancy",
];

export function randomName(rng: () => number): string {
  const f = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
  const l = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
  return `${f} ${l}`;
}
