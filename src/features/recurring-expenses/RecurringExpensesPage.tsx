import {
  CalendarCheck,
  Pencil,
  Play,
  Plus,
  RefreshCcw,
  Repeat,
} from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable } from "../../components/DataTable";
import { MetricCard } from "../../components/MetricCard";
import { MobileRecordDrawer } from "../../components/MobileRecordDrawer";
import { SearchField } from "../../components/SearchField";
import { RecurringExpenseForm } from "./components/RecurringExpenseForm";
import { getRecurringExpenseColumns } from "./components/columns";
import { useRecurringExpenses } from "./hooks/useRecurringExpenses";
import type { RecurringExpenseRow } from "./types";

export default function RecurringExpensesPage() {
  const state = useRecurringExpenses();
  const [editing, setEditing] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<RecurringExpenseRow | null>(
    null,
  );
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
      <div className="app-metrics-grid overview-scroll grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
                className={`inline-flex h-10 items-center rounded-lg px-3 text-sm font-semibold ${state.status === value ? "bg-primary-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex w-full items-center gap-2 lg:w-auto">
            <SearchField
              value={state.search}
              onChange={state.setSearch}
              placeholder="Search recurring expenses"
              className="min-w-0 w-full flex-1 sm:w-72 sm:flex-none"
            />
            <button
              onClick={() => void state.refresh()}
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600"
              aria-label="Refresh recurring expenses"
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
        onRowClick={(row) => setSelectedPlan(row as RecurringExpenseRow)}
      />
      <MobileRecordDrawer
        open={Boolean(selectedPlan)}
        onClose={() => setSelectedPlan(null)}
        title={selectedPlan?.titleLabel || "Recurring Expense Details"}
        badge={selectedPlan?.statusLabel}
        badgeClassName={
          selectedPlan?.statusLabel === "Active"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-slate-100 text-slate-600 ring-slate-200"
        }
        recordId={selectedPlan ? `REC #${selectedPlan.id}` : undefined}
        headerAction={
          selectedPlan ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = selectedPlan;
                  setSelectedPlan(null);
                  void state.run(target.id);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
              >
                <Play className="h-4 w-4" />
                Run
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedPlan;
                  setSelectedPlan(null);
                  setEditing(target);
                  setOpen(true);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
          ) : undefined
        }
        hero={
          selectedPlan
            ? {
                icon: Repeat,
                iconClassName: selectedPlan.dueNow
                  ? "bg-amber-50 text-amber-600"
                  : "bg-primary-50 text-primary-600",
                overline: `${selectedPlan.frequencyLabel} recurring expense`,
                value: selectedPlan.amountLabel,
                valueClassName: "tabular-nums text-rose-600",
                meta: `${selectedPlan.accountLabel} · ${selectedPlan.categoryLabel}`,
                stats: [
                  {
                    label: "Frequency",
                    value: selectedPlan.frequencyLabel,
                  },
                  {
                    label: "Next run date",
                    value: selectedPlan.nextRunLabel,
                    valueClassName: selectedPlan.dueNow
                      ? "text-amber-700"
                      : "text-primary-700",
                  },
                ],
              }
            : undefined
        }
        details={
          selectedPlan
            ? [
                { label: "Plan ID", value: `REC #${selectedPlan.id}` },
                { label: "Status", value: selectedPlan.statusLabel },
                { label: "Account", value: selectedPlan.accountLabel },
                { label: "Category", value: selectedPlan.categoryLabel },
                { label: "Frequency", value: selectedPlan.frequencyLabel },
                { label: "Next Run", value: selectedPlan.nextRunLabel },
                { label: "Start Date", value: selectedPlan.start_date },
                { label: "End Date", value: selectedPlan.end_date },
                {
                  label: "Note",
                  value: selectedPlan.note ? (
                    <span className="whitespace-pre-wrap">
                      {selectedPlan.note}
                    </span>
                  ) : (
                    "No remarks added"
                  ),
                  fullWidth: true,
                },
              ]
            : []
        }
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
