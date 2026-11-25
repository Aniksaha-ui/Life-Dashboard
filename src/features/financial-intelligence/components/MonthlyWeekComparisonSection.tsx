import {
  BarChart3,
  CalendarRange,
  Flame,
  Table2,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Loader } from "../../../components/Loader";
import { getLedger } from "../../expense-transactions/api/queries";
import { WeeklyDetailDrawer } from "../../reports/weekly-current-month-analysis/components/WeeklyDetailDrawer";
import type { WeeklyExpenseBlock } from "../../reports/weekly-current-month-analysis/types";
import { getMonthlyWeekComparison } from "../api/queries";
import type {
  MonthlyWeekCell,
  MonthlyWeekComparisonReport,
  MonthlyWeekRow,
} from "../types";
import { buildMonthlyWeekComparisonFromLedger } from "../utils/monthlyWeekFallback";

const MONTH_RANGE_OPTIONS = [6, 12, 18, 24] as const;

const WEEK_BAR_COLORS = [
  "#295cab",
  "#e11d48",
  "#d97706",
  "#059669",
  "#7c3aed",
  "#0891b2",
];

const formatMoney = (value: string | number): string =>
  `BDT ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatCompactMoney = (value: string | number): string => {
  const num = Number(value || 0);
  if (num === 0) return "—";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const computeWindowFromDate = (monthsCount: number, toDate?: string) => {
  const ref = toDate ? new Date(`${toDate}T00:00:00`) : new Date();
  const safe = Number.isNaN(ref.getTime()) ? new Date() : ref;
  const start = new Date(
    safe.getFullYear(),
    safe.getMonth() - (monthsCount - 1),
    1,
  );
  const end = new Date(safe.getFullYear(), safe.getMonth() + 1, 0);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { fromDate: fmt(start), toDate: fmt(end) };
};

interface MonthlyWeekComparisonSectionProps {
  toDate: string;
  initialReport?: MonthlyWeekComparisonReport | null;
}

export function MonthlyWeekComparisonSection({
  toDate,
  initialReport,
}: MonthlyWeekComparisonSectionProps) {
  const [monthsCount, setMonthsCount] = useState<number>(12);
  const [view, setView] = useState<"matrix" | "chart">("matrix");
  const [activeOnly, setActiveOnly] = useState(false);
  const [report, setReport] = useState<MonthlyWeekComparisonReport | null>(
    initialReport ?? null,
  );
  const [loading, setLoading] = useState(!initialReport);
  const [error, setError] = useState("");
  const [selectedWeek, setSelectedWeek] = useState<WeeklyExpenseBlock | null>(
    null,
  );

  const loadComparison = useCallback(
    async (months: number, asOfDate: string) => {
      setLoading(true);
      setError("");
      try {
        const result = await getMonthlyWeekComparison(months, asOfDate);
        setReport(result);
      } catch {
        // Fallback for older backend deployments before the new endpoint is deployed.
        try {
          const window = computeWindowFromDate(months, asOfDate);
          const ledger = await getLedger({
            fromDate: window.fromDate,
            toDate: window.toDate,
          });
          const items = Array.isArray(ledger)
            ? ledger
            : ((ledger as { data?: unknown[] }).data ?? []);
          setReport(
            buildMonthlyWeekComparisonFromLedger(
              items as Record<string, unknown>[],
              months,
              asOfDate,
            ),
          );
        } catch (fallbackError) {
          setError(
            fallbackError instanceof Error
              ? fallbackError.message
              : "Unable to load monthly week comparison report.",
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (
      initialReport &&
      monthsCount === initialReport.period.months_count &&
      initialReport.months.length > 0
    ) {
      setReport(initialReport);
      setLoading(false);
      return;
    }
    void loadComparison(monthsCount, toDate);
  }, [initialReport, monthsCount, toDate, loadComparison]);

  const displayedMonths = useMemo(() => {
    if (!report) return [];
    return activeOnly
      ? report.months.filter((month) => month.transaction_count > 0)
      : report.months;
  }, [report, activeOnly]);

  const maxCellAmount = useMemo(() => {
    let highest = 0;
    for (const month of displayedMonths) {
      for (const week of month.weeks) {
        const val = Number(week.total_expense) || 0;
        if (val > highest) highest = val;
      }
    }
    return highest;
  }, [displayedMonths]);

  const chartData = useMemo(() => {
    if (!report) return [];
    return displayedMonths.map((month) => {
      const point: Record<string, string | number> = {
        month: month.month_label,
      };
      for (const column of report.week_columns) {
        const cell = month.weeks[column.sequence - 1];
        point[column.label] = cell ? Number(cell.total_expense) || 0 : 0;
      }
      return point;
    });
  }, [report, displayedMonths]);

  const openWeekDrilldown = (month: MonthlyWeekRow, cell: MonthlyWeekCell) => {
    const total = Number(cell.total_expense) || 0;
    const monthTotal = Number(month.total_expense) || 0;
    setSelectedWeek({
      sequence: cell.week_sequence,
      label: `${month.month_label} · ${cell.week_label}`,
      calendarLabel: month.month_full_label,
      range: cell.range_label,
      start: cell.week_start,
      end: cell.week_end,
      total,
      expenseTotal: Number(cell.expense_total) || 0,
      recurringTotal: Number(cell.recurring_total) || 0,
      average: cell.transaction_count > 0 ? total / cell.transaction_count : 0,
      count: cell.transaction_count,
      share: monthTotal > 0 ? (total / monthTotal) * 100 : 0,
      deltaPercent: null,
      isPeak: month.peak_week_sequence === cell.week_sequence && total > 0,
      recurringIncluded: true,
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary-50 text-primary-600">
              <CalendarRange className="h-4 w-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 sm:text-lg">
              Monthly Week-by-Week Comparison
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            Compare Week 1 through Week {report?.week_columns.length ?? 5}{" "}
            spending across the last {monthsCount} months
            {report
              ? ` (${report.months[0]?.month_label} – ${report.months[report.months.length - 1]?.month_label})`
              : ""}
            . Click any week cell to inspect transactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month window selector */}
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            role="group"
            aria-label="Comparison timeframe"
          >
            {MONTH_RANGE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMonthsCount(option)}
                className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  monthsCount === option
                    ? "bg-primary-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {option}M
              </button>
            ))}
          </div>

          {/* Active months toggle */}
          <button
            type="button"
            onClick={() => setActiveOnly((prev) => !prev)}
            className={`inline-flex h-8 items-center rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
              activeOnly
                ? "border-primary-300 bg-primary-50 text-primary-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {activeOnly ? "Active months only" : "All months"}
          </button>

          {/* Matrix / Chart toggle */}
          <div
            className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5"
            role="tablist"
            aria-label="Comparison view mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={view === "matrix"}
              onClick={() => setView("matrix")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                view === "matrix"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Table2 className="h-3.5 w-3.5" />
              Matrix
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={view === "chart"}
              onClick={() => setView("chart")}
              className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                view === "chart"
                  ? "bg-white text-primary-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              Chart
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-60 items-center justify-center p-8">
          <Loader size="lg" />
        </div>
      ) : error ? (
        <div className="p-5">
          <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </p>
        </div>
      ) : !report || displayedMonths.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500">
          No expense data found for the selected {monthsCount}-month window.
          {activeOnly && (
            <button
              type="button"
              onClick={() => setActiveOnly(false)}
              className="ml-2 font-semibold text-primary-600 hover:underline"
            >
              Show all months
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-5 p-4 sm:p-6">
          {/* Summary KPI strip */}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {monthsCount}-Month Total
              </p>
              <p className="mt-1 truncate text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                {formatMoney(report.summary.total_expense)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {report.summary.active_months} / {report.summary.months_count}{" "}
                active months
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Monthly Average
              </p>
              <p className="mt-1 truncate text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                {formatMoney(report.summary.average_monthly_expense)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                Regular + recurring spend
              </p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                <Flame className="h-3.5 w-3.5" />
                Heaviest Week
              </p>
              <p className="mt-1 truncate text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                {report.summary.peak_week_label ?? "—"}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-600">
                {formatMoney(report.summary.peak_week_expense)} cumulative
              </p>
            </div>
            <div className="rounded-xl border border-primary-100 bg-primary-50/50 p-3.5">
              <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">
                <TrendingUp className="h-3.5 w-3.5" />
                Highest Month
              </p>
              <p className="mt-1 truncate text-base font-bold tabular-nums text-slate-900 sm:text-lg">
                {report.summary.highest_month_label ?? "—"}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-600">
                {formatMoney(report.summary.highest_month_expense)}
              </p>
            </div>
          </div>

          {view === "matrix" ? (
            <>
              {/* Desktop / Tablet Matrix Table */}
              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
                      <th className="sticky left-0 z-10 min-w-[132px] bg-slate-50 px-4 py-3">
                        Month
                      </th>
                      {report.week_columns.map((column) => (
                        <th
                          key={column.sequence}
                          className="min-w-[132px] px-3 py-3 text-right"
                        >
                          {column.label}
                        </th>
                      ))}
                      <th className="min-w-[140px] border-l border-slate-200 bg-slate-100/70 px-4 py-3 text-right text-slate-800">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedMonths.map((month) => {
                      const monthTotalNum = Number(month.total_expense) || 0;
                      return (
                        <tr
                          key={month.month_key}
                          className="transition-colors hover:bg-slate-50/60"
                        >
                          <td className="sticky left-0 z-10 border-r border-slate-100 bg-white px-4 py-3 align-middle">
                            <p className="font-semibold text-slate-900">
                              {month.month_label}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {month.transaction_count} txn
                              {month.transaction_count === 1 ? "" : "s"}
                            </p>
                          </td>

                          {report.week_columns.map((column) => {
                            const cell = month.weeks[column.sequence - 1];
                            if (!cell) {
                              return (
                                <td
                                  key={column.sequence}
                                  className="px-3 py-3 text-right text-xs text-slate-300"
                                >
                                  —
                                </td>
                              );
                            }

                            const cellVal = Number(cell.total_expense) || 0;
                            const isPeak =
                              cellVal > 0 &&
                              month.peak_week_sequence === cell.week_sequence;
                            const intensity =
                              maxCellAmount > 0 && cellVal > 0
                                ? cellVal / maxCellAmount
                                : 0;

                            return (
                              <td
                                key={column.sequence}
                                className="p-1.5 text-right align-middle"
                              >
                                <button
                                  type="button"
                                  onClick={() => openWeekDrilldown(month, cell)}
                                  title={`${month.month_full_label} ${cell.week_label} (${cell.range_label}): ${formatMoney(cellVal)} across ${cell.transaction_count} transactions`}
                                  className={`w-full rounded-lg px-2.5 py-2 text-right transition-all hover:ring-1 hover:ring-primary-400 ${
                                    isPeak
                                      ? "bg-rose-50/90 text-rose-800"
                                      : intensity >= 0.45
                                        ? "bg-primary-50/80 text-slate-900"
                                        : cellVal > 0
                                          ? "bg-slate-50/70 text-slate-800"
                                          : "bg-transparent text-slate-400 hover:bg-slate-50"
                                  }`}
                                >
                                  <div className="flex items-center justify-end gap-1.5">
                                    {isPeak && (
                                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                                    )}
                                    <span className="font-semibold tabular-nums">
                                      {cellVal > 0
                                        ? `BDT ${formatCompactMoney(cellVal)}`
                                        : "—"}
                                    </span>
                                  </div>
                                  <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                    {cell.range_label}
                                    {cell.transaction_count > 0
                                      ? ` · ${cell.transaction_count}`
                                      : ""}
                                  </p>
                                </button>
                              </td>
                            );
                          })}

                          <td className="border-l border-slate-100 bg-slate-50/50 px-4 py-3 text-right align-middle">
                            <span
                              className={`font-bold tabular-nums ${
                                monthTotalNum > 0
                                  ? "text-slate-900"
                                  : "text-slate-400"
                              }`}
                            >
                              {monthTotalNum > 0
                                ? formatMoney(monthTotalNum)
                                : "—"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-200 bg-slate-50/90 text-xs font-semibold text-slate-700">
                      <td className="sticky left-0 z-10 bg-slate-50 px-4 py-3 uppercase tracking-wide">
                        Week Average
                      </td>
                      {report.week_summaries.map((col) => (
                        <td
                          key={col.week_sequence}
                          className="px-3 py-3 text-right tabular-nums"
                        >
                          <p className="font-bold text-slate-900">
                            {Number(col.average_expense) > 0
                              ? `BDT ${formatCompactMoney(col.average_expense)}`
                              : "—"}
                          </p>
                          <p className="mt-0.5 text-[10px] font-normal text-slate-500">
                            Sum: BDT {formatCompactMoney(col.total_expense)}
                          </p>
                        </td>
                      ))}
                      <td className="border-l border-slate-200 bg-slate-100/70 px-4 py-3 text-right tabular-nums">
                        <p className="font-bold text-primary-700">
                          {formatMoney(report.summary.total_expense)}
                        </p>
                        <p className="mt-0.5 text-[10px] font-normal text-slate-500">
                          Avg:{" "}
                          {formatMoney(report.summary.average_monthly_expense)}
                        </p>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Mobile Card Matrix */}
              <div className="space-y-3 md:hidden">
                {displayedMonths.map((month) => (
                  <article
                    key={month.month_key}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {month.month_full_label}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {month.transaction_count} transactions
                        </p>
                      </div>
                      <span className="rounded-lg bg-primary-50 px-2.5 py-1 text-xs font-bold tabular-nums text-primary-700">
                        {formatMoney(month.total_expense)}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {month.weeks.map((cell) => {
                        const cellVal = Number(cell.total_expense) || 0;
                        const isPeak =
                          cellVal > 0 &&
                          month.peak_week_sequence === cell.week_sequence;
                        return (
                          <button
                            key={cell.week_sequence}
                            type="button"
                            onClick={() => openWeekDrilldown(month, cell)}
                            className={`rounded-lg border p-2.5 text-left transition ${
                              isPeak
                                ? "border-rose-200 bg-rose-50/70"
                                : "border-slate-100 bg-slate-50/70 hover:border-primary-200"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-slate-700">
                                {cell.week_label}
                              </span>
                              {isPeak && (
                                <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-rose-700">
                                  Peak
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm font-bold tabular-nums text-slate-900">
                              {cellVal > 0
                                ? `BDT ${formatCompactMoney(cellVal)}`
                                : "—"}
                            </p>
                            <p className="mt-0.5 truncate text-[10px] text-slate-500">
                              {cell.range_label}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            /* Grouped Bar Chart comparing Week 1..N across months */
            <div className="h-80 w-full sm:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 12, left: 4, bottom: 8 }}
                >
                  <CartesianGrid vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#475569", fontSize: 11 }}
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
                    formatter={(value) => formatMoney(Number(value || 0))}
                    contentStyle={{
                      borderRadius: 12,
                      borderColor: "#e2e8f0",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {report.week_columns.map((column, index) => (
                    <Bar
                      key={column.sequence}
                      dataKey={column.label}
                      fill={WEEK_BAR_COLORS[index % WEEK_BAR_COLORS.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      <WeeklyDetailDrawer
        week={selectedWeek}
        onClose={() => setSelectedWeek(null)}
      />
    </section>
  );
}
