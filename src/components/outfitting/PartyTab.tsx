import { useGameStore } from "../../state/gameStore";
import { ROLES } from "../../data/roles";
import { TRAITS } from "../../data/traits";
import PartyAvatar from "../shared/PartyAvatar";

export default function PartyTab() {
  const party = useGameStore((s) => s.party);
  const hirePool = useGameStore((s) => s.hirePool);
  const hireCandidate = useGameStore((s) => s.hireCandidate);
  const dismissPartyMember = useGameStore((s) => s.dismissPartyMember);
  const refreshHirePool = useGameStore((s) => s.refreshHirePool);

  return (
    <div className="outfit-tab">
      <h3>Your Party ({party.length})</h3>
      <div className="party-list">
        {party.map((c) => (
          <div key={c.id} className="party-row">
            <PartyAvatar character={c} size={44} />
            <div className="party-row-info">
              <strong>{c.name}</strong> — {ROLES[c.role].name}
              {c.isLeader && <span className="tag">Leader</span>}
              {c.isFamily && !c.isLeader && <span className="tag">Family</span>}
              <div className="party-sub">
                Age {c.age} · Skill {c.skillLevel} · Wage ${c.wage}/wk
                {c.traits.length > 0 && (
                  <> · {c.traits.map((t) => TRAITS[t].name).join(", ")}</>
                )}
              </div>
            </div>
            {!c.isLeader && (
              <button className="btn small danger" onClick={() => dismissPartyMember(c.id)}>
                Leave Behind
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="hire-header">
        <h3>Hire Hands</h3>
        <button className="btn small" onClick={refreshHirePool}>
          Find New Candidates
        </button>
      </div>
      <p className="hint">Hired hands earn a weekly wage, paid from your cash on hand.</p>
      <div className="party-list">
        {hirePool.map((c) => (
          <div key={c.id} className="party-row">
            <PartyAvatar character={c} size={44} />
            <div className="party-row-info">
              <strong>{c.name}</strong> — {ROLES[c.role].name}
              <div className="party-sub">
                Age {c.age} · Skill {c.skillLevel} · Wage ${c.wage}/wk
                {c.traits.length > 0 && (
                  <> · {c.traits.map((t) => TRAITS[t].name).join(", ")}</>
                )}
              </div>
              <div className="party-role-desc">{ROLES[c.role].description}</div>
            </div>
            <button className="btn small" onClick={() => hireCandidate(c.id)}>
              Hire
            </button>
          </div>
        ))}
        {hirePool.length === 0 && <p className="hint">No candidates available. Try finding new ones.</p>}
      </div>
    </div>
  );
}
