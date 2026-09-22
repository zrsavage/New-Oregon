import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DateState } from "../types/game";

export interface GraveRecord {
  id: string;
  name: string;
  cause: string;
  mile: number;
  landmarkId: string;
  date: DateState;
  leaderName: string;
}

interface GravesStore {
  graves: GraveRecord[];
  addGrave: (grave: GraveRecord) => void;
}

const MAX_GRAVES = 300;

/**
 * Trailside graves persist across playthroughs, separate from the current
 * journey's save — a companion or leader lost on one run leaves a marker
 * future runs pass by, the way a real trail would accumulate them.
 */
export const useGravesStore = create<GravesStore>()(
  persist(
    (set, get) => ({
      graves: [],
      addGrave: (grave) => {
        if (get().graves.some((g) => g.id === grave.id)) return;
        const next = [...get().graves, grave];
        if (next.length > MAX_GRAVES) next.splice(0, next.length - MAX_GRAVES);
        set({ graves: next });
      },
    }),
    { name: "new-oregon-graves", version: 1 }
  )
);
