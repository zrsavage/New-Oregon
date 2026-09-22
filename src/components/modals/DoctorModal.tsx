import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { sickPartyMembers } from "../../systems/doctoring";
import { getItemQty } from "../../systems/mutators";
import TimingBar from "../shared/TimingBar";

export default function DoctorModal() {
  const state = useGameStore();
  const pendingDoctor = useGameStore((s) => s.pendingDoctor);
  const closeDoctor = useGameStore((s) => s.closeDoctor);
  const resolveDoctorChoice = useGameStore((s) => s.resolveDoctorChoice);
  const lastDoctorNarrative = useGameStore((s) => s.lastDoctorNarrative);
  const clearNarratives = useGameStore((s) => s.clearNarratives);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);

  if (!pendingDoctor && !lastDoctorNarrative) return null;

  if (lastDoctorNarrative) {
    return (
      <div className="modal-backdrop">
        <div className="modal doctor-modal">
          <h2>Treating the Sick</h2>
          <p>{lastDoctorNarrative}</p>
          <button
            className="btn primary"
            onClick={() => {
              setSelectedPersonId(null);
              clearNarratives();
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (selectedPersonId) {
    const person = state.party.find((c) => c.id === selectedPersonId);
    if (!person) return null;
    return (
      <div className="modal-backdrop">
        <div className="modal doctor-modal">
          <h2>Treating {person.name}</h2>
          <p>Careful, steady hands make all the difference — click Stop as the marker crosses the sweet spot.</p>
          <TimingBar
            label="Steady the dose..."
            difficulty="medium"
            onResolve={(quality) => resolveDoctorChoice(person.id, quality)}
          />
        </div>
      </div>
    );
  }

  const sick = sickPartyMembers(state);
  const medicalKits = getItemQty(state, "medical_kit");
  const quinine = getItemQty(state, "quinine");

  return (
    <div className="modal-backdrop">
      <div className="modal doctor-modal">
        <h2>Treat the Sick</h2>
        <p>
          You have <strong>{Math.round(medicalKits)} medical kit(s)</strong> and{" "}
          <strong>{Math.round(quinine)} quinine</strong>. Treatment doesn't cost any travel time.
        </p>
        <div className="modal-choices">
          {sick.map((person) => (
            <button key={person.id} className="btn choice-btn" onClick={() => setSelectedPersonId(person.id)}>
              <span>
                {person.name} ({person.ailment})
              </span>
              <span className="choice-hint">
                Health {Math.round(person.health)}% &middot; {person.ailmentDaysRemaining} days left untreated
              </span>
            </button>
          ))}
        </div>
        <button className="btn" onClick={closeDoctor}>
          Never Mind
        </button>
      </div>
    </div>
  );
}
