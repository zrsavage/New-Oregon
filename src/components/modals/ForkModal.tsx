import { useGameStore } from "../../state/gameStore";
import { TRAIL_BY_ID } from "../../data/trail";

export default function ForkModal() {
  const pendingFork = useGameStore((s) => s.pendingFork);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const resolveFork = useGameStore((s) => s.resolveFork);
  const pendingRiverCrossing = useGameStore((s) => s.pendingRiverCrossing);

  if (!pendingFork || pendingRiverCrossing) return null;

  const landmark = TRAIL_BY_ID[currentLandmarkId];
  const fork = landmark?.fork;
  if (!fork) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal fork-modal">
        <h2>{landmark.name}</h2>
        <p>{fork.prompt}</p>
        <div className="modal-choices">
          {fork.options.map((opt) => (
            <button key={opt.id} className="btn choice-btn" onClick={() => resolveFork(opt.id)}>
              <span>{opt.label}</span>
              <span className="choice-hint">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
