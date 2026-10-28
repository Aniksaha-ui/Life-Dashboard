import type { MonthlyOverview } from "../data";

// Segment dot color mapping — matches the screenshot's color coding
function segmentDotColor(name: string): string {
  switch (name) {
    case "Champion Merchants":
    case "Loyal Big Merchants":
    case "Loyal Regular Merchants":
      return "bg-emerald-500";
    case "High Value Irregular Merchants":
    case "Potential Up-sell":
      return "bg-blue-500";
    case "Stable Merchants":
      return "bg-slate-400";
    case "Monitor Closely":
      return "bg-amber-500";
    case "High Risk Big Merchants":
      return "bg-rose-500";
    case "Lost Merchants":
    case "Inactive Merchants":
      return "bg-slate-400";
    default:
      return "bg-slate-400";
  }
}

interface MonthlyOverviewCardsProps {
  data: MonthlyOverview[];
  expanded?: boolean;
  onSegmentClick?: (segment: string) => void;
}

export function MonthlyOverviewCards({
  data,
  expanded = false,
  onSegmentClick,
}: MonthlyOverviewCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {data.map((item) => (
        <div
          key={item.month}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">{item.month}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {item.totalMerchants.toLocaleString()} merchants
            </p>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* GMV & AVG SR */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl font-bold text-slate-900">
                  {item.totalGmv}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total GMV
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-slate-900">{item.avgSR}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Avg SR
                </p>
              </div>
            </div>

            {/* Health distribution labels */}
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
                <span className="text-emerald-600">
                  Active & Growing
                  <br />
                  <span className="text-xs">{item.health.activeGrowing}%</span>
                </span>
                <span className="text-amber-600 text-center">
                  {item.health.watch}%
                  <br />
                  <span className="font-medium">Watch</span>
                </span>
                <span className="text-rose-600 text-right">
                  {item.health.declining}%
                  <br />
                  <span className="font-medium">Declining</span>
                </span>
              </div>

              {/* Tri-color health bar */}
              <div className="flex h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 transition-all"
                  style={{ width: `${item.health.activeGrowing}%` }}
                />
                <div
                  className="bg-amber-400 transition-all"
                  style={{ width: `${item.health.watch}%` }}
                />
                <div
                  className="bg-rose-500 transition-all"
                  style={{ width: `${item.health.declining}%` }}
                />
              </div>

              <p className="text-[10px] text-slate-400 mt-1.5">
                of {item.totalMerchants.toLocaleString()} merchant records this
                month
              </p>
            </div>

            {/* Segment list — only visible when expanded */}
            {expanded && (
              <div className="pt-1 border-t border-slate-100">
                {item.segments.map((seg) => (
                  <div
                    key={seg.name}
                    onClick={() => onSegmentClick?.(seg.name)}
                    className="flex items-center justify-between py-2 group cursor-pointer border-b-[0.5px] border-dashed border-slate-200 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${segmentDotColor(seg.name)}`}
                      />
                      <span className="text-xs text-slate-700 truncate group-hover:text-primary-600 transition-colors font-medium">
                        {seg.name}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 tabular-nums ml-2">
                      {seg.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
