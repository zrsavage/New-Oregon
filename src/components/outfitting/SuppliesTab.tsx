import { useState } from "react";
import { useGameStore, selectTotalWeight, selectCapacity } from "../../state/gameStore";
import { ITEM_LIST } from "../../data/items";
import { priceAt } from "../../systems/economy";
import { estimateProvisions } from "../../systems/provisions";
import { getItemQty } from "../../systems/mutators";
import { TOTAL_TRAIL_MILES } from "../../data/trail";
import type { ItemCategory } from "../../types/game";

const CATEGORY_LABELS: Record<ItemCategory, string> = {
  food: "Food",
  spare_part: "Spare Parts",
  tool: "Tools",
  ammunition: "Ammunition",
  medicine: "Medicine",
  clothing: "Clothing",
  trade_good: "Trade Goods",
};

const CATEGORY_ORDER: ItemCategory[] = ["food", "ammunition", "medicine", "spare_part", "tool", "clothing", "trade_good"];

const FOOD_IDS = ["flour", "bacon", "cornmeal", "beans", "dried_fruit"];

export default function SuppliesTab() {
  const state = useGameStore();
  const buyOutfitItem = useGameStore((s) => s.buyOutfitItem);
  const sellOutfitItem = useGameStore((s) => s.sellOutfitItem);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, number>>({});

  const weight = selectTotalWeight(state);
  const capacity = selectCapacity(state);

  const getQty = (id: string) => qtyDrafts[id] ?? 1;

  const provisions = estimateProvisions(state);
  const currentFood = FOOD_IDS.reduce((sum, id) => sum + getItemQty(state, id), 0);
  const foodPct = Math.round((currentFood / provisions.starterFoodTotalLbs) * 100);
  const foodShortfall = Math.max(0, Math.round(provisions.starterFoodTotalLbs - currentFood));

  function buySuggestedFood() {
    const flourQty = Math.round(foodShortfall * 0.6);
    const baconQty = Math.round(foodShortfall * 0.4);
    if (flourQty > 0) buyOutfitItem("flour", flourQty);
    if (baconQty > 0) buyOutfitItem("bacon", baconQty);
  }

  return (
    <div className="outfit-tab">
      <div className="provisions-guide">
        <h4>How Much Should You Bring?</h4>
        <p>
          A practical starting stock is about <strong>{provisions.starterFoodPerPersonLbs} lbs of food per person</strong> —{" "}
          <strong>{provisions.starterFoodTotalLbs} lbs total</strong> for your party of {provisions.partySize}. That
          covers roughly {provisions.starterDaysCovered} days at filling rations; you'll restock at forts along the
          way, and hunting or foraging can stretch it further.
        </p>
        <p className="provisions-context">
          At a steady pace, your current wagon and team would take roughly <strong>{provisions.days} days</strong> to
          cover the {TOTAL_TRAIL_MILES}-mile trail — carrying enough to go the <em>whole way</em> on filling rations
          with zero resupply would mean about {provisions.fullTripFoodTotalLbs} lbs, which is more than most wagons
          can even hold. Nobody carries it all at once; that's what forts, hunting, and foraging are for.
        </p>
        <div className={`provisions-status ${foodPct >= 100 ? "good" : foodPct >= 60 ? "ok" : "low"}`}>
          You currently have <strong>{Math.round(currentFood)} lbs</strong> of food ({Math.min(999, foodPct)}% of the
          starting stock above).
        </div>
        {foodShortfall > 0 && (
          <button className="btn small" onClick={buySuggestedFood}>
            Buy the Remaining ~{foodShortfall} lbs (Flour &amp; Bacon)
          </button>
        )}
        <ul className="provisions-tips">
          <li>Spare parts: at least one spare wheel and axle — a break far from a fort can strand you.</li>
          <li>Medicine: roughly one medical kit per two or three travelers covers most illnesses.</li>
          <li>Ammunition: bring extra bullets if you plan to hunt for food along the way — it's cheap insurance.</li>
        </ul>
      </div>

      <div className="supplies-header">
        <div>
          Cash: <strong>${state.cash.toFixed(2)}</strong>
        </div>
        <div className={weight > capacity ? "over-capacity" : ""}>
          Weight: <strong>{Math.round(weight)}</strong> / {capacity} lbs
        </div>
      </div>

      {CATEGORY_ORDER.map((cat) => (
        <div key={cat} className="supply-category">
          <h4>{CATEGORY_LABELS[cat]}</h4>
          <div className="supply-list">
            {ITEM_LIST.filter((i) => i.category === cat).map((item) => {
              const owned = state.inventory.find((s) => s.itemId === item.id)?.quantity ?? 0;
              const price = priceAt(state, item.id);
              return (
                <div key={item.id} className="supply-row">
                  <div className="supply-name">
                    <strong>{item.name}</strong>
                    <span className="supply-desc">{item.description}</span>
                  </div>
                  <div className="supply-price">${price.toFixed(2)}/{item.unit}</div>
                  <div className="supply-owned">Owned: {Math.round(owned)}</div>
                  <input
                    type="number"
                    min={1}
                    value={getQty(item.id)}
                    onChange={(e) =>
                      setQtyDrafts((prev) => ({ ...prev, [item.id]: Math.max(1, Number(e.target.value)) }))
                    }
                    className="qty-input"
                  />
                  <button className="btn small" onClick={() => buyOutfitItem(item.id, getQty(item.id))}>
                    Buy
                  </button>
                  <button
                    className="btn small danger"
                    disabled={owned <= 0}
                    onClick={() => sellOutfitItem(item.id, Math.min(getQty(item.id), owned))}
                  >
                    Sell
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
