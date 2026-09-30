import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { getMenu } from "../api";
import MenuItemCard from "../components/MenuItemCard";
import type { MenuItem } from "../components/MenuItemCard";
import { supabase } from "../supabase";
import { normalizeAllergen } from "../utils/allergens";

const DINING_HALLS = ["Stetson East", "International Village", "60 Belvidere"];
const PERIODS = ["Breakfast", "Lunch", "Dinner"];

function Menu() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedHall, setSelectedHall] = useState("Stetson East");
  const [selectedPeriod, setSelectedPeriod] = useState("Breakfast");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);

  const [selectedForLog, setSelectedForLog] = useState<Record<string, number>>({});

  const [logStatus, setLogStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedSettings() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      const { data } = await supabase
        .from("user_dietary_settings")
        .select("allergens, dietary_preferences")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (cancelled || !data) return;
      setExcludedAllergens(data.allergens);
      setSelectedPreferences(data.dietary_preferences);
    }

    loadSavedSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedHall || !selectedPeriod) return;
    let cancelled = false;

    async function loadMenu() {
      setLoading(true);
      setError(null);
      setSelectedForLog({});
      try {
        const data = await getMenu(selectedHall.toLowerCase(), selectedPeriod);
        if (!cancelled) {
          const allItems = data.categories.flatMap(
            (category: { name: string; items: MenuItem[] }) =>
              category.items.map((item) => ({ ...item, station: category.name }))
          );
          setItems(allItems);
        }
      } catch {
        if (!cancelled) setError("Couldn't load the menu.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMenu();

    return () => {
      cancelled = true;
    };
  }, [selectedHall, selectedPeriod]);

  const allAllergens = Array.from(
    new Set(items.flatMap((item) => item.allergens.map(normalizeAllergen)))
  ).sort();
  const allPreferences = Array.from(
    new Set(items.flatMap((item) => item.dietary_preferences))
  ).sort();

  function toggle(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  function toggleItemSelected(itemName: string) {
    setSelectedForLog((current) => {
      const next = { ...current };
      if (itemName in next) {
        delete next[itemName];
      } else {
        next[itemName] = 1;
      }
      return next;
    });
  }

  function updateItemQuantity(itemName: string, newQuantity: number) {
    setSelectedForLog((current) => ({
      ...current,
      [itemName]: Math.max(1, newQuantity),
    }));
  }

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const hasNoExcludedAllergen = !item.allergens.some((a) =>
      excludedAllergens.map(normalizeAllergen).includes(normalizeAllergen(a))
    );

    const matchesAllPreferences = selectedPreferences.every((p) =>
      item.dietary_preferences.includes(p)
    );

    return matchesSearch && hasNoExcludedAllergen && matchesAllPreferences;
  });

  const stations = Array.from(new Set(filteredItems.map((item) => item.station)));

  async function handleLogSelected() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log(error);
        setLogStatus("Couldn't log your meal, try again.");
        return;
      }
      const user = data.user;

      const rows = Object.entries(selectedForLog).map((selectedItem) => {
        const matchingSelectedItem = items.find(
          (item) => item.name === selectedItem[0]
        );
        return {
          user_id: user.id,
          item_name: matchingSelectedItem!.name,
          station: matchingSelectedItem!.station,
          hall: selectedHall,
          period: selectedPeriod,
          quantity: selectedItem[1],
          nutrients: matchingSelectedItem!.nutrients,
        };
      });

      const { error: insertError } = await supabase
        .from("meal_logs")
        .insert(rows);

      if (insertError) {
        console.log(insertError);
        setLogStatus("Couldn't log your meal, try again.");
        return;
      }

      setSelectedForLog({});
      setLogStatus("Logged!");
    } catch (err) {
      console.log(err);
      setLogStatus("Couldn't log your meal, try again.");
    }
  }

  const selectedCount = Object.keys(selectedForLog).length;

  return (
    <div className="flex">
      <aside className="w-56 border-r border-gray-200 p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-4">Dining Halls</h3>
        <div className="flex flex-col gap-2">
          {DINING_HALLS.map((hall) => (
            <button
              key={hall}
              onClick={() => setSelectedHall(hall)}
              className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                selectedHall === hall
                  ? "bg-green-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              {hall}
            </button>
          ))}
        </div>
      </aside>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {PERIODS.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  selectedPeriod === period
                    ? "bg-green-600 text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <button
            disabled={selectedCount === 0}
            onClick={handleLogSelected}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              selectedCount === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            Log selected ({selectedCount})
          </button>
        </div>

        {logStatus && <p className="text-sm text-green-700 mb-4">{logStatus}</p>}

        <input
          type="text"
          placeholder="Search food items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-200 rounded-md px-4 py-2 mb-4"
        />

        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="text-sm font-medium text-green-700 hover:underline mb-4"
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
        </button>

        {filtersOpen && (
          <div className="border border-gray-200 rounded-md p-4 mb-6 flex gap-8">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Exclude Allergens
              </h4>
              <div className="flex flex-col gap-1">
                {allAllergens.length === 0 && (
                  <span className="text-xs text-gray-400">None available</span>
                )}
                {allAllergens.map((allergen) => (
                  <label
                    key={allergen}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={excludedAllergens.includes(allergen)}
                      onChange={() =>
                        setExcludedAllergens(toggle(excludedAllergens, allergen))
                      }
                    />
                    {allergen}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Dietary Preferences
              </h4>
              <div className="flex flex-col gap-1">
                {allPreferences.length === 0 && (
                  <span className="text-xs text-gray-400">None available</span>
                )}
                {allPreferences.map((pref) => (
                  <label
                    key={pref}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPreferences.includes(pref)}
                      onChange={() =>
                        setSelectedPreferences(toggle(selectedPreferences, pref))
                      }
                    />
                    {pref}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-500">
            <Loader2 className="animate-spin text-green-600" size={20} />
            <span>Loading menu...</span>
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && (
          <div className="flex flex-col gap-8">
            {stations.map((station) => (
              <div key={station}>
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  {station}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {filteredItems
                    .filter((item) => item.station === station)
                    .map((item) => (
                      <MenuItemCard
                        key={`${station}-${item.name}`}
                        item={item}
                        selected={item.name in selectedForLog}
                        quantity={selectedForLog[item.name] ?? 1}
                        onToggleSelect={() => toggleItemSelected(item.name)}
                        onQuantityChange={(qty) => updateItemQuantity(item.name, qty)}
                      />
                    ))}
                </div>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <p className="text-sm text-gray-500">No items match your filters.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Menu;