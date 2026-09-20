import { useGameStore } from "../../state/gameStore";
import { ITEMS } from "../../data/items";

const FOOD_IDS = ["flour", "bacon", "cornmeal", "beans", "dried_fruit", "fresh_meat", "coffee", "sugar"];
const KEY_IDS = ["bullets", "medical_kit", "spare_wheel", "spare_axle", "spare_tongue"];

export default function InventoryPanel() {
  const inventory = useGameStore((s) => s.inventory);

  const qty = (id: string) => Math.round(inventory.find((s) => s.itemId === id)?.quantity ?? 0);
  const totalFood = FOOD_IDS.reduce((sum, id) => sum + qty(id), 0);

  return (
    <div className="panel inventory-panel">
      <h3>Supplies</h3>
      <p>Total food: {totalFood} lbs</p>
      <ul className="key-items">
        {KEY_IDS.map((id) => (
          <li key={id}>
            {ITEMS[id].name}: {qty(id)} {ITEMS[id].unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
