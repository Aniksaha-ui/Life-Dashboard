import { ArrowDownWideNarrow, CalendarDays, Plus, RefreshCcw, X } from "lucide-react";
import { MetricCard } from "../../components/MetricCard";
import { outlinedControlClass, OutlinedField } from "../../components/OutlinedField";
import { SearchField } from "../../components/SearchField";
import { useEffect, useMemo, useState } from "react";
import { PageLoadingState } from "../../components/PageLoadingState";
import { BudgetForm } from "./components/BudgetForm";
import { BudgetReportList, budgetStatusStyles, formatMoney, getBudgetStatus, type BudgetStatus } from "./components/BudgetReportList";
import { useBudgets } from "./hooks/useBudgets";
import type { BudgetApiItem } from "./types";

type StatusFilter = "all" | BudgetStatus;
type SortKey = "usage" | "name" | "amount";

const statusOrder: BudgetStatus[] = ["on-track", "close", "over"];
const budgetAmount = (budget: BudgetApiItem) => Number(budget.effective_budget ?? budget.amount) || 0;
const formatPlanDate = (value: string) => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

export default function BudgetsPage() {
  const state = useBudgets();
  const [editing, setEditing] = useState<BudgetApiItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(state.date);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("usage");
  useEffect(() => setDraftDate(state.date), [state.date]);

  const statusCounts = useMemo(() => state.budgets.reduce<Record<BudgetStatus, number>>((counts, budget) => ({ ...counts, [getBudgetStatus(budget)]: counts[getBudgetStatus(budget)] + 1 }), { "on-track": 0, close: 0, over: 0 }), [state.budgets]);
  const visibleBudgets = useMemo(() => {
    const term = search.trim().toLowerCase();
    return state.budgets
      .filter((budget) => `${budget.category_name || ""} ${budget.period_type || ""}`.toLowerCase().includes(term))
      .filter((budget) => statusFilter === "all" || getBudgetStatus(budget) === statusFilter)
      .sort((a, b) => sortKey === "name" ? String(a.category_name || "").localeCompare(String(b.category_name || "")) : sortKey === "amount" ? budgetAmount(b) - budgetAmount(a) : (Number(b.progress_percent) || 0) - (Number(a.progress_percent) || 0));
  }, [search, sortKey, state.budgets, statusFilter]);

  const usedPercent = state.totals.planned ? (state.totals.spent / state.totals.planned) * 100 : 0;
  const overall: BudgetStatus = state.totals.remaining < 0 ? "over" : usedPercent >= 80 ? "close" : "on-track";
  const hasFilters = Boolean(search.trim()) || statusFilter !== "all";
  const save = async (values: Parameters<typeof state.save>[0]) => { await state.save(values, editing); setEditing(null); setIsFormOpen(false); };
  const remove = async (budget: BudgetApiItem) => { if (window.confirm(`Remove the ${budget.category_name || "selected"} budget?`)) await state.remove(budget.id); };
  const openNewBudget = () => { setEditing(null); setIsFormOpen(true); };
  const clearFilters = () => { setSearch(""); setStatusFilter("all"); setDraftDate(state.date); };

  return <div className="app-management-page budgets-page space-y-6">
    <div className="app-page-header flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Your budgets</h1>
        <p className="mt-1 text-sm text-slate-500">Set spending limits by category and stay ahead of your monthly plan.</p>
      </div>
      <button type="button" onClick={openNewBudget} className="app-page-primary-action inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
        <Plus className="h-4 w-4" />
        Add budget
      </button>
    </div>

    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 text-white shadow-sm">
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-center">
        <div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-100"><CalendarDays className="h-3.5 w-3.5" />Plan as of {formatPlanDate(state.date)}</p>
          <p className="mt-3 text-sm text-primary-100">Spent so far</p>
          <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">{formatMoney(state.totals.spent)}</p>
          <p className="mt-1 text-sm text-primary-100">of {formatMoney(state.totals.planned)} planned</p>
          <div className="mt-5">
            <div className="h-2.5 overflow-hidden rounded-full bg-white/15"><div className={`h-full rounded-full transition-[width] duration-700 ${overall === "over" ? "bg-rose-400" : overall === "close" ? "bg-amber-300" : "bg-emerald-300"}`} style={{ width: `${Math.min(100, usedPercent)}%` }} /></div>
            <div className="mt-2 flex justify-between text-xs text-primary-100"><span>{usedPercent.toFixed(0)}% of plan used</span><span>{state.totals.remaining < 0 ? `${formatMoney(Math.abs(state.totals.remaining))} over` : `${formatMoney(state.totals.remaining)} available`}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {statusOrder.map((status) => {
            const active = statusFilter === status;
            return <button key={status} type="button" onClick={() => setStatusFilter(active ? "all" : status)} aria-pressed={active} className={`rounded-xl p-3 text-left ring-1 transition sm:p-4 ${active ? "bg-white text-slate-900 ring-white" : "bg-white/10 ring-white/15 hover:bg-white/15"}`}>
              <span className={`block h-2 w-2 rounded-full ${budgetStatusStyles[status].dot}`} />
              <span className="mt-3 block text-2xl font-bold">{statusCounts[status]}</span>
              <span className={`mt-0.5 block text-xs ${active ? "text-slate-500" : "text-primary-100"}`}>{budgetStatusStyles[status].label}</span>
            </button>;
          })}
        </div>
      </div>
    </section>

    <section className="overview-scroll grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="Total Budgets" value={state.budgets.length} isLoading={state.isLoading} />
      <MetricCard title="Planned Budget" value={formatMoney(state.totals.planned)} isLoading={state.isLoading} />
      <MetricCard title="Actual Spending" value={formatMoney(state.totals.spent)} isLoading={state.isLoading} />
      <MetricCard title="Remaining Budget" value={formatMoney(state.totals.remaining)} isLoading={state.isLoading} />
    </section>

    <section className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4 xl:flex-row xl:items-center">
        <div className="grid flex-1 gap-3 sm:grid-cols-[minmax(0,12rem)_auto_minmax(0,1fr)] sm:items-center">
          <OutlinedField label="Plan date"><input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} className={outlinedControlClass} /></OutlinedField>
          <button type="button" disabled={draftDate === state.date || state.isLoading} onClick={() => state.setDate(draftDate)} className="h-10 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-slate-100 disabled:text-slate-400">Apply</button>
          <SearchField value={search} onChange={setSearch} placeholder="Search a category" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Filter by status">
            {(["all", ...statusOrder] as StatusFilter[]).map((status) => <button key={status} type="button" onClick={() => setStatusFilter(status)} aria-pressed={statusFilter === status} className={`rounded-md px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap transition ${statusFilter === status ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{status === "all" ? `All ${state.budgets.length}` : budgetStatusStyles[status].label}</button>)}
          </div>
          <label className="relative inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <ArrowDownWideNarrow className="h-3.5 w-3.5" />
            <span className="sr-only">Sort budgets</span>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)} className="cursor-pointer appearance-none bg-transparent pr-1 outline-none">
              <option value="usage">Most used</option>
              <option value="amount">Largest budget</option>
              <option value="name">Name A–Z</option>
            </select>
          </label>
          <button type="button" onClick={() => void state.refresh()} disabled={state.isLoading} aria-label="Refresh budgets" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`} /></button>
        </div>
      </div>

      {hasFilters && <div className="flex items-center justify-between gap-3 px-1 text-sm text-slate-500"><span>Showing {visibleBudgets.length} of {state.budgets.length} budgets</span><button type="button" onClick={clearFilters} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-primary-700 hover:bg-primary-50"><X className="h-3.5 w-3.5" />Clear filters</button></div>}

      {state.isLoading ? <PageLoadingState /> : <BudgetReportList budgets={visibleBudgets} hasFilters={hasFilters} onEdit={(budget) => { setEditing(budget); setIsFormOpen(true); }} onDelete={(budget) => void remove(budget)} />}
    </section>
    <BudgetForm open={isFormOpen} categories={state.categories} editing={editing} onCancel={() => { setEditing(null); setIsFormOpen(false); }} onSave={save} />
  </div>;
}
