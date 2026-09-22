import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { HUNT_TARGETS, HUNT_TARGETS_BY_ID } from "../../systems/hunting";
import { getItemQty } from "../../systems/mutators";
import RiskDisplay from "../shared/RiskDisplay";
import TimingBar from "../shared/TimingBar";

export default function HuntModal() {
  const state = useGameStore();
  const pendingHunt = useGameStore((s) => s.pendingHunt);
  const closeHunt = useGameStore((s) => s.closeHunt);
  const resolveHuntChoice = useGameStore((s) => s.resolveHuntChoice);
  const lastHuntNarrative = useGameStore((s) => s.lastHuntNarrative);
  const clearNarratives = useGameStore((s) => s.clearNarratives);
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  if (!pendingHunt && !lastHuntNarrative) return null;

  if (lastHuntNarrative) {
    return (
      <div className="modal-backdrop">
        <div className="modal hunt-modal">
          <h2>The Hunt</h2>
          <p>{lastHuntNarrative}</p>
          <button
            className="btn primary"
            onClick={() => {
              setSelectedTargetId(null);
              clearNarratives();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const bullets = getItemQty(state, "bullets");

  if (selectedTargetId) {
    const target = HUNT_TARGETS_BY_ID[selectedTargetId];
    return (
      <div className="modal-backdrop">
        <div className="modal hunt-modal">
          <h2>{target.label}</h2>
          <p>Line up your shot — click Stop as the marker crosses the sweet spot for a cleaner shot.</p>
          <TimingBar
            label="Take aim..."
            difficulty={target.id === "big_game" ? "hard" : target.id === "deer" ? "medium" : "easy"}
            onResolve={(quality) => resolveHuntChoice(target.id, quality)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal hunt-modal">
        <h2>Go Hunting</h2>
        <p>
          You have <strong>{Math.round(bullets)} bullets</strong>. Hunting takes the rest of the day — the wagon
          won't move any further today.
        </p>
        <div className="modal-choices">
          {HUNT_TARGETS.map((target) => {
            const assessment = target.risk(state);
            const disabled = bullets < target.bulletCost;
            return (
              <button
                key={target.id}
                className="btn choice-btn"
                disabled={disabled}
                onClick={() => setSelectedTargetId(target.id)}
              >
                <span>
                  {target.label} ({target.bulletCost} bullet{target.bulletCost > 1 ? "s" : ""})
                </span>
                <span className="choice-hint">
                  {target.description} Yields {target.yieldMin}–{target.yieldMax} lbs if successful.
                </span>
                <RiskDisplay assessment={assessment} />
              </button>
            );
          })}
        </div>
        <button className="btn" onClick={closeHunt}>
          Never Mind
        </button>
      </div>
    </div>
  );
}
