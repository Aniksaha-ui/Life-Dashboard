import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { ChevronDown, Download } from "lucide-react";
import { MetricCard } from "../../../../components/MetricCard";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import {
  ONBOARDED_INVOICE_EMPLOYEES,
  filterOnboardedInvoiceEmployees,
  formatInvoiceAmount,
  summarizeOnboardedInvoices,
  type OnboardedInvoiceEmployeeRow,
} from "../data/onboardedInvoiceSummaryData";
import { OnboardedInvoiceDetailsDrawer } from "./OnboardedInvoiceDetailsDrawer";

interface OnboardedInvoiceSummaryReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface OnboardedInvoiceSummaryReportHandle {
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

function buildCsv(rows: OnboardedInvoiceEmployeeRow[]) {
  const headers = [
    "#",
    "Name",
    "Email",
    "Employee ID",
    "Department",
    "Total Amount",
    "Invoices",
  ];
  const csvRows = rows.map((row, index) => [
    index + 1,
    `"${row.name.replace(/"/g, '""')}"`,
    row.email,
    row.employeeId,
    row.department,
    formatInvoiceAmount(row.totalAmount),
    row.totalInvoice,
  ]);
  return [headers.join(","), ...csvRows.map((row) => row.join(","))].join("\n");
}

export const OnboardedInvoiceSummaryReport = forwardRef<
  OnboardedInvoiceSummaryReportHandle,
  OnboardedInvoiceSummaryReportProps
>(({ filters }, ref) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<OnboardedInvoiceEmployeeRow | null>(null);

  const filteredRows = useMemo(
    () =>
      filterOnboardedInvoiceEmployees(
        ONBOARDED_INVOICE_EMPLOYEES,
        filters.from,
        filters.to,
      ),
    [filters.from, filters.to],
  );

  const summary = useMemo(
    () => summarizeOnboardedInvoices(filteredRows),
    [filteredRows],
  );

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, filters.from, filters.to]);

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
      `onboarded-invoice-summary-${filters.from || "all"}-${filters.to || "time"}.csv`,
    );
  };

  useImperativeHandle(ref, () => ({
    exportData: handleExportCSV,
  }));

  const openDetails = (employee: OnboardedInvoiceEmployeeRow) => {
    setSelectedEmployee(employee);
    setDetailsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MetricCard
            title="Total Invoice Amount"
            value={formatInvoiceAmount(summary.totalInvoiceAmount)}
            valueClassName="tabular-nums"
          />
          <MetricCard
            title="Total Invoice"
            value={summary.totalInvoiceCount.toLocaleString()}
            valueClassName="tabular-nums"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-slate-900">
            On boarded Invoice Summary
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

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[960px]">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Employee ID
                </th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Total Amount
                </th>
                <th className="px-4 py-3 text-left whitespace-nowrap">
                  Invoices
                </th>
                <th className="px-4 py-3 text-left w-24">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No onboarded invoice data found for the selected filters.
                  </td>
                </tr>
              ) : (
                pagedRows.map((row, index) => {
                  const serial = (currentPage - 1) * rowsPerPage + index + 1;
                  return (
                    <tr
                      key={row.employeeId}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top">
                        {serial}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700 break-words align-top">
                        {row.name}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700 break-all align-top">
                        {row.email}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top">
                        {row.employeeId}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700 align-top">
                        {row.department}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top">
                        {formatInvoiceAmount(row.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top">
                        {row.totalInvoice}
                      </td>
                      <td className="px-4 py-3 text-left align-top">
                        <button
                          type="button"
                          onClick={() => openDetails(row)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
                        >
                          Details
                        </button>
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

      <OnboardedInvoiceDetailsDrawer
        open={detailsDrawerOpen}
        onClose={() => setDetailsDrawerOpen(false)}
        employee={selectedEmployee}
      />
    </div>
  );
});

OnboardedInvoiceSummaryReport.displayName = "OnboardedInvoiceSummaryReport";
