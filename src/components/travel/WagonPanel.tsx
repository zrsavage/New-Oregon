import { useGameStore, selectTotalWeight, selectCapacity } from "../../state/gameStore";
import { WAGON_TYPES, DRAFT_ANIMALS } from "../../data/wagonsAndAnimals";

export default function WagonPanel() {
  const state = useGameStore();
  const weight = selectTotalWeight(state);
  const capacity = selectCapacity(state);

  return (
    <div className="panel wagon-panel">
      <h3>Wagon &amp; Team</h3>
      <p>{WAGON_TYPES[state.wagonType].name}</p>
      <div className="bar-track" title={`Condition ${Math.round(state.wagonCondition)}`}>
        <div className="bar-fill wagon" style={{ width: `${state.wagonCondition}%` }} />
      </div>
      <p className="small-label">Condition: {Math.round(state.wagonCondition)}%</p>

      <p>
        {state.draftAnimalCount}x {DRAFT_ANIMALS[state.draftAnimalType].name}
      </p>
      <div className="bar-track" title={`Animal health ${Math.round(state.draftAnimalHealth)}`}>
        <div className="bar-fill animal" style={{ width: `${state.draftAnimalHealth}%` }} />
      </div>
      <p className="small-label">Team health: {Math.round(state.draftAnimalHealth)}%</p>

      <p className={weight > capacity ? "over-capacity" : ""}>
        Cargo: {Math.round(weight)} / {capacity} lbs
      </p>
      <p>Cash: ${state.cash.toFixed(2)}</p>
    </div>
  );
}
