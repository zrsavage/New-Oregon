import { useGameStore } from "../state/gameStore";
import { TOTAL_TRAIL_MILES, TRAIL_BY_ID } from "../data/trail";
import { ACHIEVEMENTS_BY_ID } from "../data/achievements";

const ENDING_COPY: Record<string, { title: string; body: string }> = {
  arrived: {
    title: "Journey's End — Oregon City",
    body: "After a long road west, your party arrives in the Willamette Valley. A new life begins.",
  },
  leader_died: {
    title: "The Journey Ends",
    body: "Without its leader, the party cannot continue. The trail claims another traveler.",
  },
  party_wiped: {
    title: "Lost to the Trail",
    body: "No one is left to carry on. The wagon sits abandoned on the trail.",
  },
  starved_stranded: {
    title: "Stranded",
    body: "Your team can pull the wagon no further. Stranded far from any help, the journey ends here.",
  },
  settled: {
    title: "A New Beginning",
    body: "Rather than push on, you and your party decide this is far enough. A new life starts here.",
  },
  practice_complete: {
    title: "Practice Run Complete",
    body: "You've got the feel of the trail now — the wagon, the odds, the choices. Ready to try it for real?",
  },
};

export default function EndingScreen({ onReturnToTitle }: { onReturnToTitle: () => void }) {
  const ending = useGameStore((s) => s.ending);
  const daysTraveled = useGameStore((s) => s.daysTraveled);
  const mile = useGameStore((s) => s.mile);
  const party = useGameStore((s) => s.party);
  const cash = useGameStore((s) => s.cash);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const runAchievements = useGameStore((s) => s.runAchievements);
  const isPractice = useGameStore((s) => s.isPractice);
  const resetToTitle = useGameStore((s) => s.resetToTitle);

  const copy = ENDING_COPY[ending ?? "arrived"];
  const survivors = party.filter((c) => c.status !== "dead");
  const settledLandmark = ending === "settled" ? TRAIL_BY_ID[currentLandmarkId] : null;

  return (
    <div className="screen ending-screen">
      <div className="title-card">
        <h1>{copy.title}</h1>
        <p>{settledLandmark ? `Rather than push on, you and your party settle at ${settledLandmark.name}. A new life starts here.` : copy.body}</p>

        {!isPractice && (
          <div className="review-grid">
            <div>
              <h4>Days on the Trail</h4>
              <p>{daysTraveled}</p>
            </div>
            <div>
              <h4>Miles Traveled</h4>
              <p>{Math.round(mile)} / {TOTAL_TRAIL_MILES}</p>
            </div>
            <div>
              <h4>Survivors</h4>
              <p>{survivors.length} / {party.length}</p>
            </div>
            <div>
              <h4>Cash Remaining</h4>
              <p>${cash.toFixed(2)}</p>
            </div>
          </div>
        )}

        {!isPractice && runAchievements.length > 0 && (
          <div className="achievements-earned">
            <h4>Achievements Earned This Run</h4>
            <ul>
              {runAchievements.map((id) => {
                const a = ACHIEVEMENTS_BY_ID[id];
                if (!a) return null;
                return (
                  <li key={id}>
                    <strong>{a.name}</strong> — {a.description}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <button
          className="btn primary large"
          onClick={() => {
            resetToTitle();
            onReturnToTitle();
          }}
        >
          Return to Title
        </button>
      </div>
    </div>
  );
}
