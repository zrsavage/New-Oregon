import { useGameStore } from "../../state/gameStore";
import { TRAIL_BY_ID } from "../../data/trail";
import { assessCrossingRisk } from "../../systems/river";
import RiskDisplay from "../shared/RiskDisplay";
import type { RiverCrossingMethod } from "../../types/game";

export default function RiverCrossingModal() {
  const state = useGameStore();
  const pendingRiverCrossing = useGameStore((s) => s.pendingRiverCrossing);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const resolveRiverCrossing = useGameStore((s) => s.resolveRiverCrossing);
  const lastCrossingNarrative = useGameStore((s) => s.lastCrossingNarrative);
  const clearNarratives = useGameStore((s) => s.clearNarratives);
  const cash = useGameStore((s) => s.cash);

  if (!pendingRiverCrossing && !lastCrossingNarrative) return null;

  if (lastCrossingNarrative) {
    return (
      <div className="modal-backdrop">
        <div className="modal river-modal">
          <h2>The Crossing</h2>
          <p>{lastCrossingNarrative}</p>
          <button className="btn primary" onClick={clearNarratives}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  const landmark = TRAIL_BY_ID[currentLandmarkId];
  const crossing = landmark?.riverCrossing;
  if (!crossing) return null;

  const options: { id: RiverCrossingMethod; label: string; hint: string; disabled?: boolean }[] = [
    { id: "ford", label: "Ford the river", hint: "Drive the wagon straight across. Risky in deep or fast water." },
    { id: "caulk_float", label: "Caulk the wagon and float it", hint: "Seal the wagon bed and float it across like a raft." },
    {
      id: "ferry",
      label: `Take the ferry ($${crossing.ferryCost})`,
      hint: "Safe, but costs money and requires one to be running.",
      disabled: !crossing.hasFerry || cash < crossing.ferryCost,
    },
    {
      id: "guide",
      label: `Hire a local guide ($${crossing.guideCost})`,
      hint: "Pay for local knowledge of the safest crossing point.",
      disabled: !crossing.hasGuide || cash < crossing.guideCost,
    },
    { id: "wait", label: "Wait a day", hint: "Make camp and hope the water calms." },
  ];

  return (
    <div className="modal-backdrop">
      <div className="modal river-modal">
        <h2>{crossing.name}</h2>
        <p>
          Depth: {crossing.depthFt} ft &middot; Current: {"⚡".repeat(Math.max(1, Math.round(crossing.currentSpeed / 2)))}
        </p>
        <div className="modal-choices">
          {options.map((opt) => {
            const assessment = assessCrossingRisk(state, crossing, opt.id);
            return (
              <button
                key={opt.id}
                className="btn choice-btn"
                disabled={opt.disabled}
                onClick={() => resolveRiverCrossing(opt.id)}
              >
                <span>{opt.label}</span>
                <span className="choice-hint">{opt.hint}</span>
                {assessment && <RiskDisplay assessment={assessment} dangerLabel="chance of trouble" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
