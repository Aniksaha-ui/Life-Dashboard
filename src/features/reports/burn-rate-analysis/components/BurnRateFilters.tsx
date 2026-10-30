import { RefreshCcw } from "lucide-react";

export function BurnRateFilters({
  fromDate,
  toDate,
  loading,
  onFromDateChange,
  onToDateChange,
  onThisMonth,
  onRefresh,
}: {
  fromDate: string;
  toDate: string;
  loading: boolean;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onThisMonth: () => void;
  onRefresh: () => void;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
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
        <div className="flex flex-wrap items-end gap-2">
          <button
            type="button"
            onClick={onThisMonth}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            This month
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
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
