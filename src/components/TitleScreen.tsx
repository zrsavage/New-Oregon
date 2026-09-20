import { useState } from "react";
import { useGameStore, PRACTICE_TARGET_MILE } from "../state/gameStore";
import AchievementsPanel from "./AchievementsPanel";

export default function TitleScreen({ onDismiss }: { onDismiss: () => void }) {
  const phase = useGameStore((s) => s.phase);
  const leaderName = useGameStore((s) => s.leaderName);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const startPracticeRun = useGameStore((s) => s.startPracticeRun);
  const [name, setName] = useState("");
  const [showAchievements, setShowAchievements] = useState(false);
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

        {!showAchievements ? (
          <>
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
              <div className="title-button-row">
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
                <button
                  className="btn"
                  disabled={name.trim().length === 0}
                  title={`A short, low-stakes trial run (about ${PRACTICE_TARGET_MILE} miles) to learn the systems. Achievements don't count.`}
                  onClick={() => {
                    startPracticeRun(name.trim());
                    onDismiss();
                  }}
                >
                  Practice Run
                </button>
              </div>
            </div>

            <p className="flavor">
              Outfit your wagon, choose who travels with you, and decide every mile of the
              trail from Independence, Missouri to Oregon City. The trail does not forgive
              poor planning.
            </p>

            <button className="btn small achievements-link" onClick={() => setShowAchievements(true)}>
              View Achievements
            </button>
          </>
        ) : (
          <>
            <AchievementsPanel />
            <button className="btn" onClick={() => setShowAchievements(false)}>
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
