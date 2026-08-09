import { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import type { Nutrients } from "./MenuItemCard";
import type { MealLog, TimeWindow } from "../pages/Dashboard";

const NUTRIENT_KEY_SET = {
  calories: true,
  protein: true,
  carbohydrates: true,
  total_fat: true,
  saturated_fat: true,
  trans_fat: true,
  dietary_fiber: true,
  sugar: true,
  sodium: true,
  cholesterol: true,
  potassium: true,
  calcium: true,
  iron: true,
  calories_from_fat: true,
} satisfies Record<keyof Nutrients, true>;

const NUTRIENT_KEYS = Object.keys(NUTRIENT_KEY_SET) as (keyof Nutrients)[];

const UNIT_BY_KEY = {
  calories: "kcal",
  protein: "g",
  carbohydrates: "g",
  total_fat: "g",
  saturated_fat: "g",
  trans_fat: "g",
  dietary_fiber: "g",
  sugar: "g",
  sodium: "mg",
  cholesterol: "mg",
  potassium: "mg",
  calcium: "mg",
  iron: "mg",
  calories_from_fat: "kcal",
} satisfies Record<keyof Nutrients, string>;

const CATEGORICAL_COLORS = [
  "#2a78d6",
  "#eb6834",
  "#1baf7a",
  "#eda100",
  "#e87ba4",
  "#008300",
  "#4a3aa7",
  "#e34948",
];

const COLOR_BY_KEY = NUTRIENT_KEYS.reduce((acc, key, index) => {
  acc[key] = CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length];
  return acc;
}, {} as Record<keyof Nutrients, string>);

const CALORIE_FAT_COLOR = "#256abf";
const CALORIE_OTHER_COLOR = "#9ec5f4";

const PERIOD_ORDER = ["Breakfast", "Lunch", "Dinner"];

function humanize(key: keyof Nutrients): string {
  return key
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function round(value: number): number {
  return Math.round(value);
}

function computeTotals(items: MealLog[]): Record<keyof Nutrients, number> {
  const totals = {} as Record<keyof Nutrients, number>;
  for (const key of NUTRIENT_KEYS) {
    totals[key] = items.reduce(
      (sum, item) => sum + (item.nutrients[key] ?? 0) * item.quantity,
      0
    );
  }
  return totals;
}

type Bucket = { label: string; totals: Record<keyof Nutrients, number> };

function buildTodayBuckets(logs: MealLog[]): Bucket[] {
  return PERIOD_ORDER.map((period) => ({
    label: period,
    totals: computeTotals(logs.filter((log) => log.period === period)),
  }));
}

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function buildDayBuckets(
  logs: MealLog[],
  days: number,
  formatLabel: (date: Date) => string
): Bucket[] {
  const byDay = new Map<number, MealLog[]>();
  for (const log of logs) {
    const key = startOfDay(new Date(log.logged_at)).getTime();
    const existing = byDay.get(key);
    if (existing) existing.push(log);
    else byDay.set(key, [log]);
  }

  const today = startOfDay(new Date());
  const buckets: Bucket[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    buckets.push({
      label: formatLabel(date),
      totals: computeTotals(byDay.get(date.getTime()) ?? []),
    });
  }
  return buckets;
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat("en-US", { weekday: "short" });

function formatWeekLabel(date: Date): string {
  return `${WEEKDAY_FORMATTER.format(date)} ${date.getMonth() + 1}/${date.getDate()}`;
}

function formatMonthLabel(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

type ChartRow = {
  label: string;
  value: number;
  caloriesFromFat: number;
  otherCalories: number;
  totalCalories: number;
};

function toChartRows(buckets: Bucket[], nutrient: keyof Nutrients): ChartRow[] {
  return buckets.map((bucket) => {
    const totalCalories = bucket.totals.calories;
    const caloriesFromFat = bucket.totals.calories_from_fat;
    const otherCalories = Math.max(0, totalCalories - caloriesFromFat);
    return {
      label: bucket.label,
      value: bucket.totals[nutrient],
      caloriesFromFat,
      otherCalories,
      totalCalories,
    };
  });
}

type RowTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ payload?: ChartRow }>;
};

function CalorieTooltip({ active, payload, label }: RowTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  if (!datum) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm text-xs">
      <p className="text-gray-900 font-medium mb-1">{label}</p>
      <p className="text-gray-600">
        <span className="text-gray-900 font-medium">{round(datum.caloriesFromFat)}</span> kcal
        from fat
      </p>
      <p className="text-gray-600">
        <span className="text-gray-900 font-medium">{round(datum.otherCalories)}</span> kcal
        other
      </p>
      <p className="text-gray-900 font-medium mt-1 pt-1 border-t border-gray-100">
        {round(datum.totalCalories)} kcal total
      </p>
    </div>
  );
}

function ValueTooltip({
  active,
  payload,
  label,
  unit,
  nutrientLabel,
}: RowTooltipProps & { unit: string; nutrientLabel: string }) {
  if (!active || !payload || payload.length === 0) return null;
  const datum = payload[0].payload;
  if (!datum) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-md px-3 py-2 shadow-sm text-xs">
      <p className="text-gray-900 font-medium mb-1">{label}</p>
      <p className="text-gray-600">
        <span className="text-gray-900 font-medium">{round(datum.value)}</span> {unit}{" "}
        {nutrientLabel.toLowerCase()}
      </p>
    </div>
  );
}

type NutrientChartProps = {
  logs: MealLog[];
  timeWindow: TimeWindow;
};

function NutrientChart({ logs, timeWindow }: NutrientChartProps) {
  const [selectedNutrient, setSelectedNutrient] = useState<keyof Nutrients>("calories");

  const isCalories = selectedNutrient === "calories";
  const isMonth = timeWindow === "month";
  const unit = UNIT_BY_KEY[selectedNutrient];
  const nutrientLabel = humanize(selectedNutrient);
  const color = COLOR_BY_KEY[selectedNutrient];
  const isEmpty = logs.length === 0;

  let buckets: Bucket[];
  if (timeWindow === "today") {
    buckets = buildTodayBuckets(logs);
  } else if (timeWindow === "week") {
    buckets = buildDayBuckets(logs, 7, formatWeekLabel);
  } else {
    buckets = buildDayBuckets(logs, 30, formatMonthLabel);
  }

  const rows = toChartRows(buckets, selectedNutrient);
  const tickInterval = Math.max(0, Math.ceil(rows.length / 6) - 1);

  return (
    <div className="border border-gray-200 rounded-md p-4 mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-medium text-gray-900">Nutrient breakdown</h2>
        <select
          value={selectedNutrient}
          onChange={(e) => setSelectedNutrient(e.target.value as keyof Nutrients)}
          className="border border-gray-200 rounded-md text-sm text-gray-700 px-3 py-1.5 bg-white"
        >
          {NUTRIENT_KEYS.map((key) => (
            <option key={key} value={key}>
              {humanize(key)}
            </option>
          ))}
        </select>
      </div>

      {isEmpty ? (
        <div className="h-64 flex items-center justify-center text-sm text-gray-500">
          Nothing logged in this window yet.
        </div>
      ) : (
        <div className="w-full" style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            {isMonth ? (
              <LineChart data={rows} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e1e0d9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#898781" }}
                  interval={tickInterval}
                  axisLine={{ stroke: "#c3c2b7" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#898781" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                  label={{
                    value: unit,
                    angle: -90,
                    position: "insideLeft",
                    fill: "#898781",
                    fontSize: 11,
                  }}
                />
                <Tooltip
                  content={(props) =>
                    isCalories ? (
                      <CalorieTooltip {...props} />
                    ) : (
                      <ValueTooltip {...props} unit={unit} nutrientLabel={nutrientLabel} />
                    )
                  }
                />
                <Line
                  type="monotone"
                  dataKey={isCalories ? "totalCalories" : "value"}
                  stroke={isCalories ? COLOR_BY_KEY.calories : color}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            ) : (
              <BarChart data={rows} margin={{ top: 24, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#e1e0d9" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#898781" }}
                  axisLine={{ stroke: "#c3c2b7" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#898781" }}
                  axisLine={false}
                  tickLine={false}
                  width={44}
                />
                <Tooltip
                  cursor={{ fill: "#0b0b0b0a" }}
                  content={(props) =>
                    isCalories ? (
                      <CalorieTooltip {...props} />
                    ) : (
                      <ValueTooltip {...props} unit={unit} nutrientLabel={nutrientLabel} />
                    )
                  }
                />
                {isCalories ? (
                  <>
                    <Bar dataKey="caloriesFromFat" stackId="calories" fill={CALORIE_FAT_COLOR} maxBarSize={24} />
                    <Bar
                      dataKey="otherCalories"
                      stackId="calories"
                      fill={CALORIE_OTHER_COLOR}
                      maxBarSize={24}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList
                        dataKey="totalCalories"
                        position="top"
                        formatter={(value) => (typeof value === "number" ? round(value) : value)}
                        style={{ fill: "#52514e", fontSize: 11 }}
                      />
                    </Bar>
                  </>
                ) : (
                  <Bar dataKey="value" fill={color} maxBarSize={24} radius={[4, 4, 0, 0]} />
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      )}

      {!isEmpty && isCalories && (
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: CALORIE_FAT_COLOR }}
            />
            Calories from fat
          </span>
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: CALORIE_OTHER_COLOR }}
            />
            Other calories
          </span>
        </div>
      )}
    </div>
  );
}

export default NutrientChart;
