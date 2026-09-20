import { useGameStore, selectTotalWeight, selectCapacity, outfittingCost } from "../../state/gameStore";
import { WAGON_TYPES, DRAFT_ANIMALS } from "../../data/wagonsAndAnimals";
import { getItemQty } from "../../systems/mutators";

export default function ReviewTab({ onDepart }: { onDepart: () => void }) {
  const state = useGameStore();
  const finishOutfitting = useGameStore((s) => s.finishOutfitting);

  const weight = selectTotalWeight(state);
  const capacity = selectCapacity(state);
  const cost = outfittingCost(state);
  const remainingCash = state.cash - cost.total;

  const foodLbs = ["flour", "bacon", "cornmeal", "beans", "dried_fruit"].reduce(
    (sum, id) => sum + getItemQty(state, id),
    0
  );

  const warnings: string[] = [];
  if (remainingCash < 0) warnings.push("You can't afford this wagon and team — adjust your choices.");
  if (weight > capacity) warnings.push("Your wagon is overloaded. This will slow you down badly.");
  if (foodLbs < 100) warnings.push("You're bringing very little food for the trail ahead.");
  if (getItemQty(state, "bullets") === 0) warnings.push("No ammunition — you won't be able to hunt or defend the party.");
  if (getItemQty(state, "spare_wheel") === 0 && getItemQty(state, "spare_axle") === 0) {
    warnings.push("No spare parts — a break down could strand you.");
  }

  return (
    <div className="outfit-tab">
      <h3>Review Before Departure</h3>
      <div className="review-grid">
        <div>
          <h4>Wagon &amp; Team</h4>
          <p>{WAGON_TYPES[state.wagonType].name} — ${cost.wagon}</p>
          <p>
            {state.draftAnimalCount}x {DRAFT_ANIMALS[state.draftAnimalType].name} — ${cost.animals}
          </p>
        </div>
        <div>
          <h4>Party</h4>
          <p>{state.party.length} traveler(s)</p>
        </div>
        <div>
          <h4>Supplies</h4>
          <p>{Math.round(weight)} / {capacity} lbs</p>
          <p>{Math.round(foodLbs)} lbs of food</p>
        </div>
        <div>
          <h4>Budget</h4>
          <p>Starting cash: ${state.cash.toFixed(2)}</p>
          <p>Wagon &amp; team: -${cost.total.toFixed(2)}</p>
          <p>
            <strong>Remaining: ${remainingCash.toFixed(2)}</strong>
          </p>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="warning-box">
          <h4>Before you go...</h4>
          <ul>
            {warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        className="btn primary large"
        disabled={remainingCash < 0}
        onClick={() => {
          finishOutfitting();
          onDepart();
        }}
      >
        Depart for Oregon
      </button>
    </div>
  );
}
