import { useEffect, useMemo, useState } from "react";
import { Drawer } from "../../../../components/Drawer";
import type { PaymentTypeSelectionRow } from "../data/paymentAnalyticsReportData";

interface PaymentTypeSelectionDrawerProps {
  open: boolean;
  onClose: () => void;
  rows: PaymentTypeSelectionRow[];
}

const DRAWER_ITEMS_PER_PAGE = 10;

function getRowKey(row: PaymentTypeSelectionRow) {
  return `${row.paymentMethod}-${row.date}-${row.selections}`;
}

export function PaymentTypeSelectionDrawer({
  open,
  onClose,
  rows,
}: PaymentTypeSelectionDrawerProps) {
  const [drawerPage, setDrawerPage] = useState(1);

  useEffect(() => {
    setDrawerPage(1);
  }, [open, rows]);

  const drawerTotalPages = Math.max(
    1,
    Math.ceil(rows.length / DRAWER_ITEMS_PER_PAGE),
  );

  useEffect(() => {
    if (drawerPage > drawerTotalPages) {
      setDrawerPage(drawerTotalPages);
    }
  }, [drawerPage, drawerTotalPages]);

  const paginatedRows = useMemo(() => {
    const start = (drawerPage - 1) * DRAWER_ITEMS_PER_PAGE;
    return rows.slice(start, start + DRAWER_ITEMS_PER_PAGE);
  }, [rows, drawerPage]);

  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          totalUsers: acc.totalUsers + row.totalUsers,
          selections: acc.selections + row.selections,
        }),
        { totalUsers: 0, selections: 0 },
      ),
    [rows],
  );

  const scrollDrawerToTop = () => {
    const scrollEl = document.querySelector(
      ".payment-type-selection-drawer-scroll",
    );
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!open) return null;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Payment Type Selection"
      subtitle={`${rows.length} record${rows.length === 1 ? "" : "s"}`}
      width="lg"
      noPadding
      contentClassName="overflow-hidden flex flex-col"
    >
      <div className="flex flex-col h-full min-h-0 bg-white">
        <div className="payment-type-selection-drawer-scroll flex-1 min-h-0 overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <th className="px-6 py-3 text-left whitespace-nowrap">
                  Payment Method
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap w-28">
                  Total Users
                </th>
                <th className="px-4 py-3 text-right whitespace-nowrap w-28">
                  Selections
                </th>
                <th className="px-6 py-3 text-right whitespace-nowrap w-32">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length > 0 ? (
                paginatedRows.map((row) => (
                  <tr
                    key={getRowKey(row)}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-3 text-left text-slate-700 break-words">
                      {row.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-700 tabular-nums">
                      {row.totalUsers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900 font-semibold tabular-nums">
                      {row.selections.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700 tabular-nums whitespace-nowrap">
                      {row.date}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-sm text-slate-500"
                  >
                    No payment type selection data for the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                  <td className="px-6 py-3">Total</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {totals.totalUsers.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {totals.selections.toLocaleString()}
                  </td>
                  <td className="px-6 py-3" />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {drawerTotalPages > 1 && (
          <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">
                Showing {(drawerPage - 1) * DRAWER_ITEMS_PER_PAGE + 1} to{" "}
                {Math.min(drawerPage * DRAWER_ITEMS_PER_PAGE, rows.length)} of{" "}
                {rows.length} entries
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
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
                  type="button"
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
  );
}
