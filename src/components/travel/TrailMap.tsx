import { useGameStore } from "../../state/gameStore";
import { TRAIL, TRAIL_BY_ID, TOTAL_TRAIL_MILES } from "../../data/trail";
import { TERRAIN_COLORS, TERRAIN_LABELS } from "../../systems/visuals";
import WagonRig from "../shared/WagonRig";
import type { Landmark } from "../../types/game";

const VIEW_W = 1000;
const VIEW_H = 44;
const BAND_TOP = 12;
const BAND_H = 20;
const BAND_MID = BAND_TOP + BAND_H / 2;

function mileToX(mile: number): number {
  return (mile / TOTAL_TRAIL_MILES) * VIEW_W;
}

/** Terrain-colored segments, built from landmarks sorted by mile so branch legs
 * (which sit out of array order) never draw a backward/overlapping band. */
function buildSegments() {
  const sorted = [...TRAIL].sort((a, b) => a.mileMarker - b.mileMarker);
  const segments: { x: number; width: number; terrain: Landmark["terrain"] }[] = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    const from = sorted[i];
    const to = sorted[i + 1];
    const x = mileToX(from.mileMarker);
    const width = Math.max(0, mileToX(to.mileMarker) - x);
    segments.push({ x, width, terrain: to.terrain });
  }
  return segments;
}

const SEGMENTS = buildSegments();

function TerrainDecoration({ terrain, x, width }: { terrain: Landmark["terrain"]; x: number; width: number }) {
  const marks = [0.22, 0.5, 0.78].map((f) => x + width * f).filter((mx) => mx > x + 2 && mx < x + width - 2);

  if (terrain === "mountains") {
    return (
      <>
        {marks.map((mx, i) => (
          <polygon key={i} points={`${mx - 6},${BAND_TOP + BAND_H} ${mx},${BAND_TOP + 3} ${mx + 6},${BAND_TOP + BAND_H}`} fill={TERRAIN_COLORS.mountains.accent} />
        ))}
      </>
    );
  }
  if (terrain === "forest") {
    return (
      <>
        {marks.map((mx, i) => (
          <polygon key={i} points={`${mx - 3.5},${BAND_TOP + BAND_H - 2} ${mx},${BAND_MID - 4} ${mx + 3.5},${BAND_TOP + BAND_H - 2}`} fill={TERRAIN_COLORS.forest.accent} />
        ))}
      </>
    );
  }
  if (terrain === "river") {
    return (
      <path
        d={`M${x + 4},${BAND_MID} ${marks.map((mx) => `Q${mx - width * 0.1},${BAND_MID - 5} ${mx},${BAND_MID} T${mx + width * 0.1},${BAND_MID}`).join(" ")}`}
        fill="none"
        stroke={TERRAIN_COLORS.river.accent}
        strokeWidth={2}
      />
    );
  }
  if (terrain === "desert") {
    return (
      <>
        {marks.map((mx, i) => (
          <circle key={i} cx={mx} cy={BAND_MID + (i % 2 === 0 ? -3 : 3)} r={1.6} fill={TERRAIN_COLORS.desert.accent} />
        ))}
      </>
    );
  }
  if (terrain === "hills") {
    return (
      <>
        {marks.map((mx, i) => (
          <path key={i} d={`M${mx - 6},${BAND_TOP + BAND_H - 1} Q${mx},${BAND_MID - 2} ${mx + 6},${BAND_TOP + BAND_H - 1}`} fill="none" stroke={TERRAIN_COLORS.hills.accent} strokeWidth={1.4} />
        ))}
      </>
    );
  }
  return null;
}

function LandmarkIcon({ kind }: { kind: "fort" | "fork" | "river" | "plain" }) {
  if (kind === "fort") {
    return (
      <svg viewBox="0 0 16 16" className="landmark-icon" stroke="#2a1a0f" strokeWidth="0.6" strokeLinejoin="round">
        <polygon points="8,2 14,7.5 2,7.5" />
        <rect x="3.5" y="7.5" width="9" height="6.5" />
      </svg>
    );
  }
  if (kind === "fork") {
    return (
      <svg viewBox="0 0 16 16" className="landmark-icon">
        <line x1="8" y1="14" x2="8" y2="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="8" x2="3" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="8" y1="8" x2="13" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "river") {
    return (
      <svg viewBox="0 0 16 16" className="landmark-icon">
        <path d="M1,6 Q4,2 8,6 T15,6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M1,11 Q4,7 8,11 T15,11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="landmark-icon" stroke="#2a1a0f" strokeWidth="0.6">
      <circle cx="8" cy="8" r="5" />
    </svg>
  );
}

function iconKind(lm: Landmark): "fort" | "fork" | "river" | "plain" {
  if (lm.hasFort) return "fort";
  if (lm.fork) return "fork";
  if (lm.riverCrossing) return "river";
  return "plain";
}

export default function TrailMap() {
  const mile = useGameStore((s) => s.mile);
  const route = useGameStore((s) => s.route);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const nextLandmarkId = useGameStore((s) => s.nextLandmarkId);
  const wagonType = useGameStore((s) => s.wagonType);
  const draftAnimalType = useGameStore((s) => s.draftAnimalType);
  const draftAnimalCount = useGameStore((s) => s.draftAnimalCount);
  const wagonCondition = useGameStore((s) => s.wagonCondition);
  const draftAnimalHealth = useGameStore((s) => s.draftAnimalHealth);

  const progressPct = Math.min(100, (mile / TOTAL_TRAIL_MILES) * 100);
  const current = TRAIL_BY_ID[currentLandmarkId];
  const next = nextLandmarkId ? TRAIL_BY_ID[nextLandmarkId] : null;
  const distanceToNext = next ? Math.max(0, Math.round(next.mileMarker - mile)) : null;
  const traveledX = mileToX(mile);

  return (
    <div className="trail-map">
      <div className="trail-track">
        <svg className="trail-terrain" viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} preserveAspectRatio="none">
          {SEGMENTS.map((seg, i) => (
            <rect key={i} x={seg.x} y={BAND_TOP} width={seg.width} height={BAND_H} fill={TERRAIN_COLORS[seg.terrain].base} />
          ))}
          {SEGMENTS.map((seg, i) => (
            <TerrainDecoration key={i} terrain={seg.terrain} x={seg.x} width={seg.width} />
          ))}
          {/* the worn wagon-track line: solid where traveled, faint dashed ahead */}
          <line x1={0} y1={BAND_MID} x2={traveledX} y2={BAND_MID} stroke="#4a2f18" strokeWidth={1.4} opacity={0.55} />
          <line x1={traveledX} y1={BAND_MID} x2={VIEW_W} y2={BAND_MID} stroke="#4a2f18" strokeWidth={1} opacity={0.2} strokeDasharray="3 3" />
          <rect x={0} y={BAND_TOP} width={VIEW_W} height={BAND_H} fill="none" stroke="#4a2f18" strokeWidth={1} opacity={0.3} />
        </svg>

        {TRAIL.map((lm) => {
          const pct = (lm.mileMarker / TOTAL_TRAIL_MILES) * 100;
          const visited = route.includes(lm.id);
          const isCurrent = lm.id === currentLandmarkId;
          return (
            <div
              key={lm.id}
              className={`trail-marker ${visited ? "visited" : ""} ${isCurrent ? "current" : ""} ${lm.hasFort ? "fort" : ""}`}
              style={{ left: `${pct}%` }}
              title={`${lm.name} (${TERRAIN_LABELS[lm.terrain]})`}
            >
              <LandmarkIcon kind={iconKind(lm)} />
            </div>
          );
        })}

        <div className="trail-wagon-marker" style={{ left: `${progressPct}%` }} title={`Mile ${Math.round(mile)}`}>
          <WagonRig
            wagonType={wagonType}
            draftAnimalType={draftAnimalType}
            draftAnimalCount={draftAnimalCount}
            wagonCondition={wagonCondition}
            draftAnimalHealth={draftAnimalHealth}
            width={64}
          />
        </div>
      </div>
      <div className="trail-progress-text">
        Mile {Math.round(mile)} of {TOTAL_TRAIL_MILES} — at {current?.name ?? "the trail"}
        {current && <span className="trail-terrain-tag"> ({TERRAIN_LABELS[current.terrain]})</span>}
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
