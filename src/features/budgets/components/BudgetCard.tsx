import { AlertTriangle, Pencil, Trash2, WalletCards } from "lucide-react";
import type { BudgetApiItem } from "../types";

const money = (amount: unknown) => `BDT ${(Number(amount) || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const number = (value: unknown) => Number(value) || 0;

export function BudgetCard({ budget, onEdit, onDelete }: { budget: BudgetApiItem; onEdit: () => void; onDelete: () => void }) {
  const percentage = Math.max(0, Math.min(100, number(budget.progress_percent)));
  const remaining = number(budget.remaining);
  const exceeded = budget.warning_level === "exceeded" || remaining < 0;
  const warning = !exceeded && ["watch", "warning"].includes(String(budget.warning_level));
  const color = exceeded ? "bg-rose-500" : warning ? "bg-amber-500" : "bg-emerald-500";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5">
      <div className="flex gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-700"><WalletCards className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <div className="flex gap-2">
            <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-slate-900">{budget.category_name || "Uncategorized"}</h3><p className="mt-0.5 text-xs capitalize text-slate-500">{budget.period_type || "monthly"} · {budget.period_start || "—"} to {budget.period_end || "—"}</p></div>
            <div className="flex h-fit gap-1"><button type="button" aria-label="Edit budget" onClick={onEdit} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-700"><Pencil className="h-4 w-4" /></button><button type="button" aria-label="Delete budget" onClick={onDelete} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button></div>
          </div>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Spent</p><p className="mt-1 font-bold text-slate-900">{money(budget.spent)}</p></div><div className="text-right"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Budget</p><p className="mt-1 font-bold text-slate-900">{money(budget.effective_budget ?? budget.amount)}</p></div></div>
      <div className="mt-5 flex justify-between gap-3 text-xs font-semibold text-slate-500"><span>{percentage}% used</span><span className={exceeded ? "text-rose-600" : warning ? "text-amber-600" : "text-emerald-600"}>{exceeded ? "Over limit" : `${money(remaining)} left`}</span></div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div>
      {(warning || exceeded) && <p className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${exceeded ? "text-rose-600" : "text-amber-600"}`}><AlertTriangle className="h-4 w-4" />{exceeded ? "This budget has been reached or exceeded." : `${percentage}% of this budget has been used.`}</p>}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>Daily allowance <strong className="text-slate-700">{money(budget.daily_allowance)}</strong></span>{Boolean(budget.carry_forward) && <span className="text-primary-700">+{money(budget.carry_amount)} carried forward</span>}</div>
    </article>
  );
}
