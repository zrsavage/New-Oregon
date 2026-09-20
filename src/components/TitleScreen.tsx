import { useState } from "react";
import { useGameStore } from "../state/gameStore";

export default function TitleScreen({ onDismiss }: { onDismiss: () => void }) {
  const phase = useGameStore((s) => s.phase);
  const leaderName = useGameStore((s) => s.leaderName);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const [name, setName] = useState("");
  const hasSave = phase !== "title";

  return (
    <div className="screen title-screen">
      <div className="title-card">
        <h1>The Oregon Trail</h1>
        <p className="subtitle">A Detailed Journey West, 1846</p>

        {hasSave && (
          <div className="title-continue">
            <p>
              A journey in progress: <strong>{leaderName}</strong>'s party
            </p>
            <button className="btn primary" onClick={onDismiss}>
              Continue Journey
            </button>
          </div>
        )}

        <div className="title-new">
          <h2>Start a New Journey</h2>
          <label htmlFor="leaderName">Your name</label>
          <input
            id="leaderName"
            type="text"
            value={name}
            placeholder="e.g. Amos Calloway"
            onChange={(e) => setName(e.target.value)}
            maxLength={30}
          />
          <button
            className="btn"
            disabled={name.trim().length === 0}
            onClick={() => {
              startNewGame(name.trim());
              onDismiss();
            }}
          >
            {hasSave ? "Start Over" : "Begin Journey"}
          </button>
        </div>

        <p className="flavor">
          Outfit your wagon, choose who travels with you, and decide every mile of the
          trail from Independence, Missouri to Oregon City. The trail does not forgive
          poor planning.
        </p>
      </div>
    </div>
  );
}
