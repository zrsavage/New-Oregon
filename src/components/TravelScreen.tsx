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

export default function TravelScreen() {
  return (
    <div className="screen travel-screen">
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
