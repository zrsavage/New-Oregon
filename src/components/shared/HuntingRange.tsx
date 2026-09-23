import { useEffect, useRef, useState } from "react";
import type { TerrainType } from "../../types/game";
import { TERRAIN_COLORS } from "../../systems/visuals";

export type HuntAnimalId = "small_game" | "deer" | "big_game";

const VIEW_W = 640;
const VIEW_H = 200;
const GROUND_Y = 158;
const MARGIN = 50;

interface AnimalConfig {
  periodMs: number; // how fast it crosses the field — lower is faster/harder
  hitRadius: number; // how forgiving a shot can be and still land clean
  scale: number;
  color: string;
  darkColor: string;
  timeLimitMs: number;
}

const ANIMAL_CONFIG: Record<HuntAnimalId, AnimalConfig> = {
  small_game: { periodMs: 1550, hitRadius: 30, scale: 0.68, color: "#a3814f", darkColor: "#6b5330", timeLimitMs: 6200 },
  deer: { periodMs: 2000, hitRadius: 34, scale: 1, color: "#b3814a", darkColor: "#795a30", timeLimitMs: 4800 },
  big_game: { periodMs: 2500, hitRadius: 27, scale: 1.5, color: "#5c4530", darkColor: "#382a1c", timeLimitMs: 3800 },
};

const ANIMAL_LABELS: Record<HuntAnimalId, string> = {
  small_game: "a rabbit",
  deer: "a deer",
  big_game: "a bison",
};

function triangleWave(elapsedMs: number, periodMs: number): number {
  const phase = (elapsedMs % periodMs) / periodMs;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

/** A running rabbit/deer/bison silhouette, built from the same simple procedural shapes as the rest of the game's art. */
function AnimalSilhouette({ kind, color, darkColor }: { kind: HuntAnimalId; color: string; darkColor: string }) {
  if (kind === "small_game") {
    return (
      <g className="hunt-animal-body">
        <ellipse cx={0} cy={-8} rx={11} ry={7} fill={color} stroke={darkColor} strokeWidth={1} />
        <circle cx={9} cy={-13} r={4.5} fill={color} stroke={darkColor} strokeWidth={1} />
        <line x1={7} y1={-17} x2={5} y2={-25} stroke={darkColor} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={11} y1={-17} x2={11} y2={-26} stroke={darkColor} strokeWidth={1.6} strokeLinecap="round" />
        <line x1={-8} y1={-3} x2={-10} y2={4} stroke={darkColor} strokeWidth={2} strokeLinecap="round" />
        <line x1={-2} y1={-2} x2={-3} y2={5} stroke={darkColor} strokeWidth={2} strokeLinecap="round" />
        <line x1={6} y1={-2} x2={8} y2={5} stroke={darkColor} strokeWidth={2} strokeLinecap="round" />
        <circle cx={-9} cy={-8} r={2.6} fill={color} stroke={darkColor} strokeWidth={1} />
      </g>
    );
  }
  if (kind === "deer") {
    return (
      <g className="hunt-animal-body">
        <ellipse cx={0} cy={-16} rx={14} ry={8} fill={color} stroke={darkColor} strokeWidth={1} />
        <line x1={12} y1={-20} x2={19} y2={-28} stroke={color} strokeWidth={5} strokeLinecap="round" />
        <circle cx={20} cy={-29} r={4} fill={color} stroke={darkColor} strokeWidth={1} />
        <line x1={22} y1={-33} x2={20} y2={-40} stroke={darkColor} strokeWidth={1.3} strokeLinecap="round" />
        <line x1={22} y1={-33} x2={26} y2={-38} stroke={darkColor} strokeWidth={1.3} strokeLinecap="round" />
        <line x1={-11} y1={-9} x2={-13} y2={4} stroke={darkColor} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={-4} y1={-8} x2={-6} y2={5} stroke={darkColor} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={4} y1={-8} x2={7} y2={5} stroke={darkColor} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={10} y1={-9} x2={13} y2={4} stroke={darkColor} strokeWidth={2.2} strokeLinecap="round" />
        <line x1={-14} y1={-18} x2={-19} y2={-14} stroke={darkColor} strokeWidth={1.6} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g className="hunt-animal-body">
      <ellipse cx={0} cy={-16} rx={20} ry={11} fill={color} stroke={darkColor} strokeWidth={1} />
      <path d={`M -14,-24 Q -4,-34 8,-25`} fill={color} stroke={darkColor} strokeWidth={1} />
      <circle cx={19} cy={-16} r={7} fill={color} stroke={darkColor} strokeWidth={1} />
      <line x1={16} y1={-21} x2={13} y2={-27} stroke={darkColor} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={22} y1={-21} x2={24} y2={-27} stroke={darkColor} strokeWidth={1.6} strokeLinecap="round" />
      <line x1={-15} y1={-7} x2={-16} y2={4} stroke={darkColor} strokeWidth={3} strokeLinecap="round" />
      <line x1={-5} y1={-6} x2={-6} y2={5} stroke={darkColor} strokeWidth={3} strokeLinecap="round" />
      <line x1={6} y1={-6} x2={8} y2={5} stroke={darkColor} strokeWidth={3} strokeLinecap="round" />
      <line x1={15} y1={-7} x2={17} y2={4} stroke={darkColor} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
}

/**
 * A real aim-and-shoot hunting scene: an animal runs back and forth across
 * the field, the player tracks it with a reticle and taps/clicks to fire
 * (Pointer Events, so a dragging finger works the same as a moving mouse).
 * Quality (0-100) comes from how close the shot lands to the animal's
 * actual position at the moment of firing — never a substitute for the
 * underlying skill-based hit/miss roll, just how clean a hit it was.
 */
export default function HuntingRange({
  animalId,
  terrain,
  onResolve,
  allowSkip = true,
}: {
  animalId: HuntAnimalId;
  terrain?: TerrainType;
  onResolve: (quality: number) => void;
  allowSkip?: boolean;
}) {
  const config = ANIMAL_CONFIG[animalId];
  const svgRef = useRef<SVGSVGElement | null>(null);
  const animalGroupRef = useRef<SVGGElement | null>(null);
  const reticleRef = useRef<SVGGElement | null>(null);
  const timerFillRef = useRef<HTMLDivElement | null>(null);
  const animalPos = useRef({ x: VIEW_W / 2, y: GROUND_Y });
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const resolveTimeoutRef = useRef<number | null>(null);
  const [stopped, setStopped] = useState(false);
  const [outcome, setOutcome] = useState<"hit" | "miss" | null>(null);
  const [shotMarker, setShotMarker] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function tick(t: number) {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const wave = triangleWave(elapsed, config.periodMs);
      const x = MARGIN + wave * (VIEW_W - MARGIN * 2);
      const y = GROUND_Y + Math.sin(elapsed / 140) * 3;
      animalPos.current = { x, y };
      if (animalGroupRef.current) {
        animalGroupRef.current.setAttribute("transform", `translate(${x}, ${y}) scale(${config.scale})`);
      }
      if (timerFillRef.current) {
        const remaining = Math.max(0, 1 - elapsed / config.timeLimitMs);
        timerFillRef.current.style.width = `${remaining * 100}%`;
      }
      if (elapsed >= config.timeLimitMs) {
        fire(null);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      if (resolveTimeoutRef.current !== null) window.clearTimeout(resolveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  function svgPoint(clientX: number, clientY: number): { x: number; y: number } | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = pt.matrixTransform(ctm.inverse());
    return { x: local.x, y: local.y };
  }

  function updateReticle(clientX: number, clientY: number) {
    const p = svgPoint(clientX, clientY);
    if (p && reticleRef.current) {
      reticleRef.current.setAttribute("transform", `translate(${p.x}, ${p.y})`);
      reticleRef.current.style.opacity = "1";
    }
  }

  // Pointer Events unify mouse, touch, and pen: move (or drag a finger) to
  // aim, release to fire. Capturing the pointer on press keeps aiming
  // working even if a dragging finger strays outside the scene's bounds.
  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (stopped) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    updateReticle(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (stopped) return;
    updateReticle(e.clientX, e.clientY);
  }

  function fire(clickPoint: { x: number; y: number } | null) {
    if (stopped) return;
    setStopped(true);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    const target = animalPos.current;
    const bodyCenter = { x: target.x, y: target.y - 14 * config.scale };
    const shot = clickPoint ?? { x: target.x + config.hitRadius * 2, y: target.y }; // a wild, off-target panic shot
    const dist = Math.hypot(shot.x - bodyCenter.x, shot.y - bodyCenter.y);
    const quality = Math.round(Math.max(0, Math.min(100, 100 * (1 - dist / (config.hitRadius * config.scale)))));

    setShotMarker(shot);
    setOutcome(quality > 15 ? "hit" : "miss");

    resolveTimeoutRef.current = window.setTimeout(() => onResolve(quality), 450);
  }

  function skip() {
    if (stopped) return;
    setStopped(true);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    setShotMarker(animalPos.current);
    setOutcome("hit");
    resolveTimeoutRef.current = window.setTimeout(() => onResolve(50), 300);
  }

  function handlePointerUp(e: React.PointerEvent<SVGSVGElement>) {
    const p = svgPoint(e.clientX, e.clientY);
    if (p) fire(p);
  }

  const sky = terrain ? TERRAIN_COLORS[terrain] : { base: "#cdd9a0", accent: "#a9bb72" };

  return (
    <div className="hunting-range">
      <div className="hunting-range-timer">
        <div ref={timerFillRef} className="hunting-range-timer-fill" style={{ width: "100%" }} />
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="hunting-range-scene"
        onPointerDown={stopped ? undefined : handlePointerDown}
        onPointerMove={stopped ? undefined : handlePointerMove}
        onPointerUp={stopped ? undefined : handlePointerUp}
        onPointerLeave={() => {
          if (reticleRef.current) reticleRef.current.style.opacity = "0";
        }}
        role="img"
        aria-label={`Hunting scene: track and shoot ${ANIMAL_LABELS[animalId]}`}
      >
        <rect x={0} y={0} width={VIEW_W} height={GROUND_Y} fill="#dce6c4" />
        <rect x={0} y={GROUND_Y} width={VIEW_W} height={VIEW_H - GROUND_Y} fill={sky.base} />
        <line x1={0} y1={GROUND_Y} x2={VIEW_W} y2={GROUND_Y} stroke={sky.accent} strokeWidth={2} />

        <g ref={animalGroupRef} className="hunting-range-animal">
          <AnimalSilhouette kind={animalId} color={config.color} darkColor={config.darkColor} />
        </g>

        {shotMarker && (
          <g transform={`translate(${shotMarker.x}, ${shotMarker.y})`} className={`hunt-shot-marker ${outcome}`}>
            <line x1={-8} y1={-8} x2={8} y2={8} strokeWidth={2.4} strokeLinecap="round" />
            <line x1={-8} y1={8} x2={8} y2={-8} strokeWidth={2.4} strokeLinecap="round" />
          </g>
        )}

        {!stopped && (
          <g ref={reticleRef} className="hunting-reticle" style={{ opacity: 0 }}>
            <circle r={13} fill="none" strokeWidth={1.6} />
            <line x1={-18} y1={0} x2={-6} y2={0} strokeWidth={1.6} />
            <line x1={6} y1={0} x2={18} y2={0} strokeWidth={1.6} />
            <line x1={0} y1={-18} x2={0} y2={-6} strokeWidth={1.6} />
            <line x1={0} y1={6} x2={0} y2={18} strokeWidth={1.6} />
          </g>
        )}
      </svg>

      <p className="hunting-range-hint">
        {stopped
          ? outcome === "hit"
            ? "Shot fired — a clean hit!"
            : "Shot fired — that one went wide."
          : `Track ${ANIMAL_LABELS[animalId]} — aim, then tap or click to fire before it gets spooked.`}
      </p>

      {allowSkip && !stopped && (
        <div className="timing-bar-actions">
          <button className="btn small" onClick={skip}>
            Skip (average result)
          </button>
        </div>
      )}
    </div>
  );
}
