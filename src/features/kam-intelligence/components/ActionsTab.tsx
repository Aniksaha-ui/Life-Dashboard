import { clsx } from "clsx";
import { type Merchant, fmt, actionTagClass, suggest } from "../data";
import { CopyButton } from "../../../components/CopyButton";

interface ActionsTabProps {
  data: Merchant[];
  onOpenDrawer: (id: number) => void;
}

export function ActionsTab({ data, onOpenDrawer }: ActionsTabProps) {
  const groups = ["Action Now", "Follow Up", "Growth", "Routine", "Win-back"];

  const sorted = [...data].sort(
    (a, b) => b.riskScore * b.gmv - a.riskScore * a.gmv,
  );

  const getLifecycleStatus = (segment: string) => {
    const activeGrowing = [
      "Champion Merchants",
      "Loyal Big Merchants",
      "Loyal Regular Merchants",
      "High Value Irregular Merchants",
      "Potential Up-sell",
      "Stable Merchants",
    ];
    const declining = [
      "High Risk Big Merchants",
      "Lost Merchants",
      "Inactive Merchants",
    ];

    if (activeGrowing.includes(segment)) return "Active & Growing";
    if (declining.includes(segment)) return "Declining";
    return "Watch";
  };

  const getLifecycleStyles = (status: string) => {
    if (status === "Active & Growing")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (status === "Declining")
      return "bg-rose-50 text-rose-700 border-rose-100";
    return "bg-amber-50 text-amber-700 border-amber-100";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">KAM Actions</h2>
        <p className="text-sm text-slate-500 mb-4">
          This tab turns RFM scores into a prioritised KAM to-do list
        </p>
      </div>

      {/* Action Bucket Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {groups.map((g) => {
          const arr = data.filter((m) => m.action === g);
          const sum = arr.reduce((s, m) => s + m.gmv, 0);
          return (
            <div
              key={g}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
            >
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                {g}
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {arr.length}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {fmt(sum)} GMV in this bucket.
              </p>
            </div>
          );
        })}
      </div>

      {/* Prioritised To-Do Table */}
      <div className="mt-8">
        <div className="flex flex-col gap-1 mb-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Prioritised KAM To-Do List
          </h3>
          <p className="text-xs text-slate-500">
            Sorted by urgency and GMV impact. Click a merchant to open the app
            drawer.
          </p>
        </div>

        <div className="overflow-auto border border-slate-200 rounded-xl bg-white shadow-sm">
          <table className="w-full min-w-[1100px] text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Merchant
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Lifecycle Status
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Segment
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Trend
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  GMV
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Risk Score
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Action Type
                </th>
                <th className="text-left px-3 py-3 text-[11px] text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                  Recommendation
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.length > 0 ? (
                sorted.map((m) => {
                  const lifecycleStatus = getLifecycleStatus(m.segment);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50 border-b border-slate-100 last:border-0"
                    >
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => onOpenDrawer(m.id)}
                            className="text-primary-600 font-bold text-sm hover:text-primary-700 bg-transparent border-0 p-0 cursor-pointer text-left transition-colors"
                          >
                            {m.name}
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono p-1 bg-slate-50 border border-slate-100 rounded leading-none text-slate-500">
                              {m.storeId}
                            </span>
                            <CopyButton value={m.storeId} />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={clsx(
                            "px-2.5 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap",
                            getLifecycleStyles(lifecycleStatus),
                          )}
                        >
                          {lifecycleStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 font-medium">
                        {m.segment}
                      </td>
                      <td className="px-3 py-3 text-slate-600">{m.trend}</td>
                      <td className="px-3 py-3 text-slate-600 font-bold">
                        {fmt(m.gmv)}
                      </td>
                      <td className="px-3 py-3 text-slate-600">
                        {m.riskScore}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={clsx(
                            "px-2.5 py-1 text-[10px] font-bold rounded-full border whitespace-nowrap",
                            actionTagClass(m.action),
                          )}
                        >
                          {m.action === "Action Now" ? "Act Now" : m.action}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-xs italic leading-snug">
                        {suggest(m)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-6 text-center text-slate-500"
                  >
                    No actions required.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
