import type { DraftAnimalId, WagonTypeId } from "../../types/game";

const GROUND_Y = 44;
const VIEW_H = 56;

interface AnimalParams {
  bodyRx: number;
  bodyRy: number;
  bodyCy: number;
  headR: number;
  headCx: number;
  headCy: number;
  color: string;
  darkColor: string;
}

const ANIMAL_PARAMS: Record<DraftAnimalId, AnimalParams> = {
  oxen: { bodyRx: 12, bodyRy: 8.5, bodyCy: GROUND_Y - 12, headR: 6, headCx: 26, headCy: GROUND_Y - 15, color: "#6b4a2f", darkColor: "#4d341f" },
  horses: { bodyRx: 10, bodyRy: 7.5, bodyCy: GROUND_Y - 15, headR: 5, headCx: 25, headCy: GROUND_Y - 21, color: "#8a5a2b", darkColor: "#5c3c1c" },
  mules: { bodyRx: 10.5, bodyRy: 7.5, bodyCy: GROUND_Y - 13, headR: 5.5, headCx: 25, headCy: GROUND_Y - 17, color: "#7a7266", darkColor: "#57514a" },
};

function AnimalShape({ kind, healthy }: { kind: DraftAnimalId; healthy: boolean }) {
  const p = ANIMAL_PARAMS[kind];
  const bodyCx = 14;
  const headCy = healthy ? p.headCy : p.headCy + 4;
  const legTopY = p.bodyCy + p.bodyRy - 2;

  return (
    <g>
      {/* legs */}
      <line x1={bodyCx - 6} y1={legTopY} x2={bodyCx - 6} y2={GROUND_Y} stroke={p.darkColor} strokeWidth={2.2} strokeLinecap="round" />
      <line x1={bodyCx + 5} y1={legTopY} x2={bodyCx + 5} y2={GROUND_Y} stroke={p.darkColor} strokeWidth={2.2} strokeLinecap="round" />
      {/* tail */}
      <line x1={bodyCx - p.bodyRx} y1={p.bodyCy} x2={bodyCx - p.bodyRx - 4} y2={p.bodyCy + 8} stroke={p.darkColor} strokeWidth={1.6} strokeLinecap="round" />
      {/* neck bridge (helps horses/mules read as connected) */}
      <line x1={bodyCx + p.bodyRx - 4} y1={p.bodyCy - 2} x2={p.headCx - 2} y2={headCy + 2} stroke={p.color} strokeWidth={6} strokeLinecap="round" />
      {/* body */}
      <ellipse cx={bodyCx} cy={p.bodyCy} rx={p.bodyRx} ry={p.bodyRy} fill={p.color} stroke={p.darkColor} strokeWidth={1} />
      {/* head */}
      <circle cx={p.headCx} cy={headCy} r={p.headR} fill={p.color} stroke={p.darkColor} strokeWidth={1} />

      {kind === "oxen" && (
        <>
          <line x1={p.headCx - 3} y1={headCy - p.headR + 1} x2={p.headCx - 6} y2={headCy - p.headR - 4} stroke={p.darkColor} strokeWidth={1.6} strokeLinecap="round" />
          <line x1={p.headCx + 3} y1={headCy - p.headR + 1} x2={p.headCx + 6} y2={headCy - p.headR - 4} stroke={p.darkColor} strokeWidth={1.6} strokeLinecap="round" />
        </>
      )}
      {kind === "horses" && healthy && (
        <>
          <line x1={p.headCx - 2} y1={headCy - p.headR} x2={p.headCx - 4} y2={headCy - p.headR - 4} stroke={p.darkColor} strokeWidth={1.4} strokeLinecap="round" />
          <line x1={p.headCx + 1} y1={headCy - p.headR - 1} x2={p.headCx} y2={headCy - p.headR - 5} stroke={p.darkColor} strokeWidth={1.4} strokeLinecap="round" />
        </>
      )}
      {kind === "mules" && (
        <>
          <ellipse cx={p.headCx - 2} cy={headCy - p.headR - 2} rx={1.8} ry={4.5} fill={p.color} transform={`rotate(-25 ${p.headCx - 2} ${headCy - p.headR - 2})`} />
          <ellipse cx={p.headCx + 3} cy={headCy - p.headR - 2} rx={1.8} ry={4.5} fill={p.color} transform={`rotate(25 ${p.headCx + 3} ${headCy - p.headR - 2})`} />
        </>
      )}
    </g>
  );
}

interface WagonParams {
  bodyW: number;
  bodyH: number;
  coverH: number;
  wheelR: number;
}

const WAGON_PARAMS: Record<WagonTypeId, WagonParams> = {
  light: { bodyW: 46, bodyH: 20, coverH: 11, wheelR: 10 },
  standard: { bodyW: 60, bodyH: 24, coverH: 14, wheelR: 12 },
  heavy: { bodyW: 76, bodyH: 28, coverH: 17, wheelR: 14 },
};

function Wheel({ cx, r }: { cx: number; r: number }) {
  const cy = GROUND_Y - r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#3a2a1a" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={2} fill="#3a2a1a" />
      {[0, 72, 144, 216, 288].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1={cx}
            y1={cy}
            x2={cx + Math.cos(rad) * (r - 1.5)}
            y2={cy + Math.sin(rad) * (r - 1.5)}
            stroke="#3a2a1a"
            strokeWidth={1.3}
          />
        );
      })}
    </g>
  );
}

function WagonBody({ type, condition }: { type: WagonTypeId; condition: number }) {
  const w = WAGON_PARAMS[type];
  const bodyBottomY = GROUND_Y - w.wheelR;
  const bodyTopY = bodyBottomY - w.bodyH;
  const worn = condition < 70;
  const damaged = condition < 40;
  const coverFill = damaged ? "#c9b98f" : "#f4ecd8";

  return (
    <g>
      <Wheel cx={14} r={w.wheelR} />
      <Wheel cx={w.bodyW - 12} r={w.wheelR} />

      {/* bed */}
      <rect x={0} y={bodyTopY} width={w.bodyW} height={w.bodyH} rx={2} fill="#6b4423" stroke="#4a2f18" strokeWidth={1} />

      {/* canvas cover */}
      <path
        d={`M0,${bodyTopY} Q${w.bodyW / 2},${bodyTopY - w.coverH} ${w.bodyW},${bodyTopY} Z`}
        fill={coverFill}
        stroke="#a9986c"
        strokeWidth={0.8}
      />

      {worn && !damaged && (
        <rect
          x={w.bodyW * 0.36}
          y={bodyTopY - w.coverH * 0.55}
          width={w.bodyW * 0.16}
          height={w.coverH * 0.4}
          rx={1}
          fill="#d8c49a"
          transform={`rotate(-6 ${w.bodyW * 0.44} ${bodyTopY - w.coverH * 0.4})`}
        />
      )}

      {damaged && (
        <>
          <polyline
            points={`${w.bodyW * 0.55},${bodyTopY - w.coverH * 0.7} ${w.bodyW * 0.62},${bodyTopY - w.coverH * 0.45} ${w.bodyW * 0.58},${bodyTopY - w.coverH * 0.3} ${w.bodyW * 0.68},${bodyTopY - w.coverH * 0.15}`}
            fill="none"
            stroke="#8a7550"
            strokeWidth={1}
          />
          <ellipse cx={10} cy={GROUND_Y - 1.5} rx={3.2} ry={1.4} fill="#4a2f18" opacity={0.55} />
          <ellipse cx={w.bodyW - 16} cy={GROUND_Y - 1.5} rx={3} ry={1.3} fill="#4a2f18" opacity={0.55} />
        </>
      )}

      {type === "heavy" && (
        <>
          <rect x={w.bodyW * 0.32} y={bodyTopY - w.coverH - 5} width={9} height={7} fill="#8b5e34" stroke="#4a2f18" strokeWidth={0.8} />
          <rect x={w.bodyW * 0.55} y={bodyTopY - w.coverH - 4} width={8} height={6} fill="#7a5027" stroke="#4a2f18" strokeWidth={0.8} />
        </>
      )}
    </g>
  );
}

export default function WagonRig({
  wagonType,
  draftAnimalType,
  draftAnimalCount,
  wagonCondition,
  draftAnimalHealth,
  width = 240,
  className,
}: {
  wagonType: WagonTypeId;
  draftAnimalType: DraftAnimalId;
  draftAnimalCount: number;
  wagonCondition: number;
  draftAnimalHealth: number;
  width?: number;
  className?: string;
}) {
  const shownCount = Math.max(1, Math.min(draftAnimalCount, 6));
  const extra = draftAnimalCount - shownCount;
  const spacing = 30;
  const animalsWidth = shownCount * spacing + 6;
  const gap = 14;
  const wagon = WAGON_PARAMS[wagonType];
  // Animals lead (face forward, toward increasing x) with the wagon trailing
  // behind them — not the other way around, or they'd appear to be walking
  // into the back of the wagon instead of pulling it.
  const animalsX = wagon.bodyW + gap;
  const totalWidth = animalsX + animalsWidth;
  const healthy = draftAnimalHealth >= 40;

  return (
    <svg
      viewBox={`0 0 ${totalWidth} ${VIEW_H}`}
      width={width}
      height={(width * VIEW_H) / totalWidth}
      className={`wagon-rig ${className ?? ""}`}
      role="img"
      aria-label={`${wagonType} wagon pulled by ${draftAnimalCount} ${draftAnimalType}`}
    >
      <line x1={0} y1={GROUND_Y} x2={totalWidth} y2={GROUND_Y} className="wagon-rig-ground" />
      <line x1={wagon.bodyW - 2} y1={GROUND_Y - 18} x2={animalsX + 2} y2={GROUND_Y - 18} className="wagon-rig-harness" />
      <g transform="translate(0, 0)">
        <WagonBody type={wagonType} condition={wagonCondition} />
      </g>
      {Array.from({ length: shownCount }).map((_, i) => {
        const jitter = ((i * 53) % 7) - 3;
        return (
          <g key={i} transform={`translate(${animalsX + i * spacing}, 0) rotate(${jitter} 14 ${GROUND_Y - 8})`}>
            <AnimalShape kind={draftAnimalType} healthy={healthy} />
          </g>
        );
      })}
      {extra > 0 && (
        <text x={totalWidth - 2} y={VIEW_H - 2} textAnchor="end" className="wagon-rig-extra">
          +{extra} more
        </text>
      )}
    </svg>
  );
}
