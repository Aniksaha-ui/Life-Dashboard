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
import type { ReportData } from "../types";

export function ReportChart({ chart }: { chart: ReportData["chart"] }) {
  if (!chart?.labels.length || !chart.datasets.length) return null;

  const data = chart.labels.map((label, index) =>
    chart.datasets.reduce(
      (item, dataset) => ({
        ...item,
        [dataset.label]: dataset.data[index] ?? 0,
      }),
      { label },
    ),
  );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-700">
          Visual summary
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          Report comparison
        </h2>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 4, right: 12, top: 4 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} />
            <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              formatter={(value) => `BDT ${Number(value).toLocaleString()}`}
            />
            <Legend />
            {chart.datasets.map((dataset, index) => (
              <Bar
                key={dataset.label}
                dataKey={dataset.label}
                fill={
                  dataset.color || ["#295cab", "#059669", "#d97706"][index % 3]
                }
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
