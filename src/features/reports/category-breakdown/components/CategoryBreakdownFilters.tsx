import { RefreshCcw } from "lucide-react";
import { outlinedControlClass, OutlinedField } from "../../../../components/OutlinedField";
import type { CategoryType } from "../types";
export function CategoryBreakdownFilters({
  fromDate,
  toDate,
  typeFilter,
  loading,
  onFromDateChange,
  onToDateChange,
  onTypeChange,
  onClear,
  onRefresh,
}: {
  fromDate: string;
  toDate: string;
  typeFilter: CategoryType;
  loading: boolean;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onTypeChange: (value: CategoryType) => void;
  onClear: () => void;
  onRefresh: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <OutlinedField label="Category type">
          <select
            value={typeFilter}
            onChange={(event) =>
              onTypeChange(event.target.value as CategoryType)
            }
            className={outlinedControlClass}
          >
            <option value="all">All categories</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </OutlinedField>
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
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => onToDateChange(event.target.value)}
            className={outlinedControlClass}
          />
        </OutlinedField>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center rounded-lg bg-primary-600 px-3 text-white disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
