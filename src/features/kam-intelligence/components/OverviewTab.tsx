import { clsx } from "clsx";
import {
  type Merchant,
  profiles,
  profileData,
  fmt,
  actionTagClass,
  suggest,
} from "../data";

interface OverviewTabProps {
  data: Merchant[];
  onOpenDrawer: (id: number) => void;
  onOpenSegmentDrawer: (segment: string) => void;
}

export function OverviewTab({
  data,
  onOpenDrawer,
  onOpenSegmentDrawer,
}: OverviewTabProps) {
  const actionNow = data.filter((m) => m.action === "Action Now");
  const followUp = data.filter((m) => m.action === "Follow Up");
  const growth = data.filter((m) => m.action === "Growth");
  const riskGmv = [...actionNow, ...followUp].reduce((s, m) => s + m.gmv, 0);

  const priority = [...data]
    .sort((a, b) => b.riskScore * b.gmv - a.riskScore * a.gmv)
    .slice(0, 5);

  const maxCount = Math.max(...profiles.map((p) => profileData[p].count[3]));

  return (
    <div className="space-y-6">
      {/* Insight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Immediate Action
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {actionNow.length}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            High risk merchants prioritized by GMV and decline speed.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Follow Up
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {followUp.length}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Recoverable merchants requiring scheduled KAM intervention.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Growth Pipeline
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {growth.length}
          </p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Champion and High Value merchants ready for upsell.
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Drawer View
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-2">Enabled</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Click merchant, point, bubble or table row for app drawer details.
          </p>
        </div>
      </div>

      {/* Portfolio Health Distribution */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Portfolio Health Distribution
            </h2>
            <p className="text-sm text-slate-500">
              Fintech-style snapshot merged with detailed RFM views
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-4">
          {/* Segment Strength */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Merchant Segment Strength
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Composite score by GMV, success rate, growth and risk pressure
            </p>
            <div className="space-y-3">
              {profiles.map((p) => {
                const c = profileData[p].count[3];
                const color =
                  p === "Champion Merchants" || p.includes("Loyal")
                    ? "bg-green-500"
                    : p.includes("Risk") || p === "Lost Merchants"
                      ? "bg-red-500"
                      : p === "Monitor Closely"
                        ? "bg-amber-500"
                        : "bg-blue-500";
                return (
                  <div
                    key={p}
                    onClick={() => onOpenSegmentDrawer(p)}
                    className="grid grid-cols-[150px_1fr_56px] gap-3 items-center text-sm cursor-pointer group hover:bg-slate-50 rounded-lg p-1 transition-all"
                  >
                    <span className="text-slate-700 truncate group-hover:font-semibold transition-all">
                      {p}
                    </span>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={clsx(
                          "h-full rounded-full transition-all group-hover:brightness-95",
                          color,
                        )}
                        style={{ width: `${(c / maxCount) * 100}%` }}
                      />
                    </div>
                    <b className="text-slate-700 text-right">{c}</b>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Merchant Queue */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  Priority Merchant Queue
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sorted automatically by urgency and GMV impact
                </p>
              </div>
              <button className="px-3 py-1.5 text-xs font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                Refresh Live Data
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {priority.length > 0 ? (
                priority.map((m) => {
                  const timeframe =
                    m.action === "Action Now"
                      ? "This week"
                      : m.action === "Follow Up"
                        ? "Within 2 weeks"
                        : m.action === "Growth"
                          ? "Next 30 days"
                          : m.action === "Win-back"
                            ? "Quarterly"
                            : "Monthly batch";

                  const riskColor =
                    m.riskScore > 75
                      ? "bg-red-50 border-red-100 text-red-700"
                      : m.riskScore > 50
                        ? "bg-orange-50 border-orange-100 text-orange-700"
                        : "bg-emerald-50 border-emerald-100 text-emerald-700";

                  return (
                    <div
                      key={m.id}
                      className="flex items-start gap-5 p-5 hover:bg-slate-50 transition-all duration-200 group"
                    >
                      {/* Identity Section */}
                      <div className="flex-1 min-w-0 space-y-2.5">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={clsx(
                                "px-2.5 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap shadow-sm",
                                actionTagClass(m.action),
                              )}
                            >
                              {m.action}
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter italic">
                              {timeframe}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-slate-900 truncate tracking-tight">
                            {m.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-bold whitespace-nowrap">
                              {m.segment}
                            </span>
                            <span className="opacity-30">•</span>
                            <span className="italic whitespace-nowrap">
                              {m.trend}
                            </span>
                          </div>
                        </div>

                        {/* Performance Summary: Single Line Integrated */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-1.5 text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">
                              GMV
                            </span>
                            <span className="font-extrabold text-slate-700">
                              {fmt(m.gmv)}
                            </span>
                          </div>
                          <div className="w-px h-3 bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">
                              Success
                            </span>
                            <span className="font-extrabold text-slate-700">
                              {m.successRate}%
                            </span>
                          </div>
                          <div className="w-px h-3 bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">
                              Risk
                            </span>
                            <span
                              className={clsx(
                                "font-extrabold",
                                m.riskScore > 70
                                  ? "text-red-600"
                                  : "text-slate-700",
                              )}
                            >
                              {m.riskScore}
                            </span>
                          </div>
                          <div className="w-px h-3 bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">
                              Errors
                            </span>
                            <span className="font-extrabold text-slate-700">
                              {m.errors}
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 font-medium pl-1">
                          • {m.month}
                        </div>
                      </div>

                      {/* Action Section */}
                      <div className="flex flex-col items-end gap-2 shrink-0 ml-6 max-w-[200px]">
                        <button className="px-5 py-2 text-xs font-extrabold text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-all shadow-md shadow-primary-100 active:scale-95">
                          Start Action
                        </button>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-500 leading-tight italic">
                            {suggest(m)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-10 text-center">
                  <p className="text-sm text-slate-400 italic">
                    No priority merchants found.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive KAM Summary */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Executive KAM Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Top Performers
            </h4>
            <strong className="text-xl text-green-600">৳3.58 Cr</strong>
            <p className="text-xs text-slate-500 mt-1">
              High success + high GMV. Protect and expand.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              High-Risk Exposure
            </h4>
            <strong className="text-xl text-red-600">
              {fmt(actionNow.reduce((s, m) => s + m.gmv, 0))}
            </strong>
            <p className="text-xs text-slate-500 mt-1">
              Immediate retention and failure diagnosis needed.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Recoverable Pipeline
            </h4>
            <strong className="text-xl text-amber-600">
              {followUp.length}
            </strong>
            <p className="text-xs text-slate-500 mt-1">
              Schedule follow-ups before churn.
            </p>
          </div>
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Growth Opportunities
            </h4>
            <strong className="text-xl text-green-600">{growth.length}</strong>
            <p className="text-xs text-slate-500 mt-1">
              Upsell and relationship expansion candidates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
