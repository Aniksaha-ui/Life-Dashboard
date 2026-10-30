import { clsx } from "clsx";
import type { MetricCardProps } from "../types/common";

export function MetricCard({
  title,
  value,
  isLoading = false,
  onClick,
  className,
  valueClassName,
  titleClassName,
}: MetricCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "metric-card-container bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all text-left",
        onClick ? "cursor-pointer hover:border-slate-300 hover:shadow-md" : "",
        className,
      )}
    >
      <p
        className={clsx(
          "text-xs font-semibold text-slate-500 uppercase",
          titleClassName,
        )}
      >
        {title}
      </p>
      {isLoading ? (
        <div className="mt-2 h-7 w-24 animate-pulse rounded-md bg-slate-200" />
      ) : (
        <p
          className={clsx(
            "text-2xl font-bold mt-2 text-slate-900",
            valueClassName,
          )}
        >
          {value}
        </p>
      )}
    </div>
  );
}
