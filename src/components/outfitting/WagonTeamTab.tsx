import { useGameStore, ALL_WAGON_TYPES, ALL_DRAFT_ANIMALS } from "../../state/gameStore";
import { WAGON_TYPES } from "../../data/wagonsAndAnimals";
import WagonRig from "../shared/WagonRig";

export default function WagonTeamTab() {
  const wagonType = useGameStore((s) => s.wagonType);
  const draftAnimalType = useGameStore((s) => s.draftAnimalType);
  const draftAnimalCount = useGameStore((s) => s.draftAnimalCount);
  const setWagonType = useGameStore((s) => s.setWagonType);
  const setDraftAnimalType = useGameStore((s) => s.setDraftAnimalType);
  const setDraftAnimalCount = useGameStore((s) => s.setDraftAnimalCount);

  const minAnimals = WAGON_TYPES[wagonType].minDraftAnimals;

  return (
    <div className="outfit-tab">
      <div className="wagon-preview">
        <WagonRig
          wagonType={wagonType}
          draftAnimalType={draftAnimalType}
          draftAnimalCount={draftAnimalCount}
          wagonCondition={100}
          draftAnimalHealth={100}
          width={320}
        />
      </div>
      <h3>Choose Your Wagon</h3>
      <div className="card-grid">
        {ALL_WAGON_TYPES.map((w) => (
          <button
            key={w.id}
            className={`pick-card ${wagonType === w.id ? "selected" : ""}`}
            onClick={() => setWagonType(w.id)}
          >
            <h4>{w.name}</h4>
            <p className="pick-desc">{w.description}</p>
            <ul className="pick-stats">
              <li>Cost: ${w.cost}</li>
              <li>Capacity: {w.baseCapacityLbs} lbs</li>
              <li>Speed: {Math.round(w.baseSpeedModifier * 100)}%</li>
              <li>Min. team: {w.minDraftAnimals}</li>
            </ul>
          </button>
        ))}
      </div>

      <h3>Choose Your Draft Animals</h3>
      <div className="card-grid">
        {ALL_DRAFT_ANIMALS.map((a) => (
          <button
            key={a.id}
            className={`pick-card ${draftAnimalType === a.id ? "selected" : ""}`}
            onClick={() => setDraftAnimalType(a.id)}
          >
            <h4>{a.name}</h4>
            <ul className="pick-stats">
              <li>Cost: ${a.costPerHead}/head</li>
              <li>Speed: {Math.round(a.speedModifier * 100)}%</li>
              <li>Toughness: {a.toughness}</li>
            </ul>
          </button>
        ))}
      </div>

      <div className="animal-count">
        <label htmlFor="animalCount">
          Number of {ALL_DRAFT_ANIMALS.find((a) => a.id === draftAnimalType)?.name} (min {minAnimals})
        </label>
        <input
          id="animalCount"
          type="range"
          min={minAnimals}
          max={12}
          value={draftAnimalCount}
          onChange={(e) => setDraftAnimalCount(Number(e.target.value))}
        />
        <span>{draftAnimalCount}</span>
      </div>
    </div>
  );
}
