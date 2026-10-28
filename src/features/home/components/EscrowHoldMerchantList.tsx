import { Clock } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState";
import { formatNumber } from "../../../utils/format";

interface EscrowHoldMerchantListProps {
  data?: any[];
}

export function EscrowHoldMerchantList({ data }: EscrowHoldMerchantListProps) {
  const entries = data || [];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Escrow Hold Entries ({entries?.length || 0})
        </p>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="No Escrow Hold Entries Found" icon={Clock} />
      ) : (
        <div className="divide-y divide-slate-100">
          {entries?.map((item: any, idx: number) => {
            const merchantName =
              item.merchant_name || item.merchantName || "Not found";
            const storeId =
              item.store_id ||
              item.merchantId ||
              item.merchant_id ||
              "Not found";
            const date = item.entry_date || item.date || "Not found";
            const amount = item.amount || item.value || 0;
            const id = item.entry_id || item.id || "Not found";

            return (
              <div
                key={id !== "Not found" ? id : idx}
                className="flex items-center justify-between py-3 hover:bg-slate-50/50 transition-colors group"
              >
                <div className="flex flex-col">
                  <p className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">
                    {merchantName}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>{storeId}</span>
                    <span className="text-slate-300">•</span>
                    <span>{date}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">
                    ৳{formatNumber(amount)}
                  </p>
                  {id !== "Not found" && (
                    <p className="text-[10px] text-slate-400 italic">
                      ID: {id}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
