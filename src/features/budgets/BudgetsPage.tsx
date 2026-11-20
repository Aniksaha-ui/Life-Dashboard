import { CircleCheck, Plus, RefreshCcw, TrendingDown, WalletCards } from "lucide-react";
import { outlinedControlClass, OutlinedField } from "../../components/OutlinedField";
import { SearchField } from "../../components/SearchField";
import { useEffect, useMemo, useState } from "react";
import { PageLoadingState } from "../../components/PageLoadingState";
import { BudgetForm } from "./components/BudgetForm";
import { BudgetReportList } from "./components/BudgetReportList";
import { useBudgets } from "./hooks/useBudgets";
import type { BudgetApiItem } from "./types";

const money = (value: number) => `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function BudgetsPage() {
  const state = useBudgets();
  const [editing, setEditing] = useState<BudgetApiItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(state.date);
  const [search, setSearch] = useState("");
  useEffect(() => setDraftDate(state.date), [state.date]);

  const filteredBudgets = useMemo(() => state.budgets.filter((budget) => `${budget.category_name || ""} ${budget.period_type || ""}`.toLowerCase().includes(search.toLowerCase())), [search, state.budgets]);
  const usedPercent = state.totals.planned ? Math.min(100, (state.totals.spent / state.totals.planned) * 100) : 0;
  const save = async (values: Parameters<typeof state.save>[0]) => { await state.save(values, editing); setEditing(null); setIsFormOpen(false); };
  const remove = async (budget: BudgetApiItem) => { if (window.confirm(`Remove the ${budget.category_name || "selected"} budget?`)) await state.remove(budget.id); };
  const openNewBudget = () => { setEditing(null); setIsFormOpen(true); };

  return <div className="budgets-page space-y-5">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-primary-700">Plan with confidence</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900"><WalletCards className="h-6 w-6 text-primary-600" /> Your budgets</h1><p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">Set spending limits by category and stay ahead of your monthly plan.</p></div><button type="button" onClick={openNewBudget} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm shadow-primary-600/20 hover:bg-primary-700"><Plus className="h-4 w-4" /> Add budget</button></header>

    <section className="grid gap-3 sm:grid-cols-3"><BudgetMetric icon={WalletCards} label="Planned" value={money(state.totals.planned)} tone="bg-primary-50 text-primary-600" /><BudgetMetric icon={TrendingDown} label="Spent so far" value={money(state.totals.spent)} helper={`${usedPercent.toFixed(0)}% of plan`} tone="bg-amber-50 text-amber-600" /><BudgetMetric icon={CircleCheck} label={state.totals.remaining < 0 ? "Over budget" : "Available"} value={money(state.totals.remaining)} tone={state.totals.remaining < 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"} /></section>

    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div><h2 className="font-semibold text-slate-900">Budget plan</h2><p className="mt-1 text-sm text-slate-500">{filteredBudgets.length} {filteredBudgets.length === 1 ? "category" : "categories"} in this view</p></div><button type="button" onClick={() => void state.refresh()} disabled={state.isLoading} className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${state.isLoading ? "animate-spin" : ""}`} /> Refresh</button></div><div className="grid items-center gap-3 border-b border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto] sm:p-5"><OutlinedField label="Plan date"><input type="date" value={draftDate} onChange={(event) => setDraftDate(event.target.value)} className={outlinedControlClass} /></OutlinedField><SearchField value={search} onChange={setSearch} placeholder="Search a category" /><button type="button" disabled={draftDate === state.date || state.isLoading} onClick={() => state.setDate(draftDate)} className="h-10 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700 disabled:bg-slate-200 disabled:text-slate-400">Apply</button><button type="button" onClick={() => { setSearch(""); setDraftDate(state.date); }} className="h-10 rounded-lg px-3 text-sm font-semibold text-primary-700 hover:bg-primary-50">Clear</button></div><div className="bg-slate-50/50 p-4 sm:p-5">{state.isLoading ? <PageLoadingState /> : <BudgetReportList budgets={filteredBudgets} onEdit={(budget) => { setEditing(budget); setIsFormOpen(true); }} onDelete={(budget) => void remove(budget)} />}</div></section>
    <BudgetForm open={isFormOpen} categories={state.categories} editing={editing} onCancel={() => { setEditing(null); setIsFormOpen(false); }} onSave={save} />
  </div>;
}

function BudgetMetric({ icon: Icon, label, value, helper, tone }: { icon: typeof WalletCards; label: string; value: string; helper?: string; tone: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-start gap-3"><span className={`grid h-9 w-9 place-items-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-1 truncate text-lg font-bold text-slate-900">{value}</p>{helper && <p className="mt-0.5 text-xs text-slate-500">{helper}</p>}</div></div></article>;
}
