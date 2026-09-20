import { useState } from "react";
import { useGameStore, selectTotalWeight, selectCapacity } from "../../state/gameStore";
import { ITEM_LIST } from "../../data/items";
import { priceAt } from "../../systems/economy";
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

export default function SuppliesTab() {
  const state = useGameStore();
  const buyOutfitItem = useGameStore((s) => s.buyOutfitItem);
  const sellOutfitItem = useGameStore((s) => s.sellOutfitItem);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, number>>({});

  const weight = selectTotalWeight(state);
  const capacity = selectCapacity(state);

  const getQty = (id: string) => qtyDrafts[id] ?? 10;

  return (
    <div className="outfit-tab">
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
