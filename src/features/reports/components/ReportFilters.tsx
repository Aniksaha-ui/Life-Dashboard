import { RefreshCcw } from "lucide-react";

interface ReportFiltersProps {
  supportsDateRange?: boolean;
  fromDate: string;
  toDate: string;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onClear: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ReportFilters({
  supportsDateRange,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onClear,
  onRefresh,
  isLoading,
}: ReportFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        {supportsDateRange && (
          <>
            <label className="flex-1 text-xs font-semibold uppercase text-slate-500">
              From date
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => onFromDateChange(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
              />
            </label>
            <label className="flex-1 text-xs font-semibold uppercase text-slate-500">
              To date
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => onToDateChange(event.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
              />
            </label>
          </>
        )}
        <div className="flex gap-2">
          {supportsDateRange && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              This month
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
}
