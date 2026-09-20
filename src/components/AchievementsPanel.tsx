import { useAchievementsStore } from "../state/achievementsStore";
import { ACHIEVEMENTS } from "../data/achievements";

export default function AchievementsPanel() {
  const unlocked = useAchievementsStore((s) => s.unlocked);

  return (
    <div className="achievements-panel">
      <h2>Achievements</h2>
      <p className="hint">
        {unlocked.length} / {ACHIEVEMENTS.length} earned across all your journeys.
      </p>
      <ul className="achievements-list">
        {ACHIEVEMENTS.map((a) => {
          const earned = unlocked.includes(a.id);
          return (
            <li key={a.id} className={earned ? "earned" : "locked"}>
              <span className="achievement-icon">{earned ? "★" : "☆"}</span>
              <span className="achievement-text">
                <strong>{a.name}</strong>
                <span className="achievement-desc">{a.description}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
