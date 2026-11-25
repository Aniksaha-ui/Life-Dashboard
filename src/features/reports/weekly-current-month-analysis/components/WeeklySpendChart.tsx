import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMoney, type WeeklyExpenseBlock } from "../types";

interface WeeklySpendChartProps {
  weeks: WeeklyExpenseBlock[];
  averageWeeklySpend: number;
  onSelectWeek: (week: WeeklyExpenseBlock) => void;
}

export function WeeklySpendChart({
  weeks,
  averageWeeklySpend,
  onSelectWeek,
}: WeeklySpendChartProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
            Weekly trend
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900">
            Spend comparison by week
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Click any bar to inspect that week&apos;s transactions and category
            breakdown.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-primary-600" />
            Weekly spend
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" />
            Peak week
          </span>
          {averageWeeklySpend > 0 && (
            <span className="inline-flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-amber-500" />
              Avg ({formatMoney(averageWeeklySpend)})
            </span>
          )}
        </div>
      </div>

      <div className="mt-5 h-72 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeks}
            margin={{ top: 12, right: 12, left: 4, bottom: 4 }}
          >
            <CartesianGrid vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#475569", fontSize: 12, fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(value: number) =>
                value >= 1000
                  ? `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
                  : String(value)
              }
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              cursor={{ fill: "#f1f5f9", radius: 8 }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const week = payload[0].payload as WeeklyExpenseBlock;
                return (
                  <div className="min-w-[200px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-lg">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold text-slate-900">
                        {week.label}
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                        {week.share.toFixed(1)}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {week.range}
                    </p>
                    <p className="mt-2 text-base font-bold tabular-nums text-slate-900">
                      {formatMoney(week.total)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {week.count} transaction{week.count === 1 ? "" : "s"} ·
                      Avg {formatMoney(week.average)}
                    </p>
                  </div>
                );
              }}
            />
            {averageWeeklySpend > 0 && (
              <ReferenceLine
                y={averageWeeklySpend}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                strokeWidth={1.5}
              />
            )}
            <Bar
              dataKey="total"
              radius={[8, 8, 2, 2]}
              maxBarSize={56}
              className="cursor-pointer"
              onClick={(entry) => {
                const week = entry?.payload as WeeklyExpenseBlock | undefined;
                if (week) onSelectWeek(week);
              }}
            >
              {weeks.map((week) => (
                <Cell
                  key={`${week.label}-${week.start}`}
                  fill={
                    week.total === 0
                      ? "#cbd5e1"
                      : week.isPeak
                        ? "#e11d48"
                        : "#295cab"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
