import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useState,
  useEffect,
} from "react";
import { Download, ChevronDown } from "lucide-react";
import { clsx } from "clsx";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import { TransactionFailedReasonDetailsDrawer } from "./TransactionFailedReasonDetailsDrawer";
import {
  TRANSACTION_FAILED_REASON_DATA,
  filterTransactionFailedReasons,
  type TransactionFailedReasonRow,
} from "../data/transactionFailedReasonData";

interface TransactionFailedReasonReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface TransactionFailedReasonReportHandle {
  exportData: () => void;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];

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

export const TransactionFailedReasonReport = forwardRef<
  TransactionFailedReasonReportHandle,
  TransactionFailedReasonReportProps
>(({ sections, filters }, ref) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRow, setSelectedRow] =
    useState<TransactionFailedReasonRow | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const rawData = useMemo(() => {
    const sectionData = sections.find(
      (s) => s.sectionId === "failed-reasons-summary",
    )?.customData;
    if (sectionData && Array.isArray(sectionData) && sectionData.length > 0) {
      return sectionData as TransactionFailedReasonRow[];
    }
    return TRANSACTION_FAILED_REASON_DATA;
  }, [sections]);

  const filteredData = useMemo(() => {
    return filterTransactionFailedReasons(
      rawData,
      filters.from,
      filters.to,
      filters.errorDescription,
    );
  }, [rawData, filters.from, filters.to, filters.errorDescription]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, filters.from, filters.to, filters.errorDescription]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handleOpenDetails = (row: TransactionFailedReasonRow) => {
    setSelectedRow(row);
    setDrawerOpen(true);
  };

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Date",
      "Error Description",
      "Times Failed",
      "Affected Companies",
      "Affected Sectors",
    ];
    const csvRows = filteredData.map((item, idx) => [
      idx + 1,
      item.transactionDate,
      `"${item.errorDescription.replace(/"/g, '""')}"`,
      item.timesFailed,
      item.affectedCompanies,
      item.affectedSectors,
    ]);

    if (csvRows.length === 0) return null;
    return [headers.join(","), ...csvRows.map((row) => row.join(","))].join(
      "\n",
    );
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
        `transaction-failed-reasons-${filters.from || "all"}-${filters.to || "time"}.csv`,
      );
    } else {
      alert("No rows to export for current filters.");
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            Failed reasons summary
          </h3>
          <div className="flex items-center gap-3">
            <button
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

        {/* Table */}
        <div className="w-full overflow-x-auto lg:overflow-x-visible">
          <table className="w-full text-sm border-collapse table-fixed min-w-[640px] lg:min-w-0">
            <colgroup>
              <col className="w-[4%]" />
              <col className="w-[12%]" />
              <col className="w-[36%]" />
              <col className="w-[11%]" />
              <col className="w-[26%]" />
              <col className="w-[11%]" />
            </colgroup>
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-3 lg:px-4 py-3 text-left">#</th>
                <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap">
                  Date
                </th>
                <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap">
                  Error Description
                </th>
                <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap">
                  Times Failed
                </th>
                <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap">
                  Affected
                </th>
                <th className="px-3 lg:px-4 py-3 text-center whitespace-nowrap">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No failed transaction reasons found for the selected
                    filters.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, index) => {
                  const serial = (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr
                      key={`${row.transactionDate}-${row.errorDescription}-${index}`}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-3 lg:px-4 py-3 text-left text-slate-700 tabular-nums">
                        {serial}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-left text-slate-600 font-medium whitespace-nowrap tabular-nums">
                        {row.transactionDate}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-left text-slate-700 font-semibold break-words min-w-0">
                        {row.errorDescription}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-left text-slate-700 font-semibold tabular-nums whitespace-nowrap">
                        {row.timesFailed.toLocaleString()}
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-left text-slate-500 text-xs whitespace-nowrap">
                        Companies:{" "}
                        <strong className="text-slate-800 tabular-nums">
                          {row.affectedCompanies}
                        </strong>
                        , Sectors:{" "}
                        <strong className="text-slate-800 tabular-nums">
                          {row.affectedSectors}
                        </strong>
                      </td>
                      <td className="px-3 lg:px-4 py-3 text-center align-middle whitespace-nowrap">
                        <button
                          onClick={() => handleOpenDetails(row)}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white">
          <p className="text-sm text-slate-500">
            {(() => {
              const total = filteredData.length;
              if (total === 0) return "Showing 0 to 0 of 0 entries";
              const from = (currentPage - 1) * rowsPerPage + 1;
              const to = Math.min(currentPage * rowsPerPage, total);
              return `Showing ${from} to ${to} of ${total} entries`;
            })()}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600 disabled:cursor-not-allowed"
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
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer shadow-sm text-slate-600 disabled:cursor-not-allowed"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages || filteredData.length === 0}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <TransactionFailedReasonDetailsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        row={selectedRow}
      />
    </div>
  );
});

TransactionFailedReasonReport.displayName = "TransactionFailedReasonReport";
