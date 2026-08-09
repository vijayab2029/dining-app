import { useState } from "react";

export type Nutrients = {
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  total_fat: number | null;
  saturated_fat: number | null;
  trans_fat: number | null;
  dietary_fiber: number | null;
  sugar: number | null;
  sodium: number | null;
  cholesterol: number | null;
  potassium: number | null;
  calcium: number | null;
  iron: number | null;
  calories_from_fat: number | null;
};

export type MenuItem = {
  name: string;
  description: string | null;
  portion: string | null;
  ingredients: string | null;
  calories: number | null;
  dietary_preferences: string[];
  allergens: string[];
  custom_allergens: string[];
  nutrients: Nutrients;
  station: string;
};

type MenuItemCardProps = {
  item: MenuItem;
  selected: boolean;
  quantity: number
  onToggleSelect: () => void
  onQuantityChange: (newQuantity: number) => void
};

const NUTRIENT_ROWS: {
  key: keyof Nutrients;
  label: string;
  unit: string;
  alwaysShow: boolean;
}[] = [
  { key: "calories", label: "Calories", unit: "cal", alwaysShow: true },
  { key: "protein", label: "Protein", unit: "g", alwaysShow: true },
  { key: "carbohydrates", label: "Total Carbohydrates", unit: "g", alwaysShow: true },
  { key: "total_fat", label: "Total Fat", unit: "g", alwaysShow: false },
  { key: "saturated_fat", label: "Saturated Fat", unit: "g", alwaysShow: false },
  { key: "trans_fat", label: "Trans Fat", unit: "g", alwaysShow: false },
  { key: "dietary_fiber", label: "Dietary Fiber", unit: "g", alwaysShow: false },
  { key: "sugar", label: "Sugar", unit: "g", alwaysShow: true },
  { key: "sodium", label: "Sodium", unit: "mg", alwaysShow: true },
  { key: "cholesterol", label: "Cholesterol", unit: "mg", alwaysShow: false },
  { key: "potassium", label: "Potassium", unit: "mg", alwaysShow: false },
  { key: "calcium", label: "Calcium", unit: "mg", alwaysShow: false },
  { key: "iron", label: "Iron", unit: "mg", alwaysShow: false },
  { key: "calories_from_fat", label: "Calories From Fat", unit: "", alwaysShow: false },
];

function MenuItemCard({ item, selected, quantity, onToggleSelect, onQuantityChange}: MenuItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const essentialRows = NUTRIENT_ROWS.filter((row) => row.alwaysShow);
  const extraRows = NUTRIENT_ROWS.filter((row) => !row.alwaysShow);

  return (
    <div className= {`border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow bg-white ${selected ? "border-green-600 border-2 bg-green-50" : "border-gray-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>

        <input
          type="checkbox"
          checked={selected}
          onChange={onToggleSelect}
          className="mt-0.5 h-4 w-4 accent-green-600"
        />
      </div>

      {item.dietary_preferences.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.dietary_preferences.map((pref) => (
            <span
              key={pref}
              className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full"
            >
              {pref}
            </span>
          ))}
        </div>
      )}

      {item.allergens.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {item.allergens.map((allergen) => (
            <span
              key={allergen}
              className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full"
            >
              {allergen}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-1 mt-2">
        {essentialRows.map(({ key, label, unit }) => (
          <div key={key} className="flex justify-between text-xs text-gray-600 py-0.5">
            <span>{label}</span>
            <span>{item.nutrients[key]}{unit}</span>
          </div>
        ))}
      </div>

      {selected && (
      <div className="flex items-center gap-3 mt-3">
        <span className="text-xs text-gray-500">Servings</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium hover:bg-gray-50"
          >
            −
          </button>
          <span className="text-sm font-medium text-gray-900 w-4 text-center">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="w-6 h-6 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium hover:bg-gray-50"
          >
            +
          </button>
        </div>
      </div>
    )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-medium hover:bg-green-700 mt-3"
      >
        {expanded ? "-" : "+"}
      </button>

      {expanded && (
        <div className="flex flex-col gap-1 mt-2">
          {extraRows.map(({ key, label, unit }) => (
            <div key={key} className="flex justify-between text-xs text-gray-600 py-0.5">
              <span>{label}</span>
              <span>{item.nutrients[key]}{unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MenuItemCard;