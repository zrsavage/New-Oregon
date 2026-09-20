import type { GameState, Landmark } from "../types/game";
import { TOTAL_TRAIL_MILES } from "../data/trail";
import { PRACTICE_TARGET_MILE } from "./init";
import { livingParty, pushLog } from "./mutators";

export function arriveAtLandmark(draft: GameState, landmark: Landmark) {
  draft.currentLandmarkId = landmark.id;
  if (!draft.route.includes(landmark.id)) draft.route.push(landmark.id);
  if (landmark.hasFort && !draft.visitedForts.includes(landmark.id)) {
    draft.visitedForts.push(landmark.id);
  }
  pushLog(draft, `Arrived at ${landmark.name}.${landmark.notes ? " " + landmark.notes : ""}`, "info");

  if (landmark.riverCrossing) {
    draft.pendingRiverCrossing = true;
  }

  if (landmark.fork) {
    draft.pendingFork = true;
    draft.nextLandmarkId = null;
  } else {
    draft.nextLandmarkId = landmark.nextId ?? null;
  }
}

export function checkEnding(draft: GameState) {
  if (draft.ending) return;

  const leader = draft.party.find((p) => p.isLeader);
  if (leader && leader.status === "dead") {
    draft.ending = "leader_died";
    draft.phase = "ending";
    pushLog(draft, `${leader.name} has died. The journey ends here.`, "critical");
    return;
  }

  if (livingParty(draft).length === 0) {
    draft.ending = "party_wiped";
    draft.phase = "ending";
    return;
  }

  if (draft.draftAnimalHealth <= 0) {
    draft.ending = "starved_stranded";
    draft.phase = "ending";
    pushLog(draft, "Your team collapses. The wagon can go no further.", "critical");
    return;
  }

  if (draft.isPractice && draft.mile >= PRACTICE_TARGET_MILE) {
    draft.ending = "practice_complete";
    draft.phase = "ending";
    pushLog(draft, "Practice run complete. You've got the feel of the trail now.", "good");
    return;
  }

  if (draft.mile >= TOTAL_TRAIL_MILES) {
    draft.mile = TOTAL_TRAIL_MILES;
    draft.ending = "arrived";
    draft.phase = "ending";
    pushLog(draft, "You have reached Oregon City. The journey is complete.", "good");
    return;
  }
}
