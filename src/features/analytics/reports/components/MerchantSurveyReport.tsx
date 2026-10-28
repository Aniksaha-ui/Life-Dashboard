import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface MerchantSurveyReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MerchantSurveyReportHandle {
  exportData: () => void;
}

type SurveyRow = {
  month: string;
  totalCount: number;
  veryUnsafe: number;
  unsafe: number;
  neutral: number;
  safe: number;
  verySafe: number;
};

const CATEGORY_CONFIG = [
  { key: "veryUnsafe" as const, label: "Very Unsafe", color: "#ef4444" },
  { key: "unsafe" as const, label: "Unsafe", color: "#f97316" },
  { key: "neutral" as const, label: "Neutral", color: "#94a3b8" },
  { key: "safe" as const, label: "Safe", color: "#22c55e" },
  { key: "verySafe" as const, label: "Very Safe", color: "#06b6d4" },
];

const TREND_METRIC_OPTIONS = [
  { value: "totalCount", label: "Total Count" },
  { value: "veryUnsafe", label: "Very Unsafe" },
  { value: "unsafe", label: "Unsafe" },
  { value: "neutral", label: "Neutral" },
  { value: "safe", label: "Safe" },
  { value: "verySafe", label: "Very Safe" },
];

const MONTH_ORDER: Record<string, number> = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

function formatPercentage(count: number, total: number) {
  if (total === 0) return "0.00%";
  return `${((count / total) * 100).toFixed(2)}%`;
}

function formatCell(count: number, total: number) {
  return `${count} (${formatPercentage(count, total)})`;
}

function parseMonthSortKey(month: string) {
  const [name, year] = month.split(" ");
  return (Number(year) || 0) * 100 + (MONTH_ORDER[name] || 0);
}

function isMonthInDateRange(month: string, from: string, to: string) {
  if (!from || !to) return true;
  const monthKey = parseMonthSortKey(month);
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const fromKey = fromDate.getFullYear() * 100 + (fromDate.getMonth() + 1);
  const toKey = toDate.getFullYear() * 100 + (toDate.getMonth() + 1);
  return monthKey >= fromKey && monthKey <= toKey;
}

function collectSurveyRows(
  sections: ReportSection[],
  filters: ReportFilters,
): SurveyRow[] {
  const rows: SurveyRow[] = [];

  sections.forEach((section) => {
    const stores = section.customData?.stores || [];
    stores.forEach((store: { rows: SurveyRow[] }) => {
      store.rows.forEach((row) => {
        if (isMonthInDateRange(row.month, filters.from, filters.to)) {
          rows.push({ ...row });
        }
      });
    });
  });

  return rows;
}

function aggregateMonthlyRows(rows: SurveyRow[]): SurveyRow[] {
  const byMonth = new Map<string, SurveyRow>();

  rows.forEach((row) => {
    const existing = byMonth.get(row.month);
    if (!existing) {
      byMonth.set(row.month, { ...row });
      return;
    }

    existing.totalCount += row.totalCount;
    existing.veryUnsafe += row.veryUnsafe;
    existing.unsafe += row.unsafe;
    existing.neutral += row.neutral;
    existing.safe += row.safe;
    existing.verySafe += row.verySafe;
  });

  return Array.from(byMonth.values()).sort(
    (a, b) => parseMonthSortKey(a.month) - parseMonthSortKey(b.month),
  );
}

function sumCategories(rows: SurveyRow[]) {
  return rows.reduce(
    (acc, row) => ({
      totalCount: acc.totalCount + row.totalCount,
      veryUnsafe: acc.veryUnsafe + row.veryUnsafe,
      unsafe: acc.unsafe + row.unsafe,
      neutral: acc.neutral + row.neutral,
      safe: acc.safe + row.safe,
      verySafe: acc.verySafe + row.verySafe,
    }),
    {
      totalCount: 0,
      veryUnsafe: 0,
      unsafe: 0,
      neutral: 0,
      safe: 0,
      verySafe: 0,
    },
  );
}

export const MerchantSurveyReport = forwardRef<
  MerchantSurveyReportHandle,
  MerchantSurveyReportProps
>(({ sections, filters }, ref) => {
  const [trendMetric, setTrendMetric] = useState("totalCount");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const rawRows = useMemo(
    () => collectSurveyRows(sections, filters),
    [sections, filters],
  );

  const monthlyRows = useMemo(() => aggregateMonthlyRows(rawRows), [rawRows]);
  const totals = useMemo(() => sumCategories(rawRows), [rawRows]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.from, filters.to, filters.question]);

  const totalPages = Math.max(1, Math.ceil(monthlyRows.length / rowsPerPage));
  const pagedMonthlyRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return monthlyRows.slice(start, start + rowsPerPage);
  }, [monthlyRows, currentPage]);

  const distributionData = useMemo(() => {
    return CATEGORY_CONFIG.map((category) => ({
      name: category.label,
      value: totals[category.key],
      color: category.color,
    })).filter((item) => item.value > 0);
  }, [totals]);

  const trendData = useMemo(() => {
    return monthlyRows.map((row) => ({
      month: row.month.replace(" 2025", "").replace(" 2026", ""),
      fullMonth: row.month,
      totalCount: row.totalCount,
      veryUnsafe: row.veryUnsafe,
      unsafe: row.unsafe,
      neutral: row.neutral,
      safe: row.safe,
      verySafe: row.verySafe,
    }));
  }, [monthlyRows]);

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Month",
      "Total Count",
      "Very Unsafe",
      "Unsafe",
      "Neutral",
      "Safe",
      "Very Safe",
    ];
    const rows = monthlyRows.map((row, index) => [
      index + 1,
      row.month,
      row.totalCount,
      formatCell(row.veryUnsafe, row.totalCount),
      formatCell(row.unsafe, row.totalCount),
      formatCell(row.neutral, row.totalCount),
      formatCell(row.safe, row.totalCount),
      formatCell(row.verySafe, row.totalCount),
    ]);

    if (rows.length === 0) return null;

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const content = generateCsvContent();
      if (content) {
        downloadCsv(
          content,
          `merchant-survey-${filters.from}-${filters.to}.csv`,
        );
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (monthlyRows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No survey data found for the selected filters.
      </div>
    );
  }

  const trendMetricLabel =
    TREND_METRIC_OPTIONS.find((option) => option.value === trendMetric)
      ?.label || "Total Count";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Response Distribution
          </h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative w-[220px] h-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={88}
                    paddingAngle={2}
                  >
                    {distributionData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value} (${formatPercentage(value, totals.totalCount)})`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-900">
                  {totals.totalCount}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Total
                </span>
              </div>
            </div>

            <div className="flex-1 w-full space-y-3">
              {CATEGORY_CONFIG.map((category) => (
                <div
                  key={category.key}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="text-slate-700 font-medium truncate">
                      {category.label}
                    </span>
                  </div>
                  <span className="font-semibold tabular-nums text-slate-900">
                    {totals[category.key]} (
                    {formatPercentage(totals[category.key], totals.totalCount)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Monthly Trend (Total Responses)
            </h3>
            <div className="relative">
              <select
                value={trendMetric}
                onChange={(e) => setTrendMetric(e.target.value)}
                className="appearance-none pl-3 pr-9 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                {TREND_METRIC_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="surveyTrendFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#295cab" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#295cab" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(value: number) => [value, trendMetricLabel]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullMonth || ""
                  }
                />
                <Area
                  type="monotone"
                  dataKey={trendMetric}
                  stroke="#295cab"
                  fill="url(#surveyTrendFill)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#295cab", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            Monthly Survey Response Summary
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3 text-center">Month</th>
                <th className="px-4 py-3 text-center">Total Count</th>
                <th className="px-4 py-3 text-center">Very Unsafe</th>
                <th className="px-4 py-3 text-center">Unsafe</th>
                <th className="px-4 py-3 text-center">Neutral</th>
                <th className="px-4 py-3 text-center">Safe</th>
                <th className="px-4 py-3 text-center">Very Safe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedMonthlyRows.map((row, idx) => (
                <tr
                  key={row.month}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 whitespace-nowrap">
                    {row.month}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 font-medium tabular-nums">
                    {row.totalCount}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {formatCell(row.veryUnsafe, row.totalCount)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {formatCell(row.unsafe, row.totalCount)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {formatCell(row.neutral, row.totalCount)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {formatCell(row.safe, row.totalCount)}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {formatCell(row.verySafe, row.totalCount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {(() => {
              const total = monthlyRows.length;
              const from = (currentPage - 1) * rowsPerPage + 1;
              const to = Math.min(currentPage * rowsPerPage, total);
              return `Showing ${from} to ${to} of ${total} entries`;
            })()}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-colors"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              className={clsx(
                "min-w-[2rem] px-3 py-1 text-sm border rounded font-medium",
                "bg-primary-600 border-primary-600 text-white",
              )}
            >
              {currentPage}
            </button>
            <button
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-colors"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

MerchantSurveyReport.displayName = "MerchantSurveyReport";
