import { useMemo, useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Drawer } from "../../../../components/Drawer";
import {
  ONBOARDED_INVOICE_DETAILS_BY_EMPLOYEE,
  formatInvoiceAmount,
  type OnboardedInvoiceEmployeeRow,
} from "../data/onboardedInvoiceSummaryData";

interface OnboardedInvoiceDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: OnboardedInvoiceEmployeeRow | null;
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

export function OnboardedInvoiceDetailsDrawer({
  open,
  onClose,
  employee,
}: OnboardedInvoiceDetailsDrawerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const rows = useMemo(
    () =>
      employee
        ? (ONBOARDED_INVOICE_DETAILS_BY_EMPLOYEE[employee.employeeId] ?? [])
        : [],
    [employee],
  );

  const totalAmount = useMemo(
    () => rows.reduce((sum, row) => sum + row.invoiceAmount, 0),
    [rows],
  );

  const totalPages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [employee, open]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pagedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return rows.slice(start, start + rowsPerPage);
  }, [rows, currentPage, rowsPerPage]);

  if (!open || !employee) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Invoice Details"
      subtitle={`${employee.name} · ${employee.employeeId}`}
      width="5xl"
      noPadding
      contentClassName="overflow-y-auto overflow-x-hidden flex flex-col h-full"
    >
      <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <span className="text-xs text-slate-500 font-medium">
          {rows.length} {rows.length === 1 ? "invoice" : "invoices"} found
        </span>
        <RowsPerPageControl
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
        />
      </div>

      <div className="flex-1 overflow-x-auto min-h-0">
        <table className="w-full text-sm border-collapse table-fixed min-w-[800px]">
          <colgroup>
            <col className="w-[4%]" />
            <col className="w-[14%]" />
            <col className="w-[18%]" />
            <col className="w-[12%]" />
            <col className="w-[36%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Invoice Date
              </th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Invoice Code
              </th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Client Code
              </th>
              <th className="px-4 py-3 text-left break-words leading-tight">
                Client Name
              </th>
              <th className="px-4 py-3 text-right break-words leading-tight">
                Invoice Amount
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pagedRows.length > 0 ? (
              pagedRows.map((row, index) => {
                const serial = (currentPage - 1) * rowsPerPage + index + 1;
                return (
                  <tr
                    key={row.invoiceCode}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top">
                      {serial}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 tabular-nums align-top break-words">
                      {row.invoiceDate}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 align-top break-all">
                      {row.invoiceCode}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 align-top break-all">
                      {row.clientCode}
                    </td>
                    <td className="px-4 py-3 text-left text-slate-700 break-words align-top">
                      {row.clientName}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 tabular-nums align-top">
                      {formatInvoiceAmount(row.invoiceAmount)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No invoice details available for this employee.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                <td className="px-4 py-3" colSpan={5}>
                  Total
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatInvoiceAmount(totalAmount)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {rows.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <p className="text-sm text-slate-500">
            {(() => {
              const total = rows.length;
              const from = (currentPage - 1) * rowsPerPage + 1;
              const to = Math.min(currentPage * rowsPerPage, total);
              return `Showing ${from} to ${to} of ${total} entries`;
            })()}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button
              type="button"
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
