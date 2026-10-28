import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { Drawer } from "../../../../components/Drawer";
import { clsx } from "clsx";
import { ChevronDown, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface HunterWiseMerchantOnboardingReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface HunterWiseMerchantOnboardingReportHandle {
  exportData: () => void;
}

type MonthColumn = {
  key: string;
  label: string;
};

type HunterRow = {
  hunterName: string;
  monthly: Record<string, number>;
  total: number;
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const CHART_PRIMARY_COLOR = "#295cab";
const HUNTER_CHART_COLOR_SHADES = [
  "#1a3d6e",
  "#295cab",
  "#3a6fbf",
  "#4b83d2",
  "#5c97e5",
  "#6dabf8",
  "#7eb8fa",
];

function parseMonthKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  return (year || 0) * 100 + (month || 0);
}

function isMonthKeyInRange(monthKey: string, from: string, to: string) {
  if (!from || !to) return true;
  const value = parseMonthKey(monthKey);
  const fromDate = new Date(from);
  const toDate = new Date(to);
  const fromValue = fromDate.getFullYear() * 100 + (fromDate.getMonth() + 1);
  const toValue = toDate.getFullYear() * 100 + (toDate.getMonth() + 1);
  return value >= fromValue && value <= toValue;
}

function collectHunterRows(sections: ReportSection[]): HunterRow[] {
  const rows: HunterRow[] = [];

  sections.forEach((section) => {
    const sectionRows = section.customData?.rows || [];
    sectionRows.forEach((row: HunterRow) => {
      rows.push({
        hunterName: row.hunterName,
        monthly: { ...row.monthly },
        total: row.total,
      });
    });
  });

  return rows;
}

function getVisibleMonthColumns(
  monthColumns: MonthColumn[],
  filters: ReportFilters,
): MonthColumn[] {
  return monthColumns.filter((column) =>
    isMonthKeyInRange(column.key, filters.from, filters.to),
  );
}

function sumMonthlyTotals(rows: HunterRow[], monthColumns: MonthColumn[]) {
  const monthlyTotals = monthColumns.reduce<Record<string, number>>(
    (acc, column) => {
      acc[column.key] = rows.reduce(
        (sum, row) => sum + (row.monthly[column.key] || 0),
        0,
      );
      return acc;
    },
    {},
  );

  const grandTotal = rows.reduce((sum, row) => sum + row.total, 0);

  return { monthlyTotals, grandTotal };
}

export const HunterWiseMerchantOnboardingReport = forwardRef<
  HunterWiseMerchantOnboardingReportHandle,
  HunterWiseMerchantOnboardingReportProps
>(({ sections, filters }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [drawerPage, setDrawerPage] = useState(1);
  const [selectedHunterState, setSelectedHunterState] = useState<{
    hunterName: string;
    monthKey: string | null;
  } | null>(null);
  const [drawerHunterPage, setDrawerHunterPage] = useState(1);

  const monthColumns = useMemo(
    () => (sections[0]?.customData?.monthColumns || []) as MonthColumn[],
    [sections],
  );

  const hunterRows = useMemo(() => collectHunterRows(sections), [sections]);

  const visibleMonthColumns = useMemo(
    () => getVisibleMonthColumns(monthColumns, filters),
    [monthColumns, filters],
  );

  const filteredRows = useMemo(() => {
    if (!filters.from || !filters.to) {
      return hunterRows;
    }

    return hunterRows
      .map((row) => {
        const monthly = visibleMonthColumns.reduce<Record<string, number>>(
          (acc, column) => {
            acc[column.key] = row.monthly[column.key] || 0;
            return acc;
          },
          {},
        );

        const total = visibleMonthColumns.reduce(
          (sum, column) => sum + (monthly[column.key] || 0),
          0,
        );

        return { ...row, monthly, total };
      })
      .filter((row) => row.total > 0 || !filters.from);
  }, [hunterRows, visibleMonthColumns, filters.from, filters.to]);

  const totals = useMemo(
    () => sumMonthlyTotals(filteredRows, visibleMonthColumns),
    [filteredRows, visibleMonthColumns],
  );

  useEffect(() => {
    setDrawerPage(1);
  }, [selectedMonth]);

  const parsedMonth = useMemo(() => {
    if (!selectedMonth) return null;
    const col = visibleMonthColumns.find((c) => c.label === selectedMonth);
    if (!col) return null;
    const parts = col.key.split("-");
    if (parts.length !== 2) return null;
    return { year: Number(parts[0]), month: Number(parts[1]) - 1 };
  }, [selectedMonth, visibleMonthColumns]);

  const drawerMerchants = useMemo(() => {
    if (!parsedMonth || !selectedMonth) return [];

    const col = visibleMonthColumns.find((c) => c.label === selectedMonth);
    if (!col) return [];
    const count = totals.monthlyTotals[col.key] || 0;

    const dummySectors = [
      "Retail",
      "Pureplay Ecommerce",
      "Healthcare",
      "Education",
      "Food & Beverage",
      "Telecommunication",
      "Superstore",
      "Electronics",
    ];

    return Array.from({ length: count }, (_, i) => {
      const id = `dummy_merch_${parsedMonth.year}_${parsedMonth.month}_${i}`;
      const types = ["Physical", "Online"];
      const mType = types[i % 2];
      const name = `Merchant ${mType} ${i + 1}`;
      const storeId = `merch_${parsedMonth.year.toString().slice(2)}${(parsedMonth.month + 1).toString().padStart(2, "0")}_${i + 1}`;
      return {
        id,
        name,
        storeId,
        sector: dummySectors[i % dummySectors.length],
        gmv7d: Math.floor(50000 + Math.random() * 500000),
        successRate7d: Math.floor(75 + Math.random() * 23),
        type: mType,
      };
    });
  }, [parsedMonth, selectedMonth, visibleMonthColumns, totals.monthlyTotals]);

  const drawerItemsPerPage = 10;
  const drawerTotalPages = Math.max(
    1,
    Math.ceil(drawerMerchants.length / drawerItemsPerPage),
  );

  const paginatedDrawerMerchants = useMemo(() => {
    const start = (drawerPage - 1) * drawerItemsPerPage;
    return drawerMerchants.slice(start, start + drawerItemsPerPage);
  }, [drawerMerchants, drawerPage]);

  const scrollDrawerToTop = () => {
    const scrollEl = document.querySelector(".hunter-onboarding-drawer-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setDrawerHunterPage(1);
  }, [selectedHunterState]);

  const drawerHunterMerchants = useMemo(() => {
    if (!selectedHunterState) return [];

    const row = filteredRows.find(
      (r) => r.hunterName === selectedHunterState.hunterName,
    );
    if (!row) return [];

    const count = selectedHunterState.monthKey
      ? row.monthly[selectedHunterState.monthKey] || 0
      : row.total;

    const dummySectors = [
      "Retail",
      "Pureplay Ecommerce",
      "Healthcare",
      "Education",
      "Food & Beverage",
      "Telecommunication",
      "Superstore",
      "Electronics",
    ];

    return Array.from({ length: count }, (_, i) => {
      const id = `dummy_hunter_merch_${selectedHunterState.hunterName.replace(/\s+/g, "_")}_${selectedHunterState.monthKey || "total"}_${i}`;
      const types = ["Physical", "Online"];
      const mType = types[i % 2];
      const name = `Merchant ${mType} ${i + 1}`;
      const storeId = `merch_hunter_${i + 1}`;
      return {
        id,
        name,
        storeId,
        sector: dummySectors[i % dummySectors.length],
        gmv7d: Math.floor(50000 + Math.random() * 500000),
        successRate7d: Math.floor(75 + Math.random() * 23),
        type: mType,
      };
    });
  }, [selectedHunterState, filteredRows]);

  const drawerHunterItemsPerPage = 10;
  const drawerHunterTotalPages = Math.max(
    1,
    Math.ceil(drawerHunterMerchants.length / drawerHunterItemsPerPage),
  );

  const paginatedDrawerHunterMerchants = useMemo(() => {
    const start = (drawerHunterPage - 1) * drawerHunterItemsPerPage;
    return drawerHunterMerchants.slice(start, start + drawerHunterItemsPerPage);
  }, [drawerHunterMerchants, drawerHunterPage]);

  const scrollHunterDrawerToTop = () => {
    const scrollEl = document.querySelector(".hunter-chart-drawer-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  const monthlyChartData = useMemo(
    () =>
      visibleMonthColumns.map((column) => ({
        month: column.label,
        totalMerchants: totals.monthlyTotals[column.key] || 0,
      })),
    [visibleMonthColumns, totals.monthlyTotals],
  );

  const hunterChartData = useMemo(
    () =>
      [...filteredRows]
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((row) => ({
          hunter: row.hunterName,
          fullHunter: row.hunterName,
          totalMerchants: row.total,
        })),
    [filteredRows],
  );

  const hunterChartHeight = Math.max(288, hunterChartData.length * 36);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.from, filters.to, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Hunter Name",
      ...visibleMonthColumns.map((column) => column.label),
      "Total Merchant",
    ];
    const rows = filteredRows.map((row, index) => [
      index + 1,
      row.hunterName,
      ...visibleMonthColumns.map((column) => row.monthly[column.key] || 0),
      row.total,
    ]);

    if (rows.length === 0) return null;

    rows.push([
      "",
      "Total In 365 days",
      ...visibleMonthColumns.map(
        (column) => totals.monthlyTotals[column.key] || 0,
      ),
      totals.grandTotal,
    ]);

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
          `hunter-wise-merchant-onboarding-${filters.from}-${filters.to}.csv`,
        );
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (hunterRows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No hunter onboarding data found for the selected filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Monthly Total Merchants
          </h3>
          <div
            className="h-[320px] w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
            onMouseDown={(e) => e.preventDefault()}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyChartData}
                margin={{ top: 10, right: 10, left: -12, bottom: 0 }}
              >
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
                  cursor={false}
                  formatter={(value: number) => [value, "Total Merchants"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.month || ""
                  }
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="totalMerchants"
                  name="Total Merchants"
                  fill={CHART_PRIMARY_COLOR}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                  activeBar={false}
                  onClick={(data) => {
                    if (data && data.month) {
                      setSelectedMonth(data.month);
                    }
                  }}
                  cursor="pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Hunter Wise Total Merchants
          </h3>
          <div
            className="w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
            style={{ height: hunterChartHeight }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {hunterChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={hunterChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="hunter"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value: number) => [value, "Total Merchants"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullHunter || ""
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="totalMerchants"
                    name="Total Merchants"
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                    activeBar={false}
                    onClick={(data) => {
                      if (data && data.hunter) {
                        if (data.totalMerchants > 0) {
                          setSelectedHunterState({
                            hunterName: data.hunter,
                            monthKey: null,
                          });
                        }
                      }
                    }}
                    cursor="pointer"
                  >
                    {hunterChartData.map((entry, index) => (
                      <Cell
                        key={`hunter-bar-${entry.fullHunter}`}
                        fill={
                          HUNTER_CHART_COLOR_SHADES[
                            index % HUNTER_CHART_COLOR_SHADES.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                No hunter onboarding data for the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Hunter Wise Merchant Onboarding Summary
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const content = generateCsvContent();
                if (content) {
                  downloadCsv(
                    content,
                    `hunter-wise-merchant-onboarding-${filters.from || "all"}-${filters.to || "time"}.csv`,
                  );
                } else {
                  alert("No rows to export for current filters.");
                }
              }}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Export
            </button>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span className="whitespace-nowrap">Show</span>
              <div className="relative">
                <select
                  value={rowsPerPage}
                  onChange={(e) => setRowsPerPage(Number(e.target.value))}
                  className="appearance-none pl-3 pr-9 py-1.5 border border-slate-200 rounded-lg text-sm bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 cursor-pointer"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <span className="whitespace-nowrap">entries</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Hunter Name
                </th>
                {visibleMonthColumns.map((column) => (
                  <th
                    key={column.key}
                    className="px-3 py-3 text-center whitespace-nowrap"
                  >
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-center whitespace-nowrap">
                  Total Merchant
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedRows.map((row, idx) => (
                <tr
                  key={row.hunterName}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.total > 0 ? (
                      <button
                        onClick={() =>
                          setSelectedHunterState({
                            hunterName: row.hunterName,
                            monthKey: null,
                          })
                        }
                        className="text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                      >
                        {row.hunterName}
                      </button>
                    ) : (
                      <span>{row.hunterName}</span>
                    )}
                  </td>
                  {visibleMonthColumns.map((column) => {
                    const val = row.monthly[column.key] || 0;
                    return (
                      <td
                        key={`${row.hunterName}-${column.key}`}
                        className="px-3 py-3 text-center text-slate-700 tabular-nums"
                      >
                        {val > 0 ? (
                          <button
                            onClick={() =>
                              setSelectedHunterState({
                                hunterName: row.hunterName,
                                monthKey: column.key,
                              })
                            }
                            className="text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                          >
                            {val}
                          </button>
                        ) : (
                          <span>{val}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-center text-slate-700 font-medium tabular-nums">
                    {row.total > 0 ? (
                      <button
                        onClick={() =>
                          setSelectedHunterState({
                            hunterName: row.hunterName,
                            monthKey: null,
                          })
                        }
                        className="text-primary-600 hover:text-primary-700 hover:underline font-semibold cursor-pointer transition-colors"
                      >
                        {row.total}
                      </button>
                    ) : (
                      <span>{row.total}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-4 py-3" colSpan={2}>
                  Total In 365 days
                </td>
                {visibleMonthColumns.map((column) => (
                  <td
                    key={`total-${column.key}`}
                    className="px-3 py-3 text-center tabular-nums"
                  >
                    {totals.monthlyTotals[column.key] || 0}
                  </td>
                ))}
                <td className="px-4 py-3 text-center tabular-nums">
                  {totals.grandTotal}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            {(() => {
              const total = filteredRows.length;
              const from = (currentPage - 1) * rowsPerPage + 1;
              const to = Math.min(currentPage * rowsPerPage, total);
              return `Showing ${from} to ${to} of ${total} entries`;
            })()}
          </p>
          <div className="flex items-center gap-3">
            <button
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="text-sm font-semibold text-slate-600 select-none">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600"
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
      {/* Hunter Onboarded Merchants Drawer */}
      <Drawer
        open={selectedMonth !== null}
        onClose={() => setSelectedMonth(null)}
        title="Onboarded Merchants"
        subtitle={
          selectedMonth ? `List of merchants onboarded in ${selectedMonth}` : ""
        }
        width="xl"
        noPadding
        contentClassName="overflow-hidden flex flex-col"
      >
        <div className="flex flex-col h-full min-h-0 bg-white">
          <div className="hunter-onboarding-drawer-scroll flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white">
            {paginatedDrawerMerchants.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paginatedDrawerMerchants.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedMonth(null);
                      navigate(`/merchants/profile/${m.id}`);
                    }}
                    className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-all px-2 -mx-2 rounded-lg group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[10px] font-bold text-slate-300 w-8 group-hover:text-primary-400 transition-colors">
                        {((drawerPage - 1) * drawerItemsPerPage + idx + 1)
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {m.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: {m.storeId} · Sector: {m.sector} · {m.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        ৳{m.gmv7d.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        SR: {m.successRate7d}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400">
                  No merchants found for {selectedMonth}.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Pagination Footer */}
          {drawerTotalPages > 1 && (
            <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Showing {(drawerPage - 1) * drawerItemsPerPage + 1} to{" "}
                  {Math.min(
                    drawerPage * drawerItemsPerPage,
                    drawerMerchants.length,
                  )}{" "}
                  of {drawerMerchants.length} entries
                </p>
                <div className="flex items-center gap-3">
                  <button
                    disabled={drawerPage === 1}
                    onClick={() => {
                      setDrawerPage((prev) => Math.max(1, prev - 1));
                      scrollDrawerToTop();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600 select-none">
                    Page {drawerPage} of {drawerTotalPages}
                  </span>
                  <button
                    disabled={drawerPage === drawerTotalPages}
                    onClick={() => {
                      setDrawerPage((prev) =>
                        Math.min(drawerTotalPages, prev + 1),
                      );
                      scrollDrawerToTop();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
      {/* Hunter Wise Chart Drawer */}
      <Drawer
        open={selectedHunterState !== null}
        onClose={() => setSelectedHunterState(null)}
        title="Onboarded Merchants"
        subtitle={
          selectedHunterState
            ? `Merchants onboarded by ${selectedHunterState.hunterName}`
            : ""
        }
        width="xl"
        noPadding
        contentClassName="overflow-hidden flex flex-col"
      >
        <div className="flex flex-col h-full min-h-0 bg-white">
          <div className="hunter-chart-drawer-scroll flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white">
            {paginatedDrawerHunterMerchants.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {paginatedDrawerHunterMerchants.map((m, idx) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setSelectedHunterState(null);
                      navigate(`/merchants/profile/${m.id}`);
                    }}
                    className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-all px-2 -mx-2 rounded-lg group"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <span className="text-[10px] font-bold text-slate-300 w-8 group-hover:text-primary-400 transition-colors">
                        {(
                          (drawerHunterPage - 1) * drawerHunterItemsPerPage +
                          idx +
                          1
                        )
                          .toString()
                          .padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {m.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          ID: {m.storeId} · Sector: {m.sector} · {m.type}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-bold text-slate-900">
                        ৳{m.gmv7d.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        SR: {m.successRate7d}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <p className="text-sm text-slate-400">
                  No merchants found for {selectedHunterState?.hunterName}.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Pagination Footer */}
          {drawerHunterTotalPages > 1 && (
            <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">
                  Showing{" "}
                  {(drawerHunterPage - 1) * drawerHunterItemsPerPage + 1} to{" "}
                  {Math.min(
                    drawerHunterPage * drawerHunterItemsPerPage,
                    drawerHunterMerchants.length,
                  )}{" "}
                  of {drawerHunterMerchants.length} entries
                </p>
                <div className="flex items-center gap-3">
                  <button
                    disabled={drawerHunterPage === 1}
                    onClick={() => {
                      setDrawerHunterPage((prev) => Math.max(1, prev - 1));
                      scrollHunterDrawerToTop();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-semibold text-slate-600 select-none">
                    Page {drawerHunterPage} of {drawerHunterTotalPages}
                  </span>
                  <button
                    disabled={drawerHunterPage === drawerHunterTotalPages}
                    onClick={() => {
                      setDrawerHunterPage((prev) =>
                        Math.min(drawerHunterTotalPages, prev + 1),
                      );
                      scrollHunterDrawerToTop();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
});

HunterWiseMerchantOnboardingReport.displayName =
  "HunterWiseMerchantOnboardingReport";
