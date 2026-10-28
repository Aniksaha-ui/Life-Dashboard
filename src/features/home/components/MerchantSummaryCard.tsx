import { clsx } from "clsx";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "../../../components/Skeleton";
import { formatNumber } from "../../../utils/format";
import type { MerchantOverview } from "../types";

interface MerchantSummaryCardProps {
  stats?: MerchantOverview;
  onViewDetails: () => void;
  periodLabel: string;
  isLoading?: boolean;
}

export function MerchantSummaryCard({
  stats,
  onViewDetails,
  isLoading,
}: MerchantSummaryCardProps) {
  const items = [
    { label: "Transacting", value: formatNumber(stats?.transacting || 0) },
    {
      label: "Non transacting",
      value: formatNumber(stats?.non_transacting || 0),
    },
    {
      label: "Recently Onboarded",
      value: formatNumber(stats?.recently_onboarded || 0),
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase">
            Merchant Overview
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
        {items.map((item, idx) => (
          <div key={idx} className={clsx("px-2")}>
            {isLoading ? (
              <div className="h-9 flex items-center mb-1">
                <Skeleton className="h-8 w-16" />
              </div>
            ) : (
              <p className="text-3xl font-bold text-slate-900">{item.value}</p>
            )}
            <p className="text-sm text-slate-500 mt-1">
              {item.label.includes("(") ? (
                <>
                  {item.label.split(" (")[0]}{" "}
                  <span className="text-[10px] lowercase font-normal">
                    ({item.label.split(" (")[1]}
                  </span>
                </>
              ) : (
                item.label
              )}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
        <button
          onClick={onViewDetails}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View Details <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
