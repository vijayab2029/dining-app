import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../supabase";
import { ALLERGENS, DIETARY_PREFERENCES } from "../utils/dietary";

function Settings() {
  const { session } = useOutletContext<{ session: Session }>();
  const userId = session.user.id;

  const [allergens, setAllergens] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      const { data, error } = await supabase
        .from("user_dietary_settings")
        .select("allergens, dietary_preferences")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setError("Couldn't load your settings.");
        return;
      }
      if (data) {
        setAllergens(data.allergens);
        setPreferences(data.dietary_preferences);
      }
      setLoaded(true);
    }

    loadSettings();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function save(nextAllergens: string[], nextPreferences: string[]) {
    const prevAllergens = allergens;
    const prevPreferences = preferences;
    setAllergens(nextAllergens);
    setPreferences(nextPreferences);
    setError(null);

    const { error } = await supabase.from("user_dietary_settings").upsert({
      user_id: userId,
      allergens: nextAllergens,
      dietary_preferences: nextPreferences,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      setAllergens(prevAllergens);
      setPreferences(prevPreferences);
      setError("Couldn't save your settings.");
    }
  }

  function toggle(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  function renderSection({
    title,
    description,
    options,
    selected,
    gridClassName,
    onChange,
  }: {
    title: string;
    description: string;
    options: string[];
    selected: string[];
    gridClassName: string;
    onChange: (next: string[]) => void;
  }) {
    const allSelected = selected.length === options.length;
    return (
      <section className="border border-gray-200 rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {description}{" "}
              <span className="text-gray-600 font-medium">
                {selected.length} of {options.length} selected
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!loaded || allSelected}
              onClick={() => onChange([...options])}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Select all
            </button>
            <button
              type="button"
              disabled={!loaded || selected.length === 0}
              onClick={() => onChange([])}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
              Clear all
            </button>
          </div>
        </div>

        <div className={`grid gap-2 ${gridClassName}`}>
          {options.map((option) => {
            const checked = selected.includes(option);
            return (
              <label
                key={option}
                className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition-colors ${
                  checked
                    ? "border-green-600 bg-green-50 text-gray-900"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                } ${!loaded ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <input
                  type="checkbox"
                  disabled={!loaded}
                  checked={checked}
                  onChange={() => onChange(toggle(selected, option))}
                  className="h-4 w-4 accent-green-600"
                />
                {option}
              </label>
            );
          })}
        </div>
      </section>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Your selections save automatically and pre-filter the menu every time you visit.
      </p>

      {error && (
        <p role="alert" className="text-sm text-red-600 mb-4">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-6">
        {renderSection({
          title: "Allergens",
          description: "Hide menu items containing these.",
          options: ALLERGENS,
          selected: allergens,
          gridClassName: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
          onChange: (next) => save(next, preferences),
        })}
        {renderSection({
          title: "Dietary Preferences",
          description: "Only show items matching all of these.",
          options: DIETARY_PREFERENCES,
          selected: preferences,
          gridClassName: "grid-cols-2 sm:grid-cols-3",
          onChange: (next) => save(allergens, next),
        })}
      </div>
    </div>
  );
}

export default Settings;
