import { useEffect, useRef, useState } from "react";

export type TimingDifficulty = "easy" | "medium" | "hard";

const DIFFICULTY_PARAMS: Record<TimingDifficulty, { zoneHalfWidth: number; periodMs: number }> = {
  easy: { zoneHalfWidth: 0.3, periodMs: 1500 },
  medium: { zoneHalfWidth: 0.19, periodMs: 1150 },
  hard: { zoneHalfWidth: 0.12, periodMs: 900 },
};

function triangleWave(elapsedMs: number, periodMs: number): number {
  const phase = (elapsedMs % periodMs) / periodMs;
  return phase < 0.5 ? phase * 2 : 2 - phase * 2;
}

/**
 * A small hands-on moment: a marker sweeps a track and the player clicks to
 * stop it as close to the center zone as they can. Produces a 0-100 quality
 * score that callers layer on top of their normal skill-based odds — never
 * a replacement for them, just a bit of extra agency in the moment.
 */
export default function TimingBar({
  label,
  difficulty = "medium",
  onResolve,
  allowSkip = true,
}: {
  label: string;
  difficulty?: TimingDifficulty;
  onResolve: (quality: number) => void;
  allowSkip?: boolean;
}) {
  const { zoneHalfWidth, periodMs } = DIFFICULTY_PARAMS[difficulty];
  const markerRef = useRef<HTMLDivElement | null>(null);
  const posRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const [stopped, setStopped] = useState(false);

  useEffect(() => {
    function tick(t: number) {
      if (startRef.current === null) startRef.current = t;
      const elapsed = t - startRef.current;
      const pos = triangleWave(elapsed, periodMs);
      posRef.current = pos;
      if (markerRef.current) markerRef.current.style.left = `${pos * 100}%`;
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [periodMs]);

  function stop(quality: number) {
    if (stopped) return;
    setStopped(true);
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    onResolve(quality);
  }

  function handleStop() {
    const dist = Math.abs(posRef.current - 0.5);
    const quality = Math.round(Math.max(0, 100 * (1 - dist / zoneHalfWidth)));
    stop(quality);
  }

  const zoneLeftPct = (0.5 - zoneHalfWidth) * 100;
  const zoneWidthPct = zoneHalfWidth * 2 * 100;

  return (
    <div className="timing-bar">
      <p className="timing-bar-label">{label}</p>
      <div className="timing-bar-track" onClick={handleStop}>
        <div className="timing-bar-zone" style={{ left: `${zoneLeftPct}%`, width: `${zoneWidthPct}%` }} />
        <div ref={markerRef} className="timing-bar-marker" style={{ left: "0%" }} />
      </div>
      <div className="timing-bar-actions">
        <button className="btn primary" onClick={handleStop} disabled={stopped}>
          Stop!
        </button>
        {allowSkip && (
          <button className="btn small" onClick={() => stop(50)} disabled={stopped}>
            Skip (average result)
          </button>
        )}
      </div>
    </div>
  );
}
