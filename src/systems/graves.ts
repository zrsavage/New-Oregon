import type { GameState } from "../types/game";
import { useGravesStore } from "../state/gravesStore";

/**
 * Checks the party for deaths not yet written to the cross-run grave log,
 * and records each exactly once (guarded by draft.recordedGraveIds so a
 * death already logged doesn't get re-added on every later mutation this
 * run). Practice runs never leave a mark, same as achievements.
 */
export function recordGraves(draft: GameState) {
  if (draft.isPractice) return;

  for (const person of draft.party) {
    if (person.status !== "dead") continue;
    if (draft.recordedGraveIds.includes(person.id)) continue;
    draft.recordedGraveIds.push(person.id);

    useGravesStore.getState().addGrave({
      id: `${draft.seed}_${person.id}`,
      name: person.name,
      cause: person.deathCause ?? "the hardships of the trail",
      mile: Math.round(draft.mile),
      landmarkId: draft.currentLandmarkId,
      date: { ...draft.date },
      leaderName: draft.leaderName,
    });
  }
}
