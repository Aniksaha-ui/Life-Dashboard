import { Users } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState";

export function FailedMerchantList({ data }: any) {
  const merchants = data || [];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Top 5 Merchants with Failed Transactions
      </p>

      {merchants.length === 0 ? (
        <EmptyState title="No Merchants Found" icon={Users} />
      ) : (
        <div className="divide-y divide-slate-100">
          {merchants?.slice(0, 5).map((m: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 transition-colors group"
            >
              <span className="text-sm font-medium text-slate-700 group-hover:text-primary-600 cursor-pointer">
                {m.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-slate-900">
                  {m.count}
                </span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-tight">
                  Failed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
