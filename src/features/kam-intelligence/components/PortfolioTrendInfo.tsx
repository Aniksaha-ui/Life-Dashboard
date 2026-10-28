import { clsx } from "clsx";
import { Info } from "lucide-react";

const PORTFOLIO_TREND_DEFINITIONS = [
  {
    t: "Accelerating Growth",
    d: "All 3 RFM scores rising",
    c: "bg-emerald-50 text-emerald-600",
    i: "↑",
  },
  {
    t: "Soft Growth",
    d: "At least one score improving",
    c: "bg-emerald-50 text-emerald-600",
    i: "↑",
  },
  {
    t: "Recovering",
    d: "Rebounding after a decline",
    c: "bg-blue-50 text-blue-600",
    i: "↗",
  },
  {
    t: "Reactivated",
    d: "Dormant transacting again",
    c: "bg-purple-50 text-purple-600",
    i: "⟳",
  },
  {
    t: "New Active",
    d: "First month with activity",
    c: "bg-purple-50 text-purple-600",
    i: "★",
  },
  {
    t: "Returning",
    d: "Prev. inactive, came back",
    c: "bg-lime-50 text-lime-600",
    i: "↵",
  },
  {
    t: "Stable - Healthy",
    d: "Scores holding steady (High)",
    c: "bg-blue-50 text-blue-600",
    i: "→",
  },
  {
    t: "Stable - Weak",
    d: "Scores holding steady (Low)",
    c: "bg-slate-50 text-slate-400",
    i: "–",
  },
  {
    t: "Irregular Pattern",
    d: "Mixed score direction",
    c: "bg-orange-50 text-orange-600",
    i: "~",
  },
  {
    t: "Engagement Drop",
    d: "Declining, not yet critical",
    c: "bg-orange-50 text-orange-600",
    i: "↘",
  },
  {
    t: "Soft Decline",
    d: "One score slipping",
    c: "bg-orange-50 text-orange-600",
    i: "↓",
  },
  {
    t: "Losing Volume",
    d: "F+M both declining",
    c: "bg-red-50 text-red-600",
    i: "↓↓",
  },
  {
    t: "Rapid Fall",
    d: "All 3 scores falling",
    c: "bg-red-50 text-red-600",
    i: "⚠",
  },
  {
    t: "Zero Success",
    d: "No successful transactions",
    c: "bg-slate-100 text-slate-500",
    i: "✕",
  },
];

interface PortfolioTrendInfoProps {
  wide?: boolean;
}

export function PortfolioTrendInfo({ wide = false }: PortfolioTrendInfoProps) {
  return (
    <div className="group relative">
      <Info className="w-3.5 h-3.5 text-primary-500 cursor-help hover:text-primary-600 transition-colors" />
      <div
        className={clsx(
          "invisible group-hover:visible absolute left-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 text-[11px] normal-case tracking-normal font-normal whitespace-normal",
          wide ? "w-[480px]" : "w-72",
        )}
      >
        <div className="font-bold text-slate-900 mb-3 border-b border-slate-100 pb-2 flex items-center justify-between">
          <span>Activity Trends</span>
          <span className="text-[9px] font-medium text-slate-400">
            Velocity Rules
          </span>
        </div>
        <div
          className={clsx(
            "text-left",
            wide
              ? "grid grid-cols-2 gap-x-4 gap-y-3"
              : "grid grid-cols-1 gap-y-3 pr-1",
          )}
        >
          {PORTFOLIO_TREND_DEFINITIONS.map((item) => (
            <div key={item.t} className="flex gap-2">
              <div
                className={clsx(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 font-bold text-[8px]",
                  item.c,
                )}
              >
                {item.i}
              </div>
              <div>
                <div className="font-bold text-slate-800">{item.t}</div>
                <div className="text-slate-500 text-[10px] mt-0.5 leading-tight font-normal">
                  {item.d}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
