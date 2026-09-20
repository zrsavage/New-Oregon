import { useState } from "react";
import { useGameStore } from "../../state/gameStore";
import { ITEM_LIST } from "../../data/items";
import { priceAt } from "../../systems/economy";
import { TRAIL_BY_ID } from "../../data/trail";
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

export default function TradeModal() {
  const pendingTrade = useGameStore((s) => s.pendingTrade);
  const state = useGameStore();
  const closeTrade = useGameStore((s) => s.closeTrade);
  const tradeBuy = useGameStore((s) => s.tradeBuy);
  const tradeSell = useGameStore((s) => s.tradeSell);
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, number>>({});

  if (!pendingTrade) return null;

  const landmark = TRAIL_BY_ID[state.currentLandmarkId];
  const getQty = (id: string) => qtyDrafts[id] ?? 5;

  return (
    <div className="modal-backdrop">
      <div className="modal trade-modal">
        <h2>Trading Post — {landmark?.name}</h2>
        <p>Cash: ${state.cash.toFixed(2)}</p>
        <div className="trade-scroll">
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
                      <button className="btn small" onClick={() => tradeBuy(item.id, getQty(item.id))}>
                        Buy
                      </button>
                      <button
                        className="btn small danger"
                        disabled={owned <= 0}
                        onClick={() => tradeSell(item.id, Math.min(getQty(item.id), owned))}
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
        <button className="btn primary" onClick={closeTrade}>
          Leave Trading Post
        </button>
      </div>
    </div>
  );
}
