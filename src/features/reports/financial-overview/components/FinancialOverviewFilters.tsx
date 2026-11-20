import { RefreshCcw } from "lucide-react";
import { outlinedControlClass, OutlinedField } from "../../../../components/OutlinedField";
import type { FinancialGranularity } from "../types";

interface FinancialOverviewFiltersProps {
  fromDate: string;
  toDate: string;
  granularity: FinancialGranularity;
  loading: boolean;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onGranularityChange: (value: FinancialGranularity) => void;
  onRefresh: () => void;
}

export function FinancialOverviewFilters({
  fromDate,
  toDate,
  granularity,
  loading,
  onFromDateChange,
  onToDateChange,
  onGranularityChange,
  onRefresh,
}: FinancialOverviewFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_11rem_auto]">
        <OutlinedField label="From date">
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => onFromDateChange(event.target.value)}
            className={outlinedControlClass}
          />
        </OutlinedField>
        <OutlinedField label="To date">
          <input
            type="date"
            min={fromDate || undefined}
            value={toDate}
            onChange={(event) => onToDateChange(event.target.value)}
            className={outlinedControlClass}
          />
        </OutlinedField>
        <OutlinedField label="View by">
          <select
            value={granularity}
            onChange={(event) =>
              onGranularityChange(event.target.value as FinancialGranularity)
            }
            className={outlinedControlClass}
          >
            <option value="monthly">Monthly</option>
            <option value="daily">Daily</option>
          </select>
        </OutlinedField>
        <button
          type="button"
          disabled={loading}
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh report
        </button>
      </div>
    </section>
  );
}
