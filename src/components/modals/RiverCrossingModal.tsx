import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { TRAIL_BY_ID } from "../../data/trail";
import { assessCrossingRisk } from "../../systems/river";
import RiskDisplay from "../shared/RiskDisplay";
import TimingBar from "../shared/TimingBar";
import type { RiverCrossingMethod } from "../../types/game";

const TIMED_METHODS = new Set<RiverCrossingMethod>(["ford", "caulk_float"]);

export default function RiverCrossingModal() {
  const state = useGameStore();
  const pendingRiverCrossing = useGameStore((s) => s.pendingRiverCrossing);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const resolveRiverCrossing = useGameStore((s) => s.resolveRiverCrossing);
  const lastCrossingNarrative = useGameStore((s) => s.lastCrossingNarrative);
  const clearNarratives = useGameStore((s) => s.clearNarratives);
  const cash = useGameStore((s) => s.cash);
  const [selectedMethod, setSelectedMethod] = useState<RiverCrossingMethod | null>(null);

  if (!pendingRiverCrossing && !lastCrossingNarrative) return null;

  if (lastCrossingNarrative) {
    return (
      <div className="modal-backdrop">
        <div className="modal river-modal">
          <h2>The Crossing</h2>
          <p>{lastCrossingNarrative}</p>
          <button
            className="btn primary"
            onClick={() => {
              setSelectedMethod(null);
              clearNarratives();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const landmark = TRAIL_BY_ID[currentLandmarkId];
  const crossing = landmark?.riverCrossing;
  if (!crossing) return null;

  if (selectedMethod) {
    const label = selectedMethod === "ford" ? "Ford the river" : "Caulk the wagon and float it";
    const hint =
      selectedMethod === "ford"
        ? "Time the wheels off the rocks as you drive through — click Stop as the marker crosses the sweet spot."
        : "Time the push as you float the wagon across — click Stop as the marker crosses the sweet spot.";
    return (
      <div className="modal-backdrop">
        <div className="modal river-modal">
          <h2>{label}</h2>
          <p>{hint}</p>
          <TimingBar
            label="Steady the wagon..."
            difficulty={crossing.depthFt * 1.2 + crossing.currentSpeed > 40 ? "hard" : "medium"}
            onResolve={(quality) => resolveRiverCrossing(selectedMethod, quality)}
          />
        </div>
      </div>
    );
  }

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
                onClick={() => (TIMED_METHODS.has(opt.id) ? setSelectedMethod(opt.id) : resolveRiverCrossing(opt.id))}
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
