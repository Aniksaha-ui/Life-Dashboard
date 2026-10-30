import { Eye, EyeOff } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CategoryBreakdownRow } from "../types";

const colors = [
  "#295cab",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0e7490",
  "#e11d48",
  "#ea580c",
  "#64748b",
];
export function CategoryBreakdownChart({
  rows,
  hiddenIds,
  onToggle,
  onShowAll,
}: {
  rows: CategoryBreakdownRow[];
  hiddenIds: string[];
  onToggle: (id: string) => void;
  onShowAll: () => void;
}) {
  const chartRows = rows.map((row, index) => ({
    ...row,
    color: colors[index % colors.length],
  }));
  const visibleRows = chartRows.filter((row) => !hiddenIds.includes(row.id));
  const visibleTotal = visibleRows.reduce(
    (total, row) => total + row.totalAmount,
    0,
  );
  const leadingRows = visibleRows.slice(0, 5);
  const remainingTotal = visibleRows
    .slice(5)
    .reduce((total, row) => total + row.totalAmount, 0);
  const allocationRows =
    remainingTotal > 0
      ? [
          ...leadingRows,
          {
            id: "other-categories",
            categoryName: "Other categories",
            totalAmount: remainingTotal,
            color: "#94a3b8",
          },
        ]
      : leadingRows;
  const percentLabel = (value: number) =>
    visibleTotal > 0 ? `${((value / visibleTotal) * 100).toFixed(1)}%` : "0.0%";
  if (!rows.length)
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
        No category spend is available for this period.
      </section>
    );
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
            Visual breakdown
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Spend by category
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Hide categories to focus the comparison; table data remains
            unchanged.
          </p>
        </div>
        {hiddenIds.length > 0 && (
          <button
            type="button"
            onClick={onShowAll}
            className="self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Show all
          </button>
        )}
      </div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {visibleRows.length ? (
          <>
            <div className="relative h-72 rounded-xl bg-slate-50/70">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationRows}
                    dataKey="totalAmount"
                    nameKey="categoryName"
                    innerRadius={66}
                    outerRadius={96}
                    paddingAngle={2}
                    labelLine={false}
                    label={({ value }) => percentLabel(Number(value))}
                  >
                    {allocationRows.map((row) => (
                      <Cell key={row.id} fill={row.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) =>
                      `BDT ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs font-medium text-slate-500">
                  Visible spend
                </span>
                <span className="mt-1 text-base font-bold text-slate-900">
                  BDT{" "}
                  {visibleTotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={visibleRows}
                  layout="vertical"
                  margin={{ left: 10, right: 34 }}
                >
                  <CartesianGrid horizontal={false} stroke="#e2e8f0" />
                  <XAxis
                    type="number"
                    tickFormatter={(value) =>
                      value >= 1000 ? `${Math.round(value / 1000)}k` : value
                    }
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="categoryName"
                    width={110}
                    tick={{ fill: "#475569", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) =>
                      `BDT ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    }
                    labelFormatter={(label) => `Category: ${label}`}
                    contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
                  />
                  <Bar dataKey="totalAmount" radius={[0, 6, 6, 0]}>
                    {visibleRows.map((row) => (
                      <Cell key={row.id} fill={row.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 xl:col-span-2">
            All categories are hidden. Select “Show all” to restore the chart.
          </div>
        )}
      </div>
      <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
        {chartRows.map((row) => {
          const hidden = hiddenIds.includes(row.id);
          return (
            <button
              key={row.id}
              type="button"
              onClick={() => onToggle(row.id)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${hidden ? "border-slate-200 bg-white text-slate-400" : "border-primary-200 bg-primary-50 text-primary-700"}`}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              {hidden ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              {row.categoryName} · {percentLabel(row.totalAmount)}
            </button>
          );
        })}
      </div>
    </section>
  );
}
