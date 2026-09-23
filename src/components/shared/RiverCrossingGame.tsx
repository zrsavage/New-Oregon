import { useEffect, useRef, useState } from "react";
import type { RiverCrossing } from "../../types/game";
import { crossingSeverity } from "../../systems/river";

export type SteerableCrossingMethod = "ford" | "caulk_float";

const VIEW_W = 640;
const VIEW_H = 260;
const MARGIN_X = 46;
const BAND_TOP = 40;
const BAND_BOTTOM = 220;
const WAGON_RADIUS = 15;

interface Rock {
  id: number;
  x: number;
  y: number;
  radius: number;
  resolved: boolean;
  hit: boolean;
}

function buildRocks(count: number): Rock[] {
  const rocks: Rock[] = [];
  const startX = MARGIN_X + 70;
  const endX = VIEW_W - MARGIN_X - 40;
  const span = endX - startX;
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x = startX + t * span + (Math.random() - 0.5) * (span / count) * 0.5;
    const y = BAND_TOP + 24 + Math.random() * (BAND_BOTTOM - BAND_TOP - 48);
    rocks.push({ id: i, x, y, radius: 15, resolved: false, hit: false });
  }
  return rocks;
}

function WagonIcon() {
  return (
    <g className="river-wagon-icon">
      <path d="M -13,-4 Q 0,-19 13,-4 Z" fill="#f4ecd8" stroke="#a9986c" strokeWidth={0.8} />
      <rect x={-13} y={-4} width={26} height={11} rx={2} fill="#6b4423" stroke="#4a2f18" strokeWidth={1} />
      <circle cx={-8} cy={8} r={3} fill="none" stroke="#3a2a1a" strokeWidth={1.6} />
      <circle cx={8} cy={8} r={3} fill="none" stroke="#3a2a1a" strokeWidth={1.6} />
    </g>
  );
}

const METHOD_COPY: Record<SteerableCrossingMethod, { verb: string; hint: string; obstacle: string }> = {
  ford: {
    verb: "Ford",
    hint: "Steer the wagon — move your mouse or drag your finger — to weave around the submerged rocks before you reach the far bank.",
    obstacle: "rock",
  },
  caulk_float: {
    verb: "Float",
    hint: "Keep the sealed wagon steady — move your mouse or drag your finger — to dodge the drifting logs as the current pulls you across.",
    obstacle: "log",
  },
};

/**
 * A real steering mini-game for ford/caulk-float crossings: the wagon
 * auto-advances across the river while the player controls its vertical
 * position to dodge obstacles. Quality (0-100) is the fraction of
 * obstacles cleanly avoided, feeding the same quality-adjusted danger
 * chance as before — it never overrides the underlying skill-based roll.
 */
export default function RiverCrossingGame({
  method,
  crossing,
  onResolve,
  allowSkip = true,
}: {
  method: SteerableCrossingMethod;
  crossing: RiverCrossing;
  onResolve: (quality: number) => void;
  allowSkip?: boolean;
}) {
  const severity = crossingSeverity(crossing);
  const rockCount = Math.max(3, Math.min(6, Math.round(3 + severity / 12)));
  const timeLimitMs = Math.max(4200, Math.round(7200 - severity * 45));
  const hitRadius = method === "ford" ? 20 : 24;
  const copy = METHOD_COPY[method];

  const svgRef = useRef<SVGSVGElement | null>(null);
  const wagonGroupRef = useRef<SVGGElement | null>(null);
  const timerFillRef = useRef<HTMLDivElement | null>(null);
  const wagonState = useRef({ x: MARGIN_X, y: (BAND_TOP + BAND_BOTTOM) / 2, targetY: (BAND_TOP + BAND_BOTTOM) / 2 });
  const rocksLiveRef = useRef<Rock[]>([]);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const resolveTimeoutRef = useRef<number | null>(null);
  const [rocks, setRocks] = useState<Rock[]>(() => buildRocks(rockCount));
  const [stopped, setStopped] = useState(false);
  const [outcome, setOutcome] = useState<"clean" | "rough" | null>(null);

  useEffect(() => {
    rocksLiveRef.current = rocks.map((r) => ({ ...r }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function finish() {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      const live = rocksLiveRef.current;
      const total = live.length;
      const passed = live.filter((r) => r.resolved && !r.hit).length;
      const quality = total === 0 ? 100 : Math.round((passed / total) * 100);
      setStopped(true);
      setOutcome(quality >= 60 ? "clean" : "rough");
      setRocks(live.map((r) => ({ ...r })));
      resolveTimeoutRef.current = window.setTimeout(() => onResolve(quality), 500);
    }

    function tick(t: number) {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const progress = Math.min(1, elapsed / timeLimitMs);

      const w = wagonState.current;
      w.x = MARGIN_X + progress * (VIEW_W - MARGIN_X * 2);
      w.y += (w.targetY - w.y) * 0.15;
      if (wagonGroupRef.current) {
        wagonGroupRef.current.setAttribute("transform", `translate(${w.x}, ${w.y})`);
      }
      if (timerFillRef.current) {
        timerFillRef.current.style.width = `${Math.max(0, (1 - progress) * 100)}%`;
      }

      let changed = false;
      for (const rock of rocksLiveRef.current) {
        if (rock.resolved) continue;
        if (w.x >= rock.x) {
          const dist = Math.abs(w.y - rock.y);
          rock.resolved = true;
          rock.hit = dist < hitRadius + WAGON_RADIUS;
          changed = true;
        }
      }
      if (changed) setRocks(rocksLiveRef.current.map((r) => ({ ...r })));

      if (progress >= 1) {
        finish();
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
  }, [method, timeLimitMs, hitRadius]);

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

  function steerTo(clientX: number, clientY: number) {
    const p = svgPoint(clientX, clientY);
    if (!p) return;
    wagonState.current.targetY = Math.max(BAND_TOP + 10, Math.min(BAND_BOTTOM - 10, p.y));
  }

  // Pointer Events unify mouse, touch, and pen into one handler. Capturing
  // the pointer on press keeps steering working even if a dragging finger
  // strays outside the scene's bounds, and positions the wagon immediately
  // on first touch instead of waiting for the finger to move.
  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (stopped) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    steerTo(e.clientX, e.clientY);
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    steerTo(e.clientX, e.clientY);
  }

  function skip() {
    if (stopped) return;
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    setStopped(true);
    setOutcome("clean");
    resolveTimeoutRef.current = window.setTimeout(() => onResolve(50), 300);
  }

  return (
    <div className="river-crossing-game">
      <div className="hunting-range-timer">
        <div ref={timerFillRef} className="hunting-range-timer-fill" style={{ width: "100%" }} />
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="river-crossing-scene"
        onPointerDown={stopped ? undefined : handlePointerDown}
        onPointerMove={stopped ? undefined : handlePointerMove}
        role="img"
        aria-label={`River crossing scene: steer the wagon to dodge ${copy.obstacle}s`}
      >
        <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#a9c9d9" />
        <rect x={0} y={0} width={MARGIN_X + 20} height={VIEW_H} fill="#cdd9a0" />
        <rect x={VIEW_W - MARGIN_X - 20} y={0} width={MARGIN_X + 20} height={VIEW_H} fill="#cdd9a0" />
        {[0.2, 0.4, 0.6, 0.8].map((f) => (
          <path
            key={f}
            d={`M ${MARGIN_X},${BAND_TOP + f * (BAND_BOTTOM - BAND_TOP)} Q ${VIEW_W / 2},${
              BAND_TOP + f * (BAND_BOTTOM - BAND_TOP) - 10
            } ${VIEW_W - MARGIN_X},${BAND_TOP + f * (BAND_BOTTOM - BAND_TOP)}`}
            fill="none"
            stroke="#7fa8bc"
            strokeWidth={1.5}
            opacity={0.6}
          />
        ))}

        {rocks.map((rock) => (
          <g
            key={rock.id}
            transform={`translate(${rock.x}, ${rock.y})`}
            className={`river-obstacle ${rock.resolved ? (rock.hit ? "hit" : "passed") : ""}`}
          >
            <ellipse rx={rock.radius} ry={rock.radius * 0.75} fill={method === "ford" ? "#8a8578" : "#7a5a34"} stroke="#4a2f18" strokeWidth={1} />
            {rock.resolved && !rock.hit && <path d="M -5,0 L -1,5 L 6,-6" stroke="var(--good)" strokeWidth={2.2} fill="none" strokeLinecap="round" />}
            {rock.resolved && rock.hit && (
              <g stroke="var(--danger)" strokeWidth={2.2} strokeLinecap="round">
                <line x1={-6} y1={-6} x2={6} y2={6} />
                <line x1={-6} y1={6} x2={6} y2={-6} />
              </g>
            )}
          </g>
        ))}

        <g ref={wagonGroupRef} className="river-wagon-group">
          <WagonIcon />
        </g>
      </svg>

      <p className="hunting-range-hint">
        {stopped
          ? outcome === "clean"
            ? "You make it across in good order."
            : "A rough crossing — the current had its way with you."
          : copy.hint}
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
