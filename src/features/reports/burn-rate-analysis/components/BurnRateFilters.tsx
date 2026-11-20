import { RefreshCcw } from "lucide-react";
import { outlinedControlClass, OutlinedField } from "../../../../components/OutlinedField";

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
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onThisMonth}
            className="inline-flex h-10 items-center rounded-lg border border-slate-300 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            This month
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onRefresh}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white disabled:opacity-60"
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
