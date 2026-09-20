import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AchievementsStore {
  unlocked: string[];
  unlock: (ids: string[]) => void;
}

/**
 * Achievement unlocks persist across playthroughs, separate from the current
 * journey's save — so starting a new run never resets what you've already earned.
 */
export const useAchievementsStore = create<AchievementsStore>()(
  persist(
    (set, get) => ({
      unlocked: [],
      unlock: (ids) => {
        if (ids.length === 0) return;
        const merged = Array.from(new Set([...get().unlocked, ...ids]));
        set({ unlocked: merged });
      },
    }),
    { name: "new-oregon-achievements", version: 1 }
  )
);
