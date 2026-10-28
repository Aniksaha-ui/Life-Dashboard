import { clsx } from "clsx";
import { profiles, profileData, errorData } from "../data";

export function ErrorTab() {
  const maxError = 837;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Error Patterns</h2>
        <p className="text-sm text-slate-500 mb-4">
          Failure drivers across merchant profiles
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Error Volume by Segment */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Error Volume by Segment
          </h3>
          <div className="space-y-3">
            {profiles.slice(0, 8).map((p) => {
              const v = ((profileData[p].count[3] * 3) % 100) + 20;
              return (
                <div
                  key={p}
                  className="grid grid-cols-[150px_1fr_56px] gap-3 items-center text-sm"
                >
                  <span className="text-slate-700 truncate">{p}</span>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-red-500"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                  <b className="text-slate-700 text-right">{v}</b>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Errors */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">
            Top 5 Errors
          </h3>
          <div className="space-y-3">
            {errorData.map(([label, count], i) => (
              <div
                key={label}
                className="grid grid-cols-[150px_1fr_56px] gap-3 items-center text-sm"
              >
                <span className="text-slate-700 truncate">{label}</span>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={clsx(
                      "h-full rounded-full",
                      i < 2 ? "bg-red-500" : "bg-amber-500",
                    )}
                    style={{ width: `${(count / maxError) * 100}%` }}
                  />
                </div>
                <b className="text-slate-700 text-right">{count}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
