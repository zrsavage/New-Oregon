import { useGameStore } from "../../state/gameStore";
import { EVENTS_BY_ID } from "../../data/events";
import { ROLES } from "../../data/roles";
import { ITEMS } from "../../data/items";
import RiskDisplay from "../shared/RiskDisplay";

export default function EventModal() {
  const state = useGameStore();
  const pendingEvent = useGameStore((s) => s.pendingEvent);
  const lastEventNarrative = useGameStore((s) => s.lastEventNarrative);
  const resolveEvent = useGameStore((s) => s.resolveEvent);
  const clearNarratives = useGameStore((s) => s.clearNarratives);

  if (!pendingEvent && !lastEventNarrative) return null;

  if (!pendingEvent && lastEventNarrative) {
    return (
      <div className="modal-backdrop">
        <div className="modal event-modal">
          <h2>What Happened</h2>
          <p>{lastEventNarrative}</p>
          <button className="btn primary" onClick={clearNarratives}>
            Continue
          </button>
        </div>
      </div>
    );
  }

  const event = EVENTS_BY_ID[pendingEvent!];
  if (!event) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal event-modal">
        <h2>{event.title}</h2>
        <p>{event.description}</p>
        <div className="modal-choices">
          {event.choices.map((choice) => (
            <button key={choice.id} className="btn choice-btn" onClick={() => resolveEvent(choice.id)}>
              <span>{choice.label}</span>
              {(choice.requiresRole || choice.requiresItem) && (
                <span className="choice-hint">
                  {choice.requiresRole && `Best with a ${ROLES[choice.requiresRole].name}`}
                  {choice.requiresItem && `Uses ${ITEMS[choice.requiresItem]?.name ?? choice.requiresItem}`}
                </span>
              )}
              {choice.risk && <RiskDisplay assessment={choice.risk(state)} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
