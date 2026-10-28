import { clsx } from "clsx";
import { ChevronRight, FileX } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../../components/EmptyState";
import { formatNumber } from "../../../utils/format";

interface ChargebackListProps {
  data?: {
    merchant_wise?: any[];
    general?: any[];
  };
}

export function ChargebackList({ data }: ChargebackListProps) {
  const [view, setView] = useState<"merchant" | "general">("merchant");

  const merchantWise = data?.merchant_wise || [];
  const generalList = data?.general || [];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Chargeback Entries
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setView("merchant")}
            className={clsx(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all border",
              view === "merchant"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300",
            )}
          >
            Merchant-wise ({merchantWise.length})
          </button>
          <button
            onClick={() => setView("general")}
            className={clsx(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all border",
              view === "general"
                ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:border-slate-300",
            )}
          >
            General ({generalList.length})
          </button>
        </div>
      </div>

      {merchantWise.length === 0 && generalList.length === 0 ? (
        <EmptyState title="No Chargeback Entries Found" icon={FileX} />
      ) : view === "merchant" ? (
        <div className="space-y-3">
          {merchantWise.length === 0 ? (
            <EmptyState title="No Merchant-wise Entries" icon={FileX} />
          ) : (
            merchantWise.map((m: any) => (
              <details
                key={m.merchant_id || m.merchant_name}
                className="group border border-slate-100 rounded-lg overflow-hidden bg-white shadow-sm"
              >
                <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors list-none">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-100 rounded group-open:bg-primary-50 transition-colors">
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                    </div>
                    <div className="flex flex-col">
                      <p className="font-medium text-slate-900">
                        {m.merchant_name || m.merchantName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {m.merchant_id || m.merchantId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      ৳{formatNumber(m.total || m.amount)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {m.count} chargebacks
                    </p>
                  </div>
                </summary>
                <div className="px-3 pb-3 pt-1 border-t border-slate-50 bg-slate-50/30">
                  <div className="space-y-3 mt-2 divide-y divide-slate-100">
                    {(m.items || []).map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2.5 text-[11px]"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-600">
                            {item.id || item.txn_id}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {item.date}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900">
                          ৳{formatNumber(item.amount || item.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {generalList.length === 0 ? (
            <EmptyState title="No General Entries" icon={FileX} />
          ) : (
            generalList.map((cb: any) => (
              <div
                key={cb.id || cb.txn_id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex flex-col">
                  <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                    {cb.merchant_name || cb.merchantName}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{cb.merchant_id || cb.merchantId}</span>
                    <span className="text-slate-300">•</span>
                    <span>{cb.date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ৳{formatNumber(cb.amount || cb.value)}
                  </p>
                  <p className="text-[10px] text-slate-400 italic">
                    ID: {cb.id || cb.txn_id}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
