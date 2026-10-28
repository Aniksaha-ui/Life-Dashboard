import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { ChevronDown, Download } from "lucide-react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import {
  REVENUE_MERCHANT_ROWS,
  aggregateRevenueByKam,
  filterRevenueMerchantRows,
  formatRevenueMetric,
  type RevenueKamRow,
  type RevenueMerchantRow,
} from "../data/revenueReportData";

interface RevenueReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface RevenueReportHandle {
  exportData: () => void;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

const METRIC_HEADERS = [
  "Average TDR Rate(BDT)",
  "Average TDR Rate(%)",
  "Average Bank Charges(BDT)",
  "Average Bank Charges(%)",
  "Average Profit(BDT)",
  "Average Profit(%)",
] as const;

function formatHeaderLabel(header: string) {
  const match = header.match(/^(.+)\((.+)\)$/);
  if (!match) {
    return header;
  }

  return (
    <>
      <span className="block break-words">{match[1].trim()}</span>
      <span className="block break-words">({match[2]})</span>
    </>
  );
}

function RowsPerPageControl({
  rowsPerPage,
  onRowsPerPageChange,
}: {
  rowsPerPage: number;
  onRowsPerPageChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="whitespace-nowrap">Show</span>
      <div className="relative">
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
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
  );
}

function MetricCells({
  row,
}: {
  row: Pick<
    RevenueMerchantRow,
    | "tdrBdt"
    | "tdrPct"
    | "bankChargesBdt"
    | "bankChargesPct"
    | "profitBdt"
    | "profitPct"
  >;
}) {
  return (
    <>
      <td className="px-3 py-3 text-center text-slate-700 tabular-nums whitespace-nowrap">
        {formatRevenueMetric(row.tdrBdt)}
      </td>
      <td className="px-3 py-3 text-center text-slate-700 tabular-nums whitespace-nowrap">
        {formatRevenueMetric(row.tdrPct)}
      </td>
      <td className="px-3 py-3 text-center text-slate-700 tabular-nums whitespace-nowrap">
        {formatRevenueMetric(row.bankChargesBdt)}
      </td>
      <td className="px-3 py-3 text-center text-slate-700 tabular-nums whitespace-nowrap">
        {formatRevenueMetric(row.bankChargesPct)}
      </td>
      <td className="px-3 py-3 text-center text-slate-700 tabular-nums whitespace-nowrap">
        {formatRevenueMetric(row.profitBdt)}
      </td>
      <td className="px-3 py-3 text-center text-slate-700 tabular-nums whitespace-nowrap">
        {formatRevenueMetric(row.profitPct)}
      </td>
    </>
  );
}

function downloadCsv(content: string, filename: string) {
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
    URL.revokeObjectURL(url);
  }
}

function buildMerchantCsv(rows: RevenueMerchantRow[]) {
  const headers = ["#", "Merchant Id", "Merchant Name", ...METRIC_HEADERS];
  const csvRows = rows.map((row, index) => [
    index + 1,
    row.merchantId,
    row.merchantName,
    formatRevenueMetric(row.tdrBdt),
    formatRevenueMetric(row.tdrPct),
    formatRevenueMetric(row.bankChargesBdt),
    formatRevenueMetric(row.bankChargesPct),
    formatRevenueMetric(row.profitBdt),
    formatRevenueMetric(row.profitPct),
  ]);
  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}

function buildKamCsv(rows: RevenueKamRow[]) {
  const headers = ["#", "KAM Name", ...METRIC_HEADERS];
  const csvRows = rows.map((row, index) => [
    index + 1,
    row.kamName,
    formatRevenueMetric(row.tdrBdt),
    formatRevenueMetric(row.tdrPct),
    formatRevenueMetric(row.bankChargesBdt),
    formatRevenueMetric(row.bankChargesPct),
    formatRevenueMetric(row.profitBdt),
    formatRevenueMetric(row.profitPct),
  ]);
  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}

export const RevenueReport = forwardRef<
  RevenueReportHandle,
  RevenueReportProps
>(({ filters }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const revenueView = filters.revenueType === "kam" ? "kam" : "merchant";

  const merchantRows = useMemo(
    () =>
      filterRevenueMerchantRows(
        REVENUE_MERCHANT_ROWS,
        filters.from,
        filters.to,
        filters.kam,
      ),
    [filters.from, filters.to, filters.kam],
  );

  const kamRows = useMemo(
    () => aggregateRevenueByKam(merchantRows),
    [merchantRows],
  );

  const displayRows = revenueView === "kam" ? kamRows : merchantRows;
  const totalPages = Math.max(1, Math.ceil(displayRows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [revenueView, rowsPerPage, filters.from, filters.to, filters.kam]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return displayRows.slice(start, start + rowsPerPage);
  }, [displayRows, currentPage, rowsPerPage]);

  const handleExportCSV = () => {
    const rows = revenueView === "kam" ? kamRows : merchantRows;
    if (rows.length === 0) {
      alert("No rows to export for current filters.");
      return;
    }
    const content =
      revenueView === "kam"
        ? buildKamCsv(kamRows)
        : buildMerchantCsv(merchantRows);
    const suffix = revenueView === "kam" ? "by-kam" : "by-merchants";
    downloadCsv(content, `revenue-report-${suffix}.csv`);
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  const tableTitle =
    revenueView === "kam" ? "Revenue by KAM" : "Revenue by Merchants";

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-900">{tableTitle}</h3>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-sm cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export
          </button>
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      <div className="w-full">
        <table className="w-full text-sm border-collapse table-fixed">
          <colgroup>
            <col className="w-[4%]" />
            {revenueView === "kam" ? (
              <col className="w-[14%]" />
            ) : (
              <>
                <col className="w-[10%]" />
                <col className="w-[14%]" />
              </>
            )}
            {METRIC_HEADERS.map((header) => (
              <col key={header} className="w-[12%]" />
            ))}
          </colgroup>
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <th className="px-3 py-3 text-left">#</th>
              {revenueView === "kam" ? (
                <th className="px-3 py-3 text-left break-words leading-tight">
                  KAM Name
                </th>
              ) : (
                <>
                  <th className="px-3 py-3 text-left break-words leading-tight">
                    Merchant Id
                  </th>
                  <th className="px-3 py-3 text-left break-words leading-tight">
                    Merchant Name
                  </th>
                </>
              )}
              {METRIC_HEADERS.map((header) => (
                <th
                  key={header}
                  className="px-2 py-3 text-center break-words leading-tight normal-case tracking-normal font-bold"
                >
                  {formatHeaderLabel(header)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={revenueView === "kam" ? 8 : 9}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No revenue data found for the selected filters.
                </td>
              </tr>
            ) : revenueView === "kam" ? (
              pagedRows.map((row, index) => {
                const kamRow = row as RevenueKamRow;
                const serial = (currentPage - 1) * rowsPerPage + index + 1;
                return (
                  <tr
                    key={kamRow.kamName}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                      {serial}
                    </td>
                    <td className="px-3 py-3 text-left text-slate-700 break-words">
                      {kamRow.kamName}
                    </td>
                    <MetricCells row={kamRow} />
                  </tr>
                );
              })
            ) : (
              pagedRows.map((row, index) => {
                const merchantRow = row as RevenueMerchantRow;
                const serial = (currentPage - 1) * rowsPerPage + index + 1;
                return (
                  <tr
                    key={merchantRow.merchantId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-3 py-3 text-left text-slate-700 tabular-nums">
                      {serial}
                    </td>
                    <td className="px-3 py-3 text-left text-slate-700 break-all">
                      {merchantRow.merchantId}
                    </td>
                    <td className="px-3 py-3 text-left text-slate-700 break-words">
                      {merchantRow.merchantName}
                    </td>
                    <MetricCells row={merchantRow} />
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
        <p className="text-sm text-slate-500">
          {(() => {
            const total = displayRows.length;
            if (total === 0) {
              return "Showing 0 to 0 of 0 entries";
            }
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
            disabled={currentPage === totalPages || displayRows.length === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

RevenueReport.displayName = "RevenueReport";
