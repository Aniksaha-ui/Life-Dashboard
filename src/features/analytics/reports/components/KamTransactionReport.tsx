import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { clsx } from "clsx";
import { ChevronDown, Download } from "lucide-react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface KamTransactionReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface KamTransactionReportHandle {
  exportData: () => void;
}

type MonthColumn = {
  key: string;
  label: string;
};

type KamMetricRow = {
  kamName: string;
  monthly: Record<string, number>;
  total: number;
};

type TrendType = "amount" | "transaction" | "revenue";
type TrendFilter = "all" | TrendType;

type KamCombinedRow = {
  kamName: string;
  amount: KamMetricRow;
  transaction: KamMetricRow;
  revenue: KamMetricRow;
};

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const METRIC_LABELS: Record<TrendType, { short: string; total: string }> = {
  amount: { short: "Amount", total: "Total Amount" },
  transaction: { short: "Transaction", total: "Total Transaction" },
  revenue: { short: "Revenue", total: "SSL Total Revenue" },
};

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

function getTrendFilter(trendType?: string): TrendFilter {
  if (
    trendType === "amount" ||
    trendType === "transaction" ||
    trendType === "revenue"
  ) {
    return trendType;
  }
  return "all";
}

function formatAmountValue(value: number): string {
  if (value === 0) return "0.00";
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

function formatRevenueValue(value: number): string {
  if (value === 0) return "0.00";
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(2)}K`;
  }
  return value.toFixed(2);
}

function formatTransactionValue(value: number): string {
  return String(Math.round(value));
}

function formatMetricValue(value: number, metric: TrendType): string {
  if (metric === "transaction") return formatTransactionValue(value);
  if (metric === "revenue") return formatRevenueValue(value);
  return formatAmountValue(value);
}

function getVisibleMonthColumns(
  monthColumns: MonthColumn[],
  filters: ReportFilters,
) {
  return monthColumns.filter((column) =>
    isMonthKeyInRange(column.key, filters.from, filters.to),
  );
}

function mapMetricRowsForVisibleMonths(
  rows: KamMetricRow[],
  visibleMonthColumns: MonthColumn[],
): KamMetricRow[] {
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

function buildCombinedRows(
  amountRows: KamMetricRow[],
  transactionRows: KamMetricRow[],
  revenueRows: KamMetricRow[],
  visibleMonthColumns: MonthColumn[],
): KamCombinedRow[] {
  const kamNames = new Set<string>([
    ...amountRows.map((row) => row.kamName),
    ...transactionRows.map((row) => row.kamName),
    ...revenueRows.map((row) => row.kamName),
  ]);

  const amountByKam = new Map(
    mapMetricRowsForVisibleMonths(amountRows, visibleMonthColumns).map(
      (row) => [row.kamName, row],
    ),
  );
  const transactionByKam = new Map(
    mapMetricRowsForVisibleMonths(transactionRows, visibleMonthColumns).map(
      (row) => [row.kamName, row],
    ),
  );
  const revenueByKam = new Map(
    mapMetricRowsForVisibleMonths(revenueRows, visibleMonthColumns).map(
      (row) => [row.kamName, row],
    ),
  );

  const emptyMetric = (kamName: string): KamMetricRow => ({
    kamName,
    monthly: visibleMonthColumns.reduce<Record<string, number>>(
      (acc, column) => {
        acc[column.key] = 0;
        return acc;
      },
      {},
    ),
    total: 0,
  });

  return Array.from(kamNames).map((kamName) => ({
    kamName,
    amount: amountByKam.get(kamName) ?? emptyMetric(kamName),
    transaction: transactionByKam.get(kamName) ?? emptyMetric(kamName),
    revenue: revenueByKam.get(kamName) ?? emptyMetric(kamName),
  }));
}

function sumMetricTotals(
  rows: KamCombinedRow[],
  visibleMonthColumns: MonthColumn[],
  metric: TrendType,
) {
  const monthlyTotals = visibleMonthColumns.reduce<Record<string, number>>(
    (acc, column) => {
      acc[column.key] = rows.reduce(
        (sum, row) => sum + (row[metric].monthly[column.key] || 0),
        0,
      );
      return acc;
    },
    {},
  );

  const grandTotal = rows.reduce((sum, row) => sum + row[metric].total, 0);

  return { monthlyTotals, grandTotal };
}

function getVisibleMetrics(trendFilter: TrendFilter): TrendType[] {
  if (trendFilter === "all") {
    return ["amount", "transaction", "revenue"];
  }
  return [trendFilter];
}

function getMetricTotals(
  metric: TrendType,
  amountTotals: ReturnType<typeof sumMetricTotals>,
  transactionTotals: ReturnType<typeof sumMetricTotals>,
  revenueTotals: ReturnType<typeof sumMetricTotals>,
) {
  if (metric === "transaction") return transactionTotals;
  if (metric === "revenue") return revenueTotals;
  return amountTotals;
}

function MetricCell({ value, metric }: { value: number; metric: TrendType }) {
  return (
    <span className="tabular-nums text-slate-700">
      {formatMetricValue(value, metric)}
    </span>
  );
}

export const KamTransactionReport = forwardRef<
  KamTransactionReportHandle,
  KamTransactionReportProps
>(({ sections, filters }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const trendFilter = getTrendFilter(filters.trendType);
  const visibleMetrics = useMemo(
    () => getVisibleMetrics(trendFilter),
    [trendFilter],
  );
  const isCombinedView = visibleMetrics.length > 1;
  const singleMetric = isCombinedView ? null : visibleMetrics[0];

  const monthColumns = useMemo(
    () => (sections[0]?.customData?.monthColumns || []) as MonthColumn[],
    [sections],
  );

  const amountRows = useMemo(
    () => (sections[0]?.customData?.amount?.rows || []) as KamMetricRow[],
    [sections],
  );

  const transactionRows = useMemo(
    () => (sections[0]?.customData?.transaction?.rows || []) as KamMetricRow[],
    [sections],
  );

  const revenueRows = useMemo(
    () => (sections[0]?.customData?.revenue?.rows || []) as KamMetricRow[],
    [sections],
  );

  const visibleMonthColumns = useMemo(
    () => getVisibleMonthColumns(monthColumns, filters),
    [monthColumns, filters],
  );

  const displayRows = useMemo(() => {
    const combined = buildCombinedRows(
      amountRows,
      transactionRows,
      revenueRows,
      visibleMonthColumns,
    );

    return [...combined].sort((a, b) => a.kamName.localeCompare(b.kamName));
  }, [amountRows, transactionRows, revenueRows, visibleMonthColumns]);

  const amountTotals = useMemo(
    () => sumMetricTotals(displayRows, visibleMonthColumns, "amount"),
    [displayRows, visibleMonthColumns],
  );

  const transactionTotals = useMemo(
    () => sumMetricTotals(displayRows, visibleMonthColumns, "transaction"),
    [displayRows, visibleMonthColumns],
  );

  const revenueTotals = useMemo(
    () => sumMetricTotals(displayRows, visibleMonthColumns, "revenue"),
    [displayRows, visibleMonthColumns],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.from, filters.to, filters.trendType, rowsPerPage]);

  const totalPages = Math.max(1, Math.ceil(displayRows.length / rowsPerPage));
  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return displayRows.slice(start, start + rowsPerPage);
  }, [displayRows, currentPage, rowsPerPage]);

  const generateCsvContent = () => {
    const monthHeaders = visibleMonthColumns.flatMap((column) =>
      visibleMetrics.map(
        (metric) => `${column.label} ${METRIC_LABELS[metric].short}`,
      ),
    );

    const headers = [
      "Kam Name",
      ...monthHeaders,
      ...visibleMetrics.map((metric) => METRIC_LABELS[metric].total),
    ];

    const rows = displayRows.map((row) => [
      row.kamName,
      ...visibleMonthColumns.flatMap((column) =>
        visibleMetrics.map((metric) => row[metric].monthly[column.key] || 0),
      ),
      ...visibleMetrics.map((metric) => row[metric].total),
    ]);

    if (rows.length === 0) return null;

    rows.push([
      "Total In 365 days",
      ...visibleMonthColumns.flatMap((column) =>
        visibleMetrics.map((metric) => {
          const totals = getMetricTotals(
            metric,
            amountTotals,
            transactionTotals,
            revenueTotals,
          );
          return totals.monthlyTotals[column.key] || 0;
        }),
      ),
      ...visibleMetrics.map((metric) => {
        const totals = getMetricTotals(
          metric,
          amountTotals,
          transactionTotals,
          revenueTotals,
        );
        return totals.grandTotal;
      }),
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
        `kam-transaction-report-${filters.from || "all"}-${filters.to || "time"}.csv`,
      );
    } else {
      alert("No rows to export for current filters.");
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  if (displayRows.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No KAM transaction data found for the selected filters.
      </div>
    );
  }

  const tableMinWidth = isCombinedView ? "min-w-[1600px]" : "min-w-[900px]";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            KAM Transaction Summary
          </h3>
        </div>
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
        <table
          className={clsx("w-full text-sm border-collapse", tableMinWidth)}
        >
          <thead>
            {isCombinedView ? (
              <>
                <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <th
                    rowSpan={2}
                    className="px-4 py-3 text-left whitespace-nowrap align-middle border-r border-slate-200"
                  >
                    Kam Name
                  </th>
                  {visibleMonthColumns.map((column) => (
                    <th
                      key={column.key}
                      colSpan={visibleMetrics.length}
                      className="px-3 py-3 text-center whitespace-nowrap border-r border-slate-200"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th
                    colSpan={visibleMetrics.length}
                    className="px-3 py-3 text-center whitespace-nowrap"
                  >
                    Totals
                  </th>
                </tr>
                <tr className="bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  {visibleMonthColumns.map((column) =>
                    visibleMetrics.map((metric) => (
                      <th
                        key={`${column.key}-${metric}`}
                        className="px-2 py-2 text-center whitespace-nowrap border-r border-slate-100"
                      >
                        {METRIC_LABELS[metric].short}
                      </th>
                    )),
                  )}
                  {visibleMetrics.map((metric) => (
                    <th
                      key={`total-${metric}`}
                      className="px-2 py-2 text-center whitespace-nowrap"
                    >
                      {METRIC_LABELS[metric].short}
                    </th>
                  ))}
                </tr>
              </>
            ) : (
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Kam Name
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
                  {singleMetric ? METRIC_LABELS[singleMetric].total : "Total"}
                </th>
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedRows.map((row) => (
              <tr
                key={row.kamName}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td
                  className={clsx(
                    "px-4 py-3 text-left text-slate-700 whitespace-nowrap font-medium",
                    isCombinedView && "border-r border-slate-100",
                  )}
                >
                  {row.kamName}
                </td>
                {isCombinedView
                  ? visibleMonthColumns.map((column) =>
                      visibleMetrics.map((metric) => (
                        <td
                          key={`${row.kamName}-${column.key}-${metric}`}
                          className="px-2 py-3 text-center border-r border-slate-50"
                        >
                          <MetricCell
                            value={row[metric].monthly[column.key] || 0}
                            metric={metric}
                          />
                        </td>
                      )),
                    )
                  : visibleMonthColumns.map((column) => (
                      <td
                        key={`${row.kamName}-${column.key}`}
                        className="px-3 py-3 text-center text-slate-700"
                      >
                        {singleMetric && (
                          <MetricCell
                            value={row[singleMetric].monthly[column.key] || 0}
                            metric={singleMetric}
                          />
                        )}
                      </td>
                    ))}
                {isCombinedView
                  ? visibleMetrics.map((metric) => (
                      <td
                        key={`${row.kamName}-total-${metric}`}
                        className="px-2 py-3 text-center font-semibold"
                      >
                        <MetricCell value={row[metric].total} metric={metric} />
                      </td>
                    ))
                  : singleMetric && (
                      <td className="px-4 py-3 text-center font-semibold text-slate-700">
                        <MetricCell
                          value={row[singleMetric].total}
                          metric={singleMetric}
                        />
                      </td>
                    )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
              <td
                className={clsx(
                  "px-4 py-3",
                  isCombinedView && "border-r border-slate-200",
                )}
              >
                Total In 365 days
              </td>
              {isCombinedView
                ? visibleMonthColumns.map((column) =>
                    visibleMetrics.map((metric) => {
                      const totals = getMetricTotals(
                        metric,
                        amountTotals,
                        transactionTotals,
                        revenueTotals,
                      );

                      return (
                        <td
                          key={`footer-${column.key}-${metric}`}
                          className="px-2 py-3 text-center tabular-nums border-r border-slate-100"
                        >
                          {formatMetricValue(
                            totals.monthlyTotals[column.key] || 0,
                            metric,
                          )}
                        </td>
                      );
                    }),
                  )
                : visibleMonthColumns.map((column) => {
                    const totals = singleMetric
                      ? getMetricTotals(
                          singleMetric,
                          amountTotals,
                          transactionTotals,
                          revenueTotals,
                        )
                      : amountTotals;

                    return (
                      <td
                        key={`footer-${column.key}`}
                        className="px-3 py-3 text-center tabular-nums"
                      >
                        {singleMetric &&
                          formatMetricValue(
                            totals.monthlyTotals[column.key] || 0,
                            singleMetric,
                          )}
                      </td>
                    );
                  })}
              {isCombinedView
                ? visibleMetrics.map((metric) => {
                    const totals = getMetricTotals(
                      metric,
                      amountTotals,
                      transactionTotals,
                      revenueTotals,
                    );

                    return (
                      <td
                        key={`footer-total-${metric}`}
                        className="px-2 py-3 text-center tabular-nums"
                      >
                        {formatMetricValue(totals.grandTotal, metric)}
                      </td>
                    );
                  })
                : singleMetric && (
                    <td className="px-4 py-3 text-center tabular-nums">
                      {formatMetricValue(
                        getMetricTotals(
                          singleMetric,
                          amountTotals,
                          transactionTotals,
                          revenueTotals,
                        ).grandTotal,
                        singleMetric,
                      )}
                    </td>
                  )}
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
            type="button"
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
            type="button"
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
  );
});

KamTransactionReport.displayName = "KamTransactionReport";
