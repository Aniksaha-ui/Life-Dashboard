import { CalendarDays, Plus, RefreshCcw, Search, WalletCards, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BudgetForm } from "./components/BudgetForm";
import { BudgetReportList } from "./components/BudgetReportList";
import { useBudgets } from "./hooks/useBudgets";
import type { BudgetApiItem } from "./types";

export default function BudgetsPage() {
  const state = useBudgets();
  const [editing, setEditing] = useState<BudgetApiItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(state.date);
  const [search, setSearch] = useState("");
  useEffect(() => setDraftDate(state.date), [state.date]);
  const save = async (values: Parameters<typeof state.save>[0]) => {
    await state.save(values, editing);
    setEditing(null);
    setIsFormOpen(false);
  };
  const remove = async (budget: BudgetApiItem) => {
    if (!window.confirm(`Remove the ${budget.category_name || "selected"} budget?`)) return;
    await state.remove(budget.id);
  };
  const filteredBudgets = useMemo(
    () => state.budgets.filter((budget) => `${budget.category_name || ""} ${budget.period_type || ""}`.toLowerCase().includes(search.toLowerCase())),
    [search, state.budgets],
  );

  return (
    <div className="app-management-page budgets-page space-y-6">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-5 border-b border-slate-100 px-4 py-5 sm:px-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="flex items-center gap-2 text-xl font-bold text-slate-900"><WalletCards className="h-5 w-5 text-primary-600" /> Budget Report</h1><p className="mt-1 text-sm text-slate-500">Review category limits, spending, and available balance.</p></div><button type="button" onClick={() => { setEditing(null); setIsFormOpen(true); }} className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"><Plus className="h-4 w-4" /> Add Budget</button></div><div className="flex flex-col gap-2 lg:flex-row lg:items-center"><div className="relative"><CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} className="h-10 w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-primary-500 sm:w-auto" /></div><div className="relative"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search category" className="h-10 w-full rounded-full border border-slate-200 py-2 pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-primary-500 sm:w-52" />{search && <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"><X className="h-3.5 w-3.5" /></button>}</div><button type="button" disabled={draftDate === state.date || state.isLoading} onClick={() => { setEditing(null); state.setDate(draftDate); }} className="h-10 rounded-full bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:bg-slate-100 disabled:text-slate-400">Apply Filters</button><button type="button" onClick={() => { setSearch(""); setDraftDate(state.date); }} className="h-10 px-3 text-sm font-medium text-primary-700 hover:text-primary-900">Clear</button><button type="button" onClick={() => void state.refresh()} disabled={state.isLoading} aria-label="Refresh budgets" className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"><RefreshCcw className={`h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`} /></button></div></div>
        <div className="bg-slate-50/40 p-4 sm:p-6">{state.isLoading ? <div className="space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl border border-slate-100 bg-slate-100" />)}</div> : <BudgetReportList budgets={filteredBudgets} onEdit={(budget) => { setEditing(budget); setIsFormOpen(true); }} onDelete={(budget) => void remove(budget)} />}</div>
      </section>
      <BudgetForm open={isFormOpen} categories={state.categories} editing={editing} onCancel={() => { setEditing(null); setIsFormOpen(false); }} onSave={save} />
    </div>
  );
}
