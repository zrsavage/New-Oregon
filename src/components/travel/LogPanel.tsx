import { useGameStore } from "../../state/gameStore";

export default function LogPanel() {
  const log = useGameStore((s) => s.log);
  const date = useGameStore((s) => s.date);
  const weather = useGameStore((s) => s.weather);

  return (
    <div className="panel log-panel">
      <div className="log-header">
        <h3>Trail Log</h3>
        <span className="log-date">
          {date.month}/{date.day}/{date.year} — {weather.replace("_", " ")}
        </span>
      </div>
      <div className="log-entries">
        {log.map((entry) => (
          <div key={entry.id} className={`log-entry tone-${entry.tone}`}>
            <span className="log-mile">Mi. {entry.mile}</span> {entry.text}
          </div>
        ))}
      </div>
    </div>
  );
}
