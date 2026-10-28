import { clsx } from "clsx";
import { BarChart3 } from "lucide-react";
import { EmptyState } from "../../../components/EmptyState";
import { formatNumber } from "../../../utils/format";
import type { MetricDetailSectionItem } from "../types";

interface SectorCountListProps {
  data?: MetricDetailSectionItem[];
}

export function SectorCountList({ data }: SectorCountListProps) {
  const sectors = data || [];

  return (
    <div className="space-y-4 pt-6 border-t border-slate-100 mt-6">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
        Sector-wise Count Breakdown
      </p>

      {sectors.length === 0 ? (
        <EmptyState title="No Sectors Found" icon={BarChart3} />
      ) : (
        <div className="space-y-4">
          {sectors?.map((item, idx) => (
            <div key={idx} className="group">
              <div className="flex justify-between text-sm mb-1.5 gap-4">
                <span className="text-slate-600 font-medium truncate">
                  {item.sector}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-normal">
                    {formatNumber(item.percentage)}%
                  </span>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatNumber((item as any).value ?? (item as any).count)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={clsx(
                    "h-full rounded-full transition-all duration-500",
                    idx === 0
                      ? "bg-primary-500"
                      : idx === 1
                        ? "bg-primary-400"
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
