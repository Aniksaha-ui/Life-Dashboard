import { RefreshCcw } from "lucide-react";
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
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Category type
          <select
            value={typeFilter}
            onChange={(event) =>
              onTypeChange(event.target.value as CategoryType)
            }
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
          >
            <option value="all">All categories</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          From date
          <input
            type="date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => onFromDateChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
          />
        </label>
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          To date
          <input
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => onToDateChange(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
          />
        </label>
        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={onClear}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-3 py-2 text-white disabled:opacity-60"
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
