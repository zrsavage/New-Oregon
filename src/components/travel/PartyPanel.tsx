import { useGameStore } from "../../state/gameStore";
import { ROLES } from "../../data/roles";

const STATUS_LABEL: Record<string, string> = {
  healthy: "Healthy",
  fatigued: "Fatigued",
  sick: "Sick",
  injured: "Injured",
  gravely_ill: "Gravely Ill",
  dead: "Deceased",
};

export default function PartyPanel() {
  const party = useGameStore((s) => s.party);

  return (
    <div className="panel party-panel">
      <h3>Party</h3>
      <div className="party-compact-list">
        {party.map((c) => (
          <div key={c.id} className={`party-compact-row status-${c.status}`}>
            <div className="party-compact-name">
              {c.name}
              {c.isLeader ? " (You)" : ""}
              <span className="party-compact-role">{ROLES[c.role].name}</span>
            </div>
            <div className="bar-track" title={`Health ${Math.round(c.health)}`}>
              <div className="bar-fill health" style={{ width: `${c.health}%` }} />
            </div>
            <div className="bar-track" title={`Morale ${Math.round(c.morale)}`}>
              <div className="bar-fill morale" style={{ width: `${c.morale}%` }} />
            </div>
            <div className="party-compact-status">
              {STATUS_LABEL[c.status]}
              {c.ailment ? ` (${c.ailment.replace("_", " ")})` : ""}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
