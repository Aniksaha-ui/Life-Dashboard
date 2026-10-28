import { AlertCircle, AlertTriangle, Clock, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SummaryAlertItem } from "../types";

const getSeverityIcon = (severity: SummaryAlertItem["severity"]) => {
  if (severity === "critical") {
    return <AlertCircle className="w-5 h-5 text-rose-500" />;
  }
  if (severity === "warning") {
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  }
  return <Clock className="w-5 h-5 text-blue-500" />;
};

export function BottomAlertList({ alerts }: { alerts?: SummaryAlertItem[] }) {
  const navigate = useNavigate();
  const actionList = alerts || [];
  if (actionList.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-900">
          Action Center
        </h3>
      </div>
      <div className="space-y-3">
        {actionList.map((action) => {
          const hasNavigateConfig = Boolean(action.navigate);
          const navigationPath = action.navigate?.path ?? null;
          const canNavigate = Boolean(navigationPath);
          return (
            <div
              key={action.key}
              className={`flex items-center p-3 rounded-lg bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors ${hasNavigateConfig ? "justify-between" : "justify-start"}`}
            >
              <div className="flex items-center gap-3">
                {getSeverityIcon(action.severity)}
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {action.title}
                  </p>
                  <p className="text-xs text-slate-500">
                    {action.message || `${action.count} items`}
                  </p>
                </div>
              </div>
              {hasNavigateConfig && (
                <button
                  onClick={() => {
                    if (navigationPath) {
                      navigate(navigationPath);
                    }
                  }}
                  disabled={!canNavigate}
                  className={`flex items-center gap-1.5 text-sm font-bold text-primary-600 transition-colors group ${
                    canNavigate
                      ? "hover:text-primary-700"
                      : "opacity-60 cursor-not-allowed pointer-events-none"
                  }`}
                >
                  {action.navigate?.label || "Review"}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
