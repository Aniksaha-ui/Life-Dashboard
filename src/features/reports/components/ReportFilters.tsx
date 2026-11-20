import { RefreshCcw } from "lucide-react";
import { outlinedControlClass, OutlinedField } from "../../../components/OutlinedField";

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
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {supportsDateRange && (
          <>
            <OutlinedField label="From date" className="min-w-0 flex-1">
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={(event) => onFromDateChange(event.target.value)}
                className={outlinedControlClass}
              />
            </OutlinedField>
            <OutlinedField label="To date" className="min-w-0 flex-1">
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={(event) => onToDateChange(event.target.value)}
                className={outlinedControlClass}
              />
            </OutlinedField>
          </>
        )}
        <div className="flex gap-2">
          {supportsDateRange && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              This month
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-3 text-sm font-semibold text-white disabled:opacity-60"
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
