import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { estimateMealFoodCost } from "../../systems/cooking";
import TimingBar from "../shared/TimingBar";

export default function CookModal() {
  const state = useGameStore();
  const pendingCook = useGameStore((s) => s.pendingCook);
  const closeCook = useGameStore((s) => s.closeCook);
  const resolveCookChoice = useGameStore((s) => s.resolveCookChoice);
  const lastCookNarrative = useGameStore((s) => s.lastCookNarrative);
  const clearNarratives = useGameStore((s) => s.clearNarratives);
  const [started, setStarted] = useState(false);

  if (!pendingCook && !lastCookNarrative) return null;

  if (lastCookNarrative) {
    return (
      <div className="modal-backdrop">
        <div className="modal cook-modal">
          <h2>Cooking</h2>
          <p>{lastCookNarrative}</p>
          <button
            className="btn primary"
            onClick={() => {
              setStarted(false);
              clearNarratives();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (started) {
    return (
      <div className="modal-backdrop">
        <div className="modal cook-modal">
          <h2>Cook a Meal</h2>
          <p>Watch the fire and time it right — click Stop as the marker crosses the sweet spot.</p>
          <TimingBar label="Mind the fire..." difficulty="easy" onResolve={(quality) => resolveCookChoice(quality)} />
        </div>
      </div>
    );
  }

  const foodCost = estimateMealFoodCost(state);

  return (
    <div className="modal-backdrop">
      <div className="modal cook-modal">
        <h2>Cook a Meal</h2>
        <p>
          A special meal, cooked well, lifts the whole party's spirits — and maybe their health too. It won't cost
          you any travel time, just about <strong>{foodCost} lbs</strong> of food.
        </p>
        <button className="btn primary" onClick={() => setStarted(true)}>
          Start Cooking
        </button>
        <button className="btn" onClick={closeCook}>
          Never Mind
        </button>
      </div>
    </div>
  );
}
