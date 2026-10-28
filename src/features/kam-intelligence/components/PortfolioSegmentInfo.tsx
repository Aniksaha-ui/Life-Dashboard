import { clsx } from "clsx";
import { Info } from "lucide-react";

const PORTFOLIO_SEGMENT_DEFINITIONS = [
  {
    t: "Champion Merchants",
    d: "High R-F-M. Best merchants.",
    c: "bg-emerald-50 text-emerald-600",
  },
  {
    t: "Loyal Big Merchants",
    d: "Consistent, strong revenue.",
    c: "bg-blue-50 text-blue-600",
  },
  {
    t: "Loyal Regular Merchants",
    d: "Consistent, lower values.",
    c: "bg-purple-50 text-purple-600",
  },
  {
    t: "High Value Irregular Merchants",
    d: "Massive GMV, low frequency.",
    c: "bg-orange-50 text-orange-600",
  },
  {
    t: "Potential Up-sell",
    d: "Good R&F. Room to grow.",
    c: "bg-cyan-50 text-cyan-600",
  },
  {
    t: "Stable Merchants",
    d: "Balanced RFM. Reliable.",
    c: "bg-slate-50 text-slate-600",
  },
  {
    t: "Monitor Closely",
    d: "Scores slipping. Churn risk.",
    c: "bg-orange-50 text-orange-600",
  },
  {
    t: "High Risk Big Merchants",
    d: "Prev. High-value, declining.",
    c: "bg-red-50 text-red-600",
  },
  {
    t: "Lost Merchants",
    d: "No activity. Likely lost.",
    c: "bg-slate-100 text-slate-500",
  },
  {
    t: "Inactive Merchants",
    d: "Inactive, low recency.",
    c: "bg-slate-50 text-slate-400",
  },
];

export function PortfolioSegmentInfo() {
  return (
    <div className="group relative">
      <Info className="w-3.5 h-3.5 text-primary-500 cursor-help hover:text-primary-600 transition-colors" />
      <div className="invisible group-hover:visible absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-[11px] normal-case tracking-normal font-normal whitespace-normal">
        <div className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Portfolio Segment</span>
          <span className="text-[9px] font-medium text-slate-400">
            Classification
          </span>
        </div>
        <div className="grid grid-cols-1 gap-y-3 pr-1 text-left">
          {PORTFOLIO_SEGMENT_DEFINITIONS.map((segment) => (
            <div key={segment.t} className="flex gap-2">
              <div
                className={clsx(
                  "w-1.5 h-6 rounded-full shrink-0",
                  segment.c.split(" ")[0],
                )}
              />
              <div>
                <div className="font-bold text-slate-800">{segment.t}</div>
                <div className="text-slate-500 text-[10px] leading-tight font-normal">
                  {segment.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
