import { useState } from "react";
import WagonTeamTab from "./outfitting/WagonTeamTab";
import PartyTab from "./outfitting/PartyTab";
import SuppliesTab from "./outfitting/SuppliesTab";
import ReviewTab from "./outfitting/ReviewTab";

type Tab = "wagon" | "party" | "supplies" | "review";

export default function OutfittingScreen() {
  const [tab, setTab] = useState<Tab>("wagon");

  return (
    <div className="screen outfitting-screen">
      <h1>Outfitting at Independence, Missouri</h1>
      <nav className="tab-bar">
        <button className={tab === "wagon" ? "active" : ""} onClick={() => setTab("wagon")}>
          Wagon &amp; Team
        </button>
        <button className={tab === "party" ? "active" : ""} onClick={() => setTab("party")}>
          Party
        </button>
        <button className={tab === "supplies" ? "active" : ""} onClick={() => setTab("supplies")}>
          Supplies
        </button>
        <button className={tab === "review" ? "active" : ""} onClick={() => setTab("review")}>
          Review &amp; Depart
        </button>
      </nav>

      <div className="tab-content">
        {tab === "wagon" && <WagonTeamTab />}
        {tab === "party" && <PartyTab />}
        {tab === "supplies" && <SuppliesTab />}
        {tab === "review" && <ReviewTab onDepart={() => {}} />}
      </div>
    </div>
  );
}
