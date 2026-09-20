import { useGameStore, PRACTICE_TARGET_MILE } from "../state/gameStore";
import TrailMap from "./travel/TrailMap";
import PartyPanel from "./travel/PartyPanel";
import WagonPanel from "./travel/WagonPanel";
import InventoryPanel from "./travel/InventoryPanel";
import ControlsPanel from "./travel/ControlsPanel";
import LogPanel from "./travel/LogPanel";
import EventModal from "./modals/EventModal";
import ForkModal from "./modals/ForkModal";
import RiverCrossingModal from "./modals/RiverCrossingModal";
import TradeModal from "./modals/TradeModal";
import WeatherFX from "./travel/WeatherFX";

export default function TravelScreen() {
  const isPractice = useGameStore((s) => s.isPractice);

  return (
    <div className="screen travel-screen">
      <WeatherFX />
      {isPractice && (
        <div className="practice-badge">
          Practice Run — odds are eased, and nothing you do here counts toward achievements. Ends around mile{" "}
          {PRACTICE_TARGET_MILE}.
        </div>
      )}
      <TrailMap />
      <div className="travel-grid">
        <div className="travel-col">
          <PartyPanel />
        </div>
        <div className="travel-col">
          <WagonPanel />
          <InventoryPanel />
        </div>
        <div className="travel-col">
          <ControlsPanel />
        </div>
      </div>
      <LogPanel />

      <EventModal />
      <RiverCrossingModal />
      <ForkModal />
      <TradeModal />
    </div>
  );
}
