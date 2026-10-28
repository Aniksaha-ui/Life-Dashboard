import { clsx } from "clsx";
import { ArrowRight, Users } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Skeleton } from "../../../components/Skeleton";
import { formatNumber } from "../../../utils/format";
import { CopyButton } from "../../../components/CopyButton";
import type { TopMerchantsData } from "../types";

interface TopMerchantsProps {
  data?: TopMerchantsData;
}

export function TopMerchants({ data }: TopMerchantsProps) {
  type MetricType = "txn_amount" | "txn_count" | "revenue";
  const [activeMetric, setActiveMetric] = useState<MetricType>("txn_amount");

  const isLoading = !data;
  const merchants = data?.[activeMetric];

  const tabs: { id: MetricType; label: string }[] = [
    { id: "txn_amount", label: "Txn Amount" },
    { id: "txn_count", label: "Txn Count" },
    { id: "revenue", label: "Revenue" },
  ];

  const formatValue = (value: number | undefined, metric: MetricType) => {
    if (value === undefined) return "-";
    if (metric === "txn_count") return formatNumber(value);
    return `৳${formatNumber(value)}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Top Merchants
        </h3>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveMetric(tab.id)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs transition-all border",
                activeMetric === tab.id
                  ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                  : "bg-white text-slate-500 border-slate-200 font-medium hover:text-slate-700 hover:border-slate-300",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {merchants?.map((merchant) => {
              const value = merchant[activeMetric];
              const trend = merchant.growth_pct;

              return (
                <div
                  key={merchant.merchant_id}
                  className="flex items-center justify-between py-3 transition-colors"
                >
                  <div className="flex flex-col items-start gap-1">
                    <Link
                      to={`/m/${merchant.merchant_id}`}
                      className="text-sm font-semibold text-slate-700 hover:text-primary-600 transition-colors flex items-center gap-1.5"
                    >
                      <span className="truncate">{merchant.merchant_name}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] font-medium text-slate-400">
                          ({merchant.merchant_id})
                        </span>
                        <CopyButton
                          value={merchant.merchant_id}
                          className="h-5 w-5"
                        />
                      </div>
                    </Link>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-tight">
                      {merchant.sector}
                    </span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-bold text-slate-900">
                      {formatValue(value, activeMetric)}
                    </span>
                    <span
                      className={clsx(
                        "text-[10px] font-bold mt-0.5",
                        trend >= 0 ? "text-emerald-600" : "text-rose-600",
                      )}
                    >
                      {trend >= 0 ? "↑" : "↓"} {formatNumber(Math.abs(trend))}%
                    </span>
                  </div>
                </div>
              );
            })}
            {merchants?.length === 0 && (
              <div className="flex flex-col items-center justify-center h-[200px] text-slate-500">
                <Users className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">No Merchants Found</p>
                <p className="text-xs opacity-70">Try adjusting your filters</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
        <Link
          to={`/merchants?top_sort=${activeMetric === "txn_amount" ? "amount" : activeMetric === "txn_count" ? "count" : "revenue"}`}
          className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          View all <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
