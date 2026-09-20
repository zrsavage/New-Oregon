import { useGameStore } from "../../state/gameStore";

const PARTICLE_COUNT = 28;

/** A lightweight, purely decorative CSS particle overlay for rain/snow weather. */
export default function WeatherFX() {
  const weather = useGameStore((s) => s.weather);

  const kind = weather === "rain" || weather === "storm" ? "rain" : weather === "snow" || weather === "blizzard" ? "snow" : null;
  if (!kind) return null;

  const intensity = weather === "storm" || weather === "blizzard" ? "heavy" : "light";

  return (
    <div className={`weather-fx ${kind} ${intensity}`} aria-hidden="true">
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <span
          key={i}
          className="weather-particle"
          style={{
            left: `${(i * 137.5) % 100}%`,
            animationDelay: `${(i % 10) * 0.3}s`,
            animationDuration: `${2 + (i % 5) * 0.4}s`,
          }}
        />
      ))}
    </div>
  );
}
