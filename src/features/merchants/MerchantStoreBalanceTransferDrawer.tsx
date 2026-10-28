import React, { useState, useMemo } from "react";
import { Drawer } from "../../components/Drawer";
import type { MerchantStore } from "../../data/mock/types";

interface Props {
  store: MerchantStore | null;
  onClose: () => void;
}

interface BalanceTransferEntry {
  id: string;
  transferId: string;
  date: string;
  amount: number;
  status: string;
}

const INITIAL_TRANSFER_ENTRIES: BalanceTransferEntry[] = [];

export function MerchantStoreBalanceTransferDrawer({ store, onClose }: Props) {
  const [entries] = useState<BalanceTransferEntry[]>(INITIAL_TRANSFER_ENTRIES);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Paginated entries
  const totalPages = Math.max(1, Math.ceil(entries.length / pageSize));
  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return entries.slice(start, start + pageSize);
  }, [entries, currentPage, pageSize]);

  const paginationFrom =
    entries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const paginationTo = Math.min(currentPage * pageSize, entries.length);

  if (!store) return null;

  return (
    <Drawer
      open={!!store}
      onClose={onClose}
      title={
        <div>
          <div className="text-xl font-bold text-slate-900">
            Store Balance Transfer
          </div>
          <div className="text-sm font-normal text-slate-500 mt-1">
            Store ID:{" "}
            <span className="font-mono font-semibold text-slate-700">
              {store.storeId}
            </span>
          </div>
        </div>
      }
      width="4xl"
    >
      <div className="pb-24 space-y-6">
        {/* ── DATA TABLE SECTION ── */}
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Balance Transfer List
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="px-5 py-3 w-12 text-center">#</th>
                  <th className="px-5 py-3">Transfer ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-8 text-center text-slate-400 italic"
                    >
                      No balance transfers found.
                    </td>
                  </tr>
                ) : (
                  paginatedEntries.map((entry, idx) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-4 text-center font-medium text-slate-500">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {entry.transferId}
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {entry.date}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        {entry.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            entry.status === "Completed"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination Footer ── */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 bg-slate-50/50">
            <div className="text-sm text-slate-500">
              {entries.length > 0
                ? `Showing ${paginationFrom} to ${paginationTo} of ${entries.length} entries`
                : ""}
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
