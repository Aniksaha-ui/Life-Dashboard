import { AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { SummaryAlertItem } from "../types";

const getSeverityStyles = (severity: SummaryAlertItem["severity"]) => {
  if (severity === "warning") {
    return {
      container: "bg-amber-50 border-amber-200",
      iconWrap: "bg-amber-500 shadow-amber-200 ring-amber-100",
      title: "text-amber-900",
      message: "text-amber-700",
      button: "bg-amber-600 hover:bg-amber-700 shadow-amber-200",
    };
  }

  if (severity === "info") {
    return {
      container: "bg-blue-50 border-blue-200",
      iconWrap: "bg-blue-500 shadow-blue-200 ring-blue-100",
      title: "text-blue-900",
      message: "text-blue-700",
      button: "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    };
  }

  if (severity === "success") {
    return {
      container: "bg-emerald-50 border-emerald-200",
      iconWrap: "bg-emerald-500 shadow-emerald-200 ring-emerald-100",
      title: "text-emerald-900",
      message: "text-emerald-700",
      button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200",
    };
  }

  return {
    container: "bg-rose-50 border-rose-200",
    iconWrap: "bg-rose-500 shadow-rose-200 ring-rose-100",
    title: "text-rose-900",
    message: "text-rose-700",
    button: "bg-rose-600 hover:bg-rose-700 shadow-rose-200",
  };
};

export function TopAlertBanner({ alert }: { alert?: SummaryAlertItem }) {
  const navigate = useNavigate();
  if (!alert) return null;

  const styles = getSeverityStyles(alert.severity);
  const hasNavigateConfig = Boolean(alert.navigate);
  const navigationPath = alert.navigate?.path ?? null;
  const canNavigate = Boolean(navigationPath);

  return (
    <div
      className={`border rounded-xl p-4 flex items-center shadow-sm animate-in fade-in slide-in-from-top duration-500 ${hasNavigateConfig ? "justify-between" : "justify-start"} ${styles.container}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`p-2.5 text-white rounded-xl shadow-lg ring-4 ${styles.iconWrap}`}
        >
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className={`text-base font-bold ${styles.title}`}>
            {alert.title}
          </h4>
          <p className={`text-sm font-medium opacity-90 ${styles.message}`}>
            {alert.message}
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
          className={`px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 ${styles.button} ${!canNavigate ? "opacity-60 cursor-not-allowed pointer-events-none" : ""}`}
        >
          {alert.navigate?.label || "Review"}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
