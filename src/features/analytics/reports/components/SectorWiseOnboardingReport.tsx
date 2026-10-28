import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
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
import {
  SectorOnboardingMerchantDrawer,
  type SectorOnboardingMerchantDrawerContext,
} from "./SectorOnboardingMerchantDrawer";

interface SectorWiseOnboardingReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface SectorWiseOnboardingReportHandle {
  exportData: () => void;
}

type MonthColumn = {
  key: string;
  label: string;
};

type SectorRow = {
  sectorName: string;
  monthly: Record<string, number>;
  total: number;
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const CHART_PRIMARY_COLOR = "#295cab";
const SECTOR_CHART_COLOR_SHADES = [
  "#1a3d6e",
  "#295cab",
  "#3a6fbf",
  "#4b83d2",
  "#5c97e5",
  "#6dabf8",
  "#7eb8fa",
  "#8fc5fb",
  "#a0d2fc",
  "#b1dffd",
  "#c2ecfe",
  "#d3f3fe",
  "#e4f7fe",
  "#f0faff",
];

function truncateSectorLabel(sectorName: string, maxLength = 24) {
  if (sectorName.length <= maxLength) return sectorName;
  return `${sectorName.slice(0, maxLength - 1)}…`;
}

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

function collectSectorRows(sections: ReportSection[]): SectorRow[] {
  const rows: SectorRow[] = [];

  sections.forEach((section) => {
    const sectionRows = section.customData?.rows || [];
    sectionRows.forEach((row: SectorRow) => {
      rows.push({
        sectorName: row.sectorName,
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
) {
  return monthColumns.filter((column) =>
    isMonthKeyInRange(column.key, filters.from, filters.to),
  );
}

function mapRowsForVisibleMonths(
  rows: SectorRow[],
  visibleMonthColumns: MonthColumn[],
): SectorRow[] {
  return rows.map((row) => {
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
  });
}

function sumMonthlyTotals(rows: SectorRow[], monthColumns: MonthColumn[]) {
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

function renderCellValue(value: number, onOpenMerchants?: () => void) {
  if (value > 0) {
    return (
      <button
        type="button"
        onClick={onOpenMerchants}
        className="text-primary-600 font-medium hover:text-primary-700 hover:underline transition-colors cursor-pointer"
      >
        {value}
      </button>
    );
  }

  return <span className="text-slate-400">{value}</span>;
}

export const SectorWiseOnboardingReport = forwardRef<
  SectorWiseOnboardingReportHandle,
  SectorWiseOnboardingReportProps
>(({ sections, filters }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [merchantDrawerContext, setMerchantDrawerContext] =
    useState<SectorOnboardingMerchantDrawerContext | null>(null);

  const monthColumns = useMemo(
    () => (sections[0]?.customData?.monthColumns || []) as MonthColumn[],
    [sections],
  );

  const merchantPool = useMemo(() => {
    const pool = sections[0]?.customData?.merchantPool;
    return Array.isArray(pool) && pool.length > 0 ? pool : undefined;
  }, [sections]);

  const openMerchantDrawer = (
    sectorName: string,
    count: number,
    monthLabel?: string,
  ) => {
    setMerchantDrawerContext({ sectorName, monthLabel, count });
  };

  const closeMerchantDrawer = () => {
    setMerchantDrawerContext(null);
  };

  const sectorRows = useMemo(() => collectSectorRows(sections), [sections]);

  const visibleMonthColumns = useMemo(
    () => getVisibleMonthColumns(monthColumns, filters),
    [monthColumns, filters],
  );

  const displayRows = useMemo(
    () => mapRowsForVisibleMonths(sectorRows, visibleMonthColumns),
    [sectorRows, visibleMonthColumns],
  );

  const totals = useMemo(
    () => sumMonthlyTotals(displayRows, visibleMonthColumns),
    [displayRows, visibleMonthColumns],
  );

  const monthlyChartData = useMemo(
    () =>
      visibleMonthColumns.map((column) => ({
        month: column.label,
        totalMerchants: totals.monthlyTotals[column.key] || 0,
      })),
    [visibleMonthColumns, totals.monthlyTotals],
  );

  const sectorChartData = useMemo(
    () =>
      [...displayRows]
        .filter((row) => row.total > 0)
        .sort((a, b) => b.total - a.total)
        .map((row) => ({
          sector: truncateSectorLabel(row.sectorName),
          fullSector: row.sectorName,
          totalMerchants: row.total,
        })),
    [displayRows],
  );

  const sectorChartHeight = Math.max(288, sectorChartData.length * 36);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.from, filters.to, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(displayRows.length / rowsPerPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return displayRows.slice(start, start + rowsPerPage);
  }, [displayRows, currentPage, rowsPerPage]);

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Sector Name",
      ...visibleMonthColumns.map((column) => column.label),
      "Total Merchant",
    ];
    const rows = displayRows.map((row, index) => [
      index + 1,
      row.sectorName,
      ...visibleMonthColumns.map((column) => row.monthly[column.key] || 0),
      row.total,
    ]);

    if (rows.length === 0) return null;

    rows.push([
      "",
      "Total in 365 days",
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
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const content = generateCsvContent();
    if (content) {
      downloadCsv(
        content,
        `sector-wise-onboarding-${filters.from || "all"}-${filters.to || "time"}.csv`,
      );
    } else {
      alert("No rows to export for current filters.");
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  if (sectorRows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No sector onboarding data found for the selected filters.
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
                    if (data && data.totalMerchants > 0) {
                      openMerchantDrawer(
                        data.month,
                        data.totalMerchants,
                        data.month,
                      );
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
            Sector Wise Total Merchants
          </h3>
          <div
            className="w-full [&_.recharts-wrapper]:outline-none [&_.recharts-wrapper]:focus-visible:outline-none [&_svg]:outline-none [&_svg]:focus-visible:outline-none"
            style={{ height: sectorChartHeight }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {sectorChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectorChartData}
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
                    dataKey="sector"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11 }}
                    width={148}
                  />
                  <Tooltip
                    cursor={false}
                    formatter={(value: number) => [value, "Total Merchants"]}
                    labelFormatter={(_, payload) =>
                      payload?.[0]?.payload?.fullSector || ""
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
                      if (data && data.totalMerchants > 0) {
                        openMerchantDrawer(
                          data.fullSector,
                          data.totalMerchants,
                        );
                      }
                    }}
                    cursor="pointer"
                  >
                    {sectorChartData.map((entry, index) => (
                      <Cell
                        key={`sector-bar-${entry.fullSector}`}
                        fill={
                          SECTOR_CHART_COLOR_SHADES[
                            index % SECTOR_CHART_COLOR_SHADES.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-slate-500">
                No sector onboarding data for the selected filters.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Sector Wise Onboarding Summary
          </h3>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
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
          <table className="w-full text-sm border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-center w-12">#</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Sector Name
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
                  key={row.sectorName}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-4 py-3 text-center text-slate-700 tabular-nums">
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-4 py-3 text-left text-slate-700 whitespace-nowrap">
                    {row.sectorName}
                  </td>
                  {visibleMonthColumns.map((column) => (
                    <td
                      key={`${row.sectorName}-${column.key}`}
                      className="px-3 py-3 text-center tabular-nums"
                    >
                      {renderCellValue(row.monthly[column.key] || 0, () =>
                        openMerchantDrawer(
                          row.sectorName,
                          row.monthly[column.key] || 0,
                          column.label,
                        ),
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-center tabular-nums">
                    {renderCellValue(row.total, () =>
                      openMerchantDrawer(row.sectorName, row.total, "Total"),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-4 py-3" colSpan={2}>
                  Total in 365 days
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
              const total = displayRows.length;
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

      <SectorOnboardingMerchantDrawer
        open={merchantDrawerContext !== null}
        onClose={closeMerchantDrawer}
        context={merchantDrawerContext}
        merchantPool={merchantPool}
      />
    </div>
  );
});

SectorWiseOnboardingReport.displayName = "SectorWiseOnboardingReport";
