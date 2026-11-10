import { ChevronRight, Pencil, Trash2, WalletCards } from "lucide-react";
import { useState } from "react";
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
  const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});

  if (budgets.length === 0) {
    return <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center"><div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-primary-50 text-primary-600"><WalletCards className="h-6 w-6" /></div><h3 className="mt-4 font-semibold text-slate-900">No budgets found</h3><p className="mt-1 text-sm text-slate-500">Try another date or add a category budget.</p></div>;
  }

  return <div className="space-y-4">
    {budgets.map((budget) => {
      const isExpanded = Boolean(expanded[budget.id]);
      const percentage = Math.max(0, Math.min(100, Number(budget.progress_percent) || 0));
      const remaining = Number(budget.remaining) || 0;
      const exceeded = budget.warning_level === "exceeded" || remaining < 0;
      const warning = !exceeded && ["watch", "warning"].includes(String(budget.warning_level));
      const tone = exceeded ? "bg-rose-500" : warning ? "bg-amber-500" : "bg-emerald-500";

      return <article key={budget.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between xl:gap-7">
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <button type="button" onClick={() => setExpanded((current) => ({ ...current, [budget.id]: !isExpanded }))} aria-label={isExpanded ? "Collapse budget details" : "Expand budget details"} className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-md text-slate-500 transition-all ${isExpanded ? "rotate-90 bg-slate-100" : "bg-slate-50 hover:bg-slate-100"}`}><ChevronRight className="h-4 w-4" /></button>
                <div className="min-w-0"><h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{budget.category_name || "Uncategorized"}</h3><div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500"><span className="capitalize">{budget.period_type || "monthly"} budget</span><span aria-hidden>•</span><span>{budget.period_start || "—"} to {budget.period_end || "—"}</span>{Boolean(budget.carry_forward) && <span className="rounded bg-primary-50 px-1.5 py-0.5 font-medium uppercase tracking-wide text-primary-700">Carry forward</span>}</div></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 sm:gap-6 xl:border-0 xl:pt-0">
              <SummaryValue label="Budget" value={money(budget.effective_budget ?? budget.amount)} />
              <SummaryValue label="Spent" value={money(budget.spent)} />
              <SummaryValue label={exceeded ? "Over limit" : "Remaining"} value={money(remaining)} tone={exceeded ? "text-rose-600" : "text-emerald-700"} />
            </div>

            <div className="flex items-center justify-end gap-1 border-t border-slate-100 pt-3 xl:border-0 xl:pt-0"><button type="button" onClick={() => onEdit(budget)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-primary-50 hover:text-primary-600" aria-label={`Edit ${budget.category_name || "budget"}`}><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(budget)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${budget.category_name || "budget"}`}><Trash2 className="h-4 w-4" /></button></div>
          </div>
        </div>
        <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="border-t border-slate-100 bg-slate-50/70 p-4 sm:p-5">
              <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div>
                  <div className="flex items-center justify-between gap-3 text-xs"><span className="font-semibold text-slate-600">{percentage}% of budget used</span><span className={exceeded ? "font-semibold text-rose-600" : warning ? "font-semibold text-amber-600" : "font-semibold text-emerald-700"}>{exceeded ? "Needs attention" : warning ? "Near limit" : "On track"}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${tone}`} style={{ width: `${percentage}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs text-slate-500"><span>Daily allowance <strong className="ml-1 text-slate-800">{money(budget.daily_allowance)}</strong></span><span>{Boolean(budget.carry_forward) ? <>Carried <strong className="ml-1 text-primary-700">{money(budget.carry_amount)}</strong></> : "No carry forward"}</span></div>
              </div>
            </div>
          </div>
        </div>
      </article>;
    })}
  </div>;
}

function SummaryValue({ label, value, tone = "text-slate-900" }: { label: string; value: string; tone?: string }) {
  return <div className="min-w-0 text-right"><p className="truncate text-[11px] text-slate-500 sm:text-xs">{label}</p><p className={`mt-0.5 truncate text-xs font-semibold sm:text-sm ${tone}`}>{value}</p></div>;
}
