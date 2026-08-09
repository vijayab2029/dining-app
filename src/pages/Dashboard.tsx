import { useState, useEffect } from "react";
import { supabase } from "../supabase";
import type { Nutrients } from "../components/MenuItemCard";
import NutrientChart from "../components/NutrientChart";

export type MealLog = {
  id: string;
  item_name: string;
  station: string;
  hall: string;
  period: string;
  quantity: number;
  nutrients: Nutrients;
  logged_at: string;
};

export type TimeWindow = "today" | "week" | "month";

function isWithinWindow(loggedAt: string, window: TimeWindow): boolean {
  const logged = new Date(loggedAt);
  const now = new Date();

  if (window === "today") {
    return (
      logged.getFullYear() === now.getFullYear() &&
      logged.getMonth() === now.getMonth() &&
      logged.getDate() === now.getDate()
    );
  }

  const daysBack = window === "week" ? 7 : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysBack);
  return logged >= cutoff;
}

function aggregateNutrients(visibleLogs: MealLog[]): Record<string, number> {
  if (visibleLogs.length === 0) return {};

  const nutrientList = Object.keys(visibleLogs[0].nutrients) as (keyof Nutrients)[];
  const nutrientTotalsRecord: Record<string, number> = {};
  for (const nutrient of nutrientList) {
    const nutrientsSum = visibleLogs.reduce((sum, currentItem) => {
      if (currentItem.nutrients[nutrient] != null) {
        return sum + currentItem.nutrients[nutrient] * currentItem.quantity;
      }
      return sum;
    }, 0);
    nutrientTotalsRecord[nutrient] = nutrientsSum;
  }
  return nutrientTotalsRecord;
}

function Dashboard() {
  const [logs, setLogs] = useState<MealLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>("today");

  useEffect(() => {
    let cancelled = false;

    async function loadLogs() {
      setLoading(true);
      setError(null);
      try {
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        const { data, error: fetchError } = await supabase
          .from("meal_logs")
          .select("*")
          .eq("user_id", userData.user.id)
          .order("logged_at", { ascending: false });

        if (fetchError) throw fetchError;
        if (!cancelled) setLogs(data as MealLog[]);
      } catch (err) {
        console.log(err);
        if (!cancelled) setError("Couldn't load your logs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleLogs: MealLog[] = logs.filter((mealLog) => isWithinWindow(mealLog.logged_at, timeWindow));

  const totalCalories = visibleLogs.reduce((sum, currentItem) => {
    if (currentItem.nutrients.calories != null) {
      return sum + currentItem.nutrients.calories * currentItem.quantity;
    }
    return sum;
  }, 0);

  const nutrientTotals = aggregateNutrients(visibleLogs);

  async function handleDelete(id: string) {
    try {
      const { error: deleteError } = await supabase
        .from("meal_logs")
        .delete()
        .eq("id", id);
      if (deleteError) throw deleteError;
      setLogs((current) => current.filter((log) => log.id !== id));
    } catch (err) {
      console.log(err);
      setError("Couldn't delete that item.");
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="flex gap-2 mb-6">
        {(["today", "week", "month"] as TimeWindow[]).map((w) => (
          <button
            key={w}
            onClick={() => setTimeWindow(w)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              timeWindow === w
                ? "bg-green-600 text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:bg-gray-50"
            }`}
          >
            {w === "today" ? "Today" : w === "week" ? "Past Week" : "Past Month"}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-gray-500">Loading your logs...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <>
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="border border-gray-200 rounded-md p-6 inline-block">
              <p className="text-xs text-gray-500">Total Calories</p>
              <p className="text-3xl font-semibold text-gray-900">{totalCalories}</p>
              <p className="text-xs text-gray-500">
                across {visibleLogs.length} logged item
                {visibleLogs.length === 1 ? "" : "s"}
              </p>
            </div>

            {Object.keys(nutrientTotals).length > 0 && (
              <div className="border border-gray-200 rounded-md p-6 inline-block">
                <p className="text-xs text-gray-500 mb-2">Nutrient totals</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(nutrientTotals).map(([nutrient, total]) => (
                    <p key={nutrient} className="text-sm text-gray-900">
                      <span className="capitalize">{nutrient}</span>: {total}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          <NutrientChart logs={visibleLogs} timeWindow={timeWindow} />

          <h2 className="text-base font-semibold text-gray-900 mb-3">Logged items</h2>
          {visibleLogs.length === 0 && (
            <p className="text-sm text-gray-500">Nothing logged in this window yet.</p>
          )}
          <div className="flex flex-col gap-2">
            {visibleLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between border-b border-gray-100 pb-2"
              >
                <div>
                  <span className="text-sm text-gray-900">
                    {log.item_name} × {log.quantity}
                  </span>
                  <span className="text-xs text-gray-400 ml-2">
                    {log.hall} · {log.period}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {(log.nutrients.calories ?? 0) * log.quantity} cal
                  </span>
                  <button
                    onClick={() => handleDelete(log.id)}
                    className="text-gray-400 hover:text-red-600 text-sm"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;