import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinancialOverviewRow } from "../types";

const formatAxisAmount = (value: number) =>
  value >= 1000 ? `${Math.round(value / 1000)}k` : value.toLocaleString();

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
        Analytics
      </p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      <div className="mt-5 h-72">{children}</div>
    </section>
  );
}

const tooltipValue = (value: unknown) =>
  `BDT ${Number(value ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

export function FinancialOverviewCharts({
  rows,
  granularity,
}: {
  rows: FinancialOverviewRow[];
  granularity: "daily" | "monthly";
}) {
  const period = granularity === "monthly" ? "monthly" : "daily";
  if (!rows.length) {
    return (
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <p className="text-sm font-semibold text-slate-700">
          No chart data is available for this period.
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Try choosing a broader reporting range.
        </p>
      </section>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <ChartCard
        title="Income vs costing"
        subtitle={`A ${period} comparison of money earned against costs.`}
      >
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
              tickFormatter={formatAxisAmount}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={tooltipValue}
              contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
            />
            <Legend />
            <Bar
              dataKey="income"
              name="Income"
              fill="#059669"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="costing"
              name="Costing"
              fill="#e11d48"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard
        title="Opening vs closing balance"
        subtitle={`Portfolio balance at the beginning and end of each ${granularity === "monthly" ? "month" : "day"}.`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ left: 6, right: 14 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatAxisAmount}
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={tooltipValue}
              contentStyle={{ borderRadius: 10, borderColor: "#e2e8f0" }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="opening"
              name="Opening balance"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="closing"
              name="Closing balance"
              stroke="#295cab"
              strokeWidth={3}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
