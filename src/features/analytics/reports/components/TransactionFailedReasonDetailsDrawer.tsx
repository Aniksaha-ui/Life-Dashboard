import { useState, useMemo } from "react";
import { Drawer } from "../../../../components/Drawer";
import { clsx } from "clsx";
import type { TransactionFailedReasonRow } from "../data/transactionFailedReasonData";

interface TransactionFailedReasonDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  row: TransactionFailedReasonRow | null;
}

export function TransactionFailedReasonDetailsDrawer({
  open,
  onClose,
  row,
}: TransactionFailedReasonDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"companies" | "sectors">(
    "companies",
  );

  const companies = useMemo(() => row?.companies ?? [], [row]);
  const sectors = useMemo(() => row?.sectors ?? [], [row]);

  if (!open || !row) return null;

  const currentItems = activeTab === "companies" ? companies : sectors;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Failed Transaction Details"
      subtitle={`${row.errorDescription} · ${row.timesFailed.toLocaleString()} failures`}
      width="5xl"
      noPadding
      contentClassName="overflow-y-auto overflow-x-hidden flex flex-col h-full bg-slate-50/30"
    >
      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6 px-6 bg-white shrink-0">
        <button
          onClick={() => setActiveTab("companies")}
          className={clsx(
            "flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer outline-none",
            activeTab === "companies"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
          )}
        >
          <span>Companies</span>
          <span
            className={clsx(
              "px-2 py-0.5 text-[10px] rounded-full font-bold transition-colors",
              activeTab === "companies"
                ? "bg-primary-50 text-primary-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {row.affectedCompanies}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("sectors")}
          className={clsx(
            "flex items-center gap-2 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer outline-none",
            activeTab === "sectors"
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
          )}
        >
          <span>Sectors</span>
          <span
            className={clsx(
              "px-2 py-0.5 text-[10px] rounded-full font-bold transition-colors",
              activeTab === "sectors"
                ? "bg-primary-50 text-primary-600"
                : "bg-slate-100 text-slate-500",
            )}
          >
            {row.affectedSectors}
          </span>
        </button>
      </div>

      {/* Grid Content Panel */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
              {currentItems.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="flex items-center justify-between text-xs py-1 border-b border-dashed border-slate-100 hover:bg-slate-50/50 px-1 rounded transition-colors min-w-0"
                  title={`${item.name}: ${item.count}`}
                >
                  <span className="truncate text-slate-600 font-medium mr-2">
                    {item.name}
                  </span>
                  <div className="flex items-center shrink-0">
                    <span className="text-slate-400 font-normal mr-1.5">:</span>
                    <span className="font-bold text-slate-900 tabular-nums">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              No {activeTab} information available.
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
