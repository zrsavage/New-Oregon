import type { TerrainType } from "../types/game";

/** Deterministic small hash so the same character id always gets the same color. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** A muted, parchment-friendly hue derived from an id — stable across renders and saves. */
export function avatarColor(id: string): string {
  const hue = hashString(id) % 360;
  return `hsl(${hue}, 42%, 40%)`;
}

export function avatarColorLight(id: string): string {
  const hue = hashString(id) % 360;
  return `hsl(${hue}, 45%, 88%)`;
}

export const TERRAIN_COLORS: Record<TerrainType, { base: string; accent: string }> = {
  plains: { base: "#cdd9a0", accent: "#a9bb72" },
  hills: { base: "#b7c084", accent: "#93a05e" },
  river: { base: "#a9c9d9", accent: "#7fa8bc" },
  mountains: { base: "#c3bcae", accent: "#96897a" },
  desert: { base: "#e3cd9c", accent: "#c7a869" },
  forest: { base: "#8fae7a", accent: "#6c8a58" },
};

export const TERRAIN_LABELS: Record<TerrainType, string> = {
  plains: "Plains",
  hills: "Hills",
  river: "River",
  mountains: "Mountains",
  desert: "Desert",
  forest: "Forest",
};
