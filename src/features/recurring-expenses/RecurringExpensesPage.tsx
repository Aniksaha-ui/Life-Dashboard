import { CalendarCheck, Play, Plus, RefreshCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { RecurringExpenseForm } from "./components/RecurringExpenseForm";
import { getRecurringExpenseColumns } from "./components/columns";
import { useRecurringExpenses } from "./hooks/useRecurringExpenses";

export default function RecurringExpensesPage() {
  const state = useRecurringExpenses();
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const columns = useMemo(
    () =>
      getRecurringExpenseColumns(
        (item) => {
          setEditing(item);
          setOpen(true);
        },
        (item) => void state.run(item.id),
      ),
    [state.run],
  );
  return (
    <div className="app-management-page recurring-expenses-page space-y-6">
      <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <CalendarCheck className="h-6 w-6 text-primary-600" />
            Recurring Expense Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Schedule repeated expense transactions and execute due items.
          </p>
        </div>
        <div className="app-page-actions flex flex-wrap gap-2">
          <button
            onClick={() => void state.runDue()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            <Play className="h-4 w-4" />
            Run Due
          </button>
          <button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 py-2 text-sm font-semibold text-white"
          >
            <Plus className="h-4 w-4" />
            New Recurring Expense
          </button>
        </div>
      </div>
      <div className="app-metrics-grid grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Plans"
          value={state.metrics.total}
          isLoading={state.loading}
        />
        <MetricCard
          title="Active Plans"
          value={state.metrics.active}
          isLoading={state.loading}
        />
        <MetricCard
          title="Due Now"
          value={state.metrics.due}
          isLoading={state.loading}
        />
        <MetricCard
          title="Scheduled Amount"
          value={`BDT ${state.metrics.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          isLoading={state.loading}
        />
      </div>
      <section className="app-filter-panel rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
          <div className="flex gap-2">
            {[
              ["all", "All Plans"],
              ["active", "Active"],
              ["inactive", "Inactive"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => state.setStatus(value)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${state.status === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={state.search}
              onChange={(event) => state.setSearch(event.target.value)}
              placeholder="Search recurring expenses"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              onClick={() => void state.refresh()}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-600"
            >
              <RefreshCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      <DataTable
        data={state.rows}
        columns={columns}
        isLoading={state.loading}
        loadingText="Loading recurring expenses..."
        hideToolbarDateFilter
        hideViewColumn
      />
      <RecurringExpenseForm
        open={open}
        onClose={() => setOpen(false)}
        item={editing}
        accounts={state.accounts}
        categories={state.categories}
        onSave={state.save}
      />
    </div>
  );
}
