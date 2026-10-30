import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BurnRateReport } from "../types";

export function BurnRateChart({ chart }: { chart: BurnRateReport["chart"] }) {
  if (!chart.labels.length || !chart.datasets.length)
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
        No burn trend data is available for the selected period.
      </section>
    );
  const rows = chart.labels.map((label, index) =>
    chart.datasets.reduce(
      (row, dataset) => ({ ...row, [dataset.label]: dataset.data[index] ?? 0 }),
      { label },
    ),
  );
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
            Burn trend
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Expense and average daily burn
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Track whether total expense and the daily burn rate are rising or
            easing over time.
          </p>
        </div>
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
          Expense analysis
        </div>
      </div>
      <div className="mt-5 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ left: 6, right: 10 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : value
              }
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) =>
                `BDT ${Number(value).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              }
              contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
            />
            <Legend />
            {chart.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={dataset.color || ["#e11d48", "#d97706"][index % 2]}
                radius={[5, 5, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
