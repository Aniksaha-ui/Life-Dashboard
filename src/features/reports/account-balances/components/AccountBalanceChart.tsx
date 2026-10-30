import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { AccountBalanceChartItem } from "../types";

export function AccountBalanceChart({
  items,
}: {
  items: AccountBalanceChartItem[];
}) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const visibleItems = items.length > 6 ? items.slice(0, 6) : items;
  const remaining = items.slice(6).reduce((sum, item) => sum + item.value, 0);
  const chartItems =
    remaining > 0
      ? [
          ...visibleItems,
          {
            name: "Other accounts",
            value: remaining,
            label: `BDT ${remaining.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            color: "#94a3b8",
          },
        ]
      : visibleItems;
  const percentLabel = (value: number) =>
    total > 0 ? `${((value / total) * 100).toFixed(1)}%` : "0.0%";

  if (!chartItems.length) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
        No positive account balances are available for the chart.
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
            Balance distribution
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Where your balance is held
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Each slice represents an account’s share of your available balance.
          </p>
        </div>
        <p className="mt-2 text-sm font-semibold text-slate-700 sm:mt-0">
          Total: BDT{" "}
          {total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
      <div className="mt-4 grid items-center gap-5 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(16rem,1.2fr)]">
        <div className="relative h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartItems}
                dataKey="value"
                nameKey="name"
                innerRadius={64}
                outerRadius={94}
                paddingAngle={2}
                labelLine={{ stroke: "#94a3b8", strokeWidth: 1 }}
                label={({ value }) => percentLabel(Number(value))}
              >
                {chartItems.map((item) => (
                  <Cell key={item.name} fill={item.color} />
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
            <span className="text-xs font-medium text-slate-500">Tracked</span>
            <span className="mt-1 text-base font-bold text-slate-900">
              {chartItems.length} accounts
            </span>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {chartItems.map((item) => (
            <div
              key={item.name}
              className="flex min-w-0 items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5"
            >
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.name}</span>
              </span>
              <span className="shrink-0 text-right text-sm font-semibold text-slate-800">
                <span className="block">{item.label}</span>
                <span className="block text-xs font-medium text-slate-500">
                  {percentLabel(item.value)}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
