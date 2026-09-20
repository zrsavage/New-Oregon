import type { GameState } from "../types/game";
import { ACHIEVEMENTS } from "../data/achievements";
import { useAchievementsStore } from "../state/achievementsStore";

/**
 * Checks every achievement against the current draft state, records any that
 * are newly true into `draft.runAchievements` (for the end-of-run reveal),
 * and persists them to the cross-run achievements store. Practice runs never
 * unlock anything, so trying the game out doesn't trivialize real unlocks.
 */
export function applyAchievements(draft: GameState) {
  if (draft.isPractice) return;

  const persisted = useAchievementsStore.getState();
  const newly: string[] = [];

  for (const achievement of ACHIEVEMENTS) {
    if (persisted.unlocked.includes(achievement.id) || draft.runAchievements.includes(achievement.id)) continue;
    if (achievement.isEarned(draft)) {
      draft.runAchievements.push(achievement.id);
      newly.push(achievement.id);
    }
  }

  if (newly.length > 0) persisted.unlock(newly);
}
