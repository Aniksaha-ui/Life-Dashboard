import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { ChevronDown, Download } from "lucide-react";
import { clsx } from "clsx";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import {
  MERCHANT_ACTIVITY_ROWS,
  filterMerchantActivityRows,
  type MerchantActivityRow,
  type MerchantActivityStatus,
} from "../data/merchantActivityReportData";

interface MerchantActivityReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MerchantActivityReportHandle {
  exportData: () => void;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

function ActivityStatusBadge({ status }: { status: MerchantActivityStatus }) {
  const isActive = status === "active";
  return (
    <span
      className={clsx(
        "px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap inline-block",
        isActive
          ? "bg-emerald-50 text-emerald-600"
          : "bg-slate-100 text-slate-600",
      )}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
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

function buildCsv(rows: MerchantActivityRow[]) {
  const headers = ["#", "MssId", "Company Name", "Sector Name", "Status"];
  const csvRows = rows.map((row, index) => [
    index + 1,
    row.mssId,
    `"${row.companyName.replace(/"/g, '""')}"`,
    row.sectorName,
    row.status === "active" ? "Active" : "Inactive",
  ]);
  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}

export const MerchantActivityReport = forwardRef<
  MerchantActivityReportHandle,
  MerchantActivityReportProps
>(({ filters }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredRows = useMemo(
    () =>
      filterMerchantActivityRows(MERCHANT_ACTIVITY_ROWS, {
        from: filters.from,
        to: filters.to,
        status: filters.status,
        sector: filters.sector,
      }),
    [filters.from, filters.to, filters.status, filters.sector],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, filters.from, filters.to, filters.status, filters.sector]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage, rowsPerPage]);

  const handleExportCSV = () => {
    if (filteredRows.length === 0) {
      alert("No rows to export for current filters.");
      return;
    }
    downloadCsv(
      buildCsv(filteredRows),
      `merchant-activity-report-${filters.from || "all"}-${filters.to || "time"}.csv`,
    );
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-slate-900">
          Merchant Activity
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
          <RowsPerPageControl
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
          />
        </div>
      </div>

      <div className="w-full">
        <table className="w-full text-sm border-collapse table-fixed">
          <colgroup>
            <col className="w-[5%]" />
            <col className="w-[16%]" />
            <col className="w-[38%]" />
            <col className="w-[24%]" />
            <col className="w-[17%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                MssId
              </th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Company Name
              </th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Sector Name
              </th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  No merchant activity data found for the selected filters.
                </td>
              </tr>
            ) : (
              pagedRows.map((row, index) => {
                const serial = (currentPage - 1) * rowsPerPage + index + 1;
                return (
                  <tr
                    key={row.mssId}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top">
                      {serial}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 break-all align-top">
                      {row.mssId}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 break-words align-top">
                      {row.companyName}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 break-words align-top">
                      {row.sectorName || "—"}
                    </td>
                    <td className="px-4 py-3 text-left align-top">
                      <ActivityStatusBadge status={row.status} />
                    </td>
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
            const total = filteredRows.length;
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
            disabled={currentPage === totalPages || filteredRows.length === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

MerchantActivityReport.displayName = "MerchantActivityReport";
