import { RefreshCcw } from "lucide-react";
import type { AccountType } from "../types";

const options: Array<{ value: AccountType; label: string }> = [
  { value: "all", label: "All account types" },
  { value: "CASH", label: "Cash" },
  { value: "BANK", label: "Bank" },
  { value: "CARD", label: "Card" },
  { value: "MOBILE_BANKING", label: "Mobile Banking" },
];

export function AccountBalanceFilters({
  typeFilter,
  onTypeChange,
  onClear,
  onRefresh,
  loading,
}: {
  typeFilter: AccountType;
  onTypeChange: (value: AccountType) => void;
  onClear: () => void;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="w-full max-w-md text-xs font-semibold uppercase tracking-wide text-slate-500">
          Account type
          <select
            value={typeFilter}
            onChange={(event) =>
              onTypeChange(event.target.value as AccountType)
            }
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-700"
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear filters
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            <RefreshCcw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>
    </section>
  );
}
