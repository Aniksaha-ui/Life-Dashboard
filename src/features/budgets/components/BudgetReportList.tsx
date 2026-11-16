import { AlertTriangle, Pencil, Trash2, WalletCards } from "lucide-react";
import type { BudgetApiItem } from "../types";

const money = (value: unknown) =>
  `BDT ${(Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

interface BudgetReportListProps {
  budgets: BudgetApiItem[];
  onEdit: (budget: BudgetApiItem) => void;
  onDelete: (budget: BudgetApiItem) => void;
}

export function BudgetReportList({ budgets, onEdit, onDelete }: BudgetReportListProps) {
  if (!budgets.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600"><WalletCards className="h-6 w-6" /></span><h2 className="mt-4 text-base font-semibold text-slate-900">No budgets for this period</h2><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">Create a category budget to start tracking where your money is going.</p></div>;
  }

  return <div className="grid gap-4 lg:grid-cols-2">
    {budgets.map((budget) => {
      const percentage = Math.max(0, Math.min(100, Number(budget.progress_percent) || 0));
      const remaining = Number(budget.remaining) || 0;
      const overLimit = budget.warning_level === "exceeded" || remaining < 0;
      const warning = !overLimit && ["watch", "warning"].includes(String(budget.warning_level));
      const color = overLimit ? "bg-rose-500" : warning ? "bg-amber-500" : "bg-emerald-500";
      const status = overLimit ? "Over budget" : warning ? "Getting close" : "On track";
      const statusColor = overLimit ? "bg-rose-50 text-rose-700" : warning ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700";

      return <article key={budget.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
        <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"><WalletCards className="h-5 w-5" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate text-base font-semibold text-slate-900">{budget.category_name || "Uncategorized"}</h3><p className="mt-0.5 text-xs capitalize text-slate-500">{budget.period_type || "monthly"} · {budget.period_start || "—"} to {budget.period_end || "—"}</p></div><div className="flex shrink-0 gap-1"><button type="button" onClick={() => onEdit(budget)} className="rounded-lg p-2 text-slate-400 hover:bg-primary-50 hover:text-primary-600" aria-label={`Edit ${budget.category_name || "budget"}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(budget)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${budget.category_name || "budget"}`}><Trash2 className="h-4 w-4" /></button></div></div></div></div>
        <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3"><div><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Spent</p><p className="mt-1 text-sm font-bold text-slate-900">{money(budget.spent)}</p></div><div className="border-l border-slate-200 pl-3"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Budget</p><p className="mt-1 text-sm font-bold text-slate-900">{money(budget.effective_budget ?? budget.amount)}</p></div></div>
        <div className="mt-5"><div className="mb-2 flex items-center justify-between gap-3"><span className="text-xs font-semibold text-slate-600">{percentage}% used</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusColor}`}>{status}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>Remaining <strong className={overLimit ? "ml-1 text-rose-600" : "ml-1 text-emerald-700"}>{money(remaining)}</strong></span><span>Daily allowance <strong className="ml-1 text-slate-700">{money(budget.daily_allowance)}</strong></span>{Boolean(budget.carry_forward) && <span className="text-primary-700">Carries {money(budget.carry_amount)}</span>}</div>
        {(overLimit || warning) && <p className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${overLimit ? "text-rose-600" : "text-amber-700"}`}><AlertTriangle className="h-4 w-4" />{overLimit ? "You have reached or exceeded this budget." : "You are approaching this budget limit."}</p>}
      </article>;
    })}
  </div>;
}
