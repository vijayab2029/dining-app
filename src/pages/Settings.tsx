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

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="border border-gray-200 rounded-md p-4 flex gap-8">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Allergens</h4>
          <div className="flex flex-col gap-1">
            {ALLERGENS.map((allergen) => (
              <label
                key={allergen}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  disabled={!loaded}
                  checked={allergens.includes(allergen)}
                  onChange={() => save(toggle(allergens, allergen), preferences)}
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
            {DIETARY_PREFERENCES.map((pref) => (
              <label
                key={pref}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <input
                  type="checkbox"
                  disabled={!loaded}
                  checked={preferences.includes(pref)}
                  onChange={() => save(allergens, toggle(preferences, pref))}
                />
                {pref}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
