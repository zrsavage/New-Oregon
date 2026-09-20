import { useGameStore } from "../../state/gameStore";
import { TRAIL, TRAIL_BY_ID, TOTAL_TRAIL_MILES } from "../../data/trail";

export default function TrailMap() {
  const mile = useGameStore((s) => s.mile);
  const route = useGameStore((s) => s.route);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const nextLandmarkId = useGameStore((s) => s.nextLandmarkId);

  const progressPct = Math.min(100, (mile / TOTAL_TRAIL_MILES) * 100);
  const current = TRAIL_BY_ID[currentLandmarkId];
  const next = nextLandmarkId ? TRAIL_BY_ID[nextLandmarkId] : null;
  const distanceToNext = next ? Math.max(0, Math.round(next.mileMarker - mile)) : null;

  return (
    <div className="trail-map">
      <div className="trail-track">
        <div className="trail-fill" style={{ width: `${progressPct}%` }} />
        <div className="trail-wagon" style={{ left: `${progressPct}%` }} title={`Mile ${Math.round(mile)}`}>
          🛒
        </div>
        {TRAIL.map((lm) => {
          const pct = (lm.mileMarker / TOTAL_TRAIL_MILES) * 100;
          const visited = route.includes(lm.id);
          const isCurrent = lm.id === currentLandmarkId;
          return (
            <div
              key={lm.id}
              className={`trail-marker ${visited ? "visited" : ""} ${isCurrent ? "current" : ""} ${lm.hasFort ? "fort" : ""}`}
              style={{ left: `${pct}%` }}
              title={lm.name}
            >
              <span className="trail-dot" />
            </div>
          );
        })}
      </div>
      <div className="trail-progress-text">
        Mile {Math.round(mile)} of {TOTAL_TRAIL_MILES} — at {current?.name ?? "the trail"}
        {next && distanceToNext !== null && (
          <span className="trail-next">
            {" "}
            · Next: {next.name} ({distanceToNext} mi)
          </span>
        )}
      </div>
    </div>
  );
}
