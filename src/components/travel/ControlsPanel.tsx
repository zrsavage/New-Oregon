import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { TRAIL_BY_ID } from "../../data/trail";
import { huntingBlockedReason } from "../../systems/hunting";
import { cookingBlockedReason } from "../../systems/cooking";
import { doctoringBlockedReason } from "../../systems/doctoring";
import type { Pace, Rations } from "../../types/game";

const PACE_OPTIONS: { id: Pace; label: string; hint: string }[] = [
  { id: "steady", label: "Steady", hint: "Easy on the party and animals" },
  { id: "strenuous", label: "Strenuous", hint: "Faster, but tiring" },
  { id: "grueling", label: "Grueling", hint: "Fastest, punishing on everyone" },
];

const RATIONS_OPTIONS: { id: Rations; label: string; hint: string }[] = [
  { id: "filling", label: "Filling", hint: "Keeps everyone strong, burns food fast" },
  { id: "meager", label: "Meager", hint: "Stretches supplies, slow health decline" },
  { id: "bare_bones", label: "Bare Bones", hint: "Last resort — health suffers badly" },
];

export default function ControlsPanel() {
  const state = useGameStore();
  const pace = useGameStore((s) => s.pace);
  const rations = useGameStore((s) => s.rations);
  const setPace = useGameStore((s) => s.setPace);
  const setRations = useGameStore((s) => s.setRations);
  const travelDay = useGameStore((s) => s.travelDay);
  const restDay = useGameStore((s) => s.restDay);
  const openTrade = useGameStore((s) => s.openTrade);
  const openHunt = useGameStore((s) => s.openHunt);
  const openCook = useGameStore((s) => s.openCook);
  const openDoctor = useGameStore((s) => s.openDoctor);
  const repairWagon = useGameStore((s) => s.repairWagon);
  const settleDown = useGameStore((s) => s.settleDown);
  const currentLandmarkId = useGameStore((s) => s.currentLandmarkId);
  const wagonCondition = useGameStore((s) => s.wagonCondition);
  const cash = useGameStore((s) => s.cash);
  const isPractice = useGameStore((s) => s.isPractice);
  const [confirmingSettle, setConfirmingSettle] = useState(false);

  const blocked = useGameStore(
    (s) =>
      !!(
        s.pendingEvent ||
        s.pendingFork ||
        s.pendingRiverCrossing ||
        s.pendingTrade ||
        s.pendingHunt ||
        s.pendingCook ||
        s.pendingDoctor
      )
  );

  const landmark = TRAIL_BY_ID[currentLandmarkId];
  const repairCost = Math.round((100 - wagonCondition) * 0.6 * 100) / 100;
  const canSettle = !isPractice && landmark?.hasFort && currentLandmarkId !== "independence";
  const huntBlockReason = huntingBlockedReason(state);
  const cookBlockReason = cookingBlockedReason(state);
  const doctorBlockReason = doctoringBlockedReason(state);

  return (
    <div className="panel controls-panel">
      <h3>Trail Decisions</h3>

      <div className="control-group">
        <span className="control-label">Pace</span>
        <div className="pill-row">
          {PACE_OPTIONS.map((o) => (
            <button
              key={o.id}
              className={`pill ${pace === o.id ? "active" : ""}`}
              title={o.hint}
              onClick={() => setPace(o.id)}
              disabled={blocked}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <span className="control-label">Rations</span>
        <div className="pill-row">
          {RATIONS_OPTIONS.map((o) => (
            <button
              key={o.id}
              className={`pill ${rations === o.id ? "active" : ""}`}
              title={o.hint}
              onClick={() => setRations(o.id)}
              disabled={blocked}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group action-row">
        <button className="btn primary" disabled={blocked} onClick={() => travelDay(1)}>
          Travel 1 Day
        </button>
        <button className="btn primary" disabled={blocked} onClick={() => travelDay(7)}>
          Travel 1 Week
        </button>
        <button className="btn" disabled={blocked} onClick={() => restDay(1)}>
          Rest 1 Day
        </button>
        <button
          className="btn"
          disabled={blocked || !!huntBlockReason}
          title={huntBlockReason ?? "Spend the day hunting for fresh meat"}
          onClick={openHunt}
        >
          Go Hunting
        </button>
        <button
          className="btn"
          disabled={blocked || !!cookBlockReason}
          title={cookBlockReason ?? "Cook a special meal to lift morale — no travel time lost"}
          onClick={openCook}
        >
          Cook a Meal
        </button>
        <button
          className="btn"
          disabled={blocked || !!doctorBlockReason}
          title={doctorBlockReason ?? "Treat a sick or injured party member"}
          onClick={openDoctor}
        >
          Treat the Sick
        </button>
      </div>

      {landmark?.hasFort && (
        <div className="control-group action-row">
          <button className="btn" disabled={blocked} onClick={openTrade}>
            Trade at {landmark.name}
          </button>
          <button
            className="btn"
            disabled={blocked || wagonCondition >= 100 || cash < repairCost}
            onClick={repairWagon}
          >
            Repair Wagon (${repairCost.toFixed(2)})
          </button>
        </div>
      )}

      {canSettle && (
        <div className="control-group action-row settle-row">
          {!confirmingSettle ? (
            <button className="btn" disabled={blocked} onClick={() => setConfirmingSettle(true)}>
              Settle Here
            </button>
          ) : (
            <>
              <span className="settle-confirm-text">End your journey at {landmark!.name}?</span>
              <button className="btn danger" onClick={settleDown}>
                Yes, Settle Here
              </button>
              <button className="btn" onClick={() => setConfirmingSettle(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
