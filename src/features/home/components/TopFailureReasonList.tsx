import { clsx } from "clsx";
import { AlertCircle } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState";
import { formatNumber } from "../../../utils/format";

interface TopFailureReasonListProps {
  data?: any[];
}

export function TopFailureReasonList({ data }: TopFailureReasonListProps) {
  const reasons = data || [];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Top Failure Reasons
      </p>

      {reasons.length === 0 ? (
        <EmptyState title="No Failure Reasons Found" icon={AlertCircle} />
      ) : (
        <div className="space-y-4">
          {reasons?.map((item: any, idx: number) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-sm mb-1.5 gap-4">
                <span className="text-slate-600 font-medium truncate">
                  {item.reason ||
                    item.title ||
                    item.name ||
                    item.merchant_name ||
                    item.sector}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-normal">
                    {formatNumber(item.percentage)}%
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatNumber(item.value || item.count)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    idx === 0
                      ? "bg-rose-500"
                      : idx === 1
                        ? "bg-rose-400"
                        : "bg-slate-300",
                  )}
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
