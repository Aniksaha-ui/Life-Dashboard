import { AlertTriangle, CalendarDays, Pencil, PiggyBank, Repeat, Trash2, WalletCards } from "lucide-react";
import type { BudgetApiItem } from "../types";

export type BudgetStatus = "on-track" | "close" | "over";

export const formatMoney = (value: unknown) =>
  `BDT ${(Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

export const getBudgetUsage = (budget: BudgetApiItem) => Math.max(0, Math.round(Number(budget.progress_percent) || 0));

export function getBudgetStatus(budget: BudgetApiItem): BudgetStatus {
  if (budget.warning_level === "exceeded" || (Number(budget.remaining) || 0) < 0) return "over";
  if (["watch", "warning"].includes(String(budget.warning_level))) return "close";
  return "on-track";
}

export const budgetStatusStyles: Record<BudgetStatus, { label: string; badge: string; bar: string; ring: string; text: string; dot: string }> = {
  "on-track": { label: "On track", badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", bar: "bg-emerald-500", ring: "stroke-emerald-500", text: "text-emerald-700", dot: "bg-emerald-500" },
  close: { label: "Getting close", badge: "bg-amber-50 text-amber-700 ring-amber-600/20", bar: "bg-amber-500", ring: "stroke-amber-500", text: "text-amber-700", dot: "bg-amber-500" },
  over: { label: "Over budget", badge: "bg-rose-50 text-rose-700 ring-rose-600/20", bar: "bg-rose-500", ring: "stroke-rose-500", text: "text-rose-600", dot: "bg-rose-500" },
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

function UsageRing({ percent, status }: { percent: number; status: BudgetStatus }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(100, percent) / 100);
  return <div className="relative grid h-16 w-16 shrink-0 place-items-center">
    <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
      <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" className="stroke-slate-100" />
      <circle cx="32" cy="32" r={radius} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} className={`${budgetStatusStyles[status].ring} transition-[stroke-dashoffset] duration-700`} />
    </svg>
    <span className={`absolute text-sm font-bold ${status === "on-track" ? "text-slate-900" : budgetStatusStyles[status].text}`}>{percent}%</span>
  </div>;
}

interface BudgetReportListProps {
  budgets: BudgetApiItem[];
  hasFilters?: boolean;
  onEdit: (budget: BudgetApiItem) => void;
  onDelete: (budget: BudgetApiItem) => void;
}

export function BudgetReportList({ budgets, hasFilters = false, onEdit, onDelete }: BudgetReportListProps) {
  if (!budgets.length) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-primary-50 text-primary-600"><WalletCards className="h-6 w-6" /></span><h2 className="mt-4 text-base font-semibold text-slate-900">{hasFilters ? "No budgets match your filters" : "No budgets for this period"}</h2><p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">{hasFilters ? "Try a different search or status filter." : "Create a category budget to start tracking where your money is going."}</p></div>;
  }

  return <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
    {budgets.map((budget) => {
      const percent = getBudgetUsage(budget);
      const status = getBudgetStatus(budget);
      const styles = budgetStatusStyles[status];
      const remaining = Number(budget.remaining) || 0;
      const name = budget.category_name || "Uncategorized";

      return <article key={budget.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md">
        <span className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} aria-hidden="true" />
        <div className="flex items-start gap-4 p-4 pt-5 sm:p-5 sm:pt-6">
          <UsageRing percent={percent} status={status} />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="truncate text-base font-semibold text-slate-900" title={name}>{name}</h3>
              <div className="-mt-1 -mr-1 flex shrink-0 gap-0.5 opacity-100 transition sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <button type="button" onClick={() => onEdit(budget)} className="rounded-lg p-1.5 text-slate-400 hover:bg-primary-50 hover:text-primary-600" aria-label={`Edit ${name}`}><Pencil className="h-4 w-4" /></button>
                <button type="button" onClick={() => onDelete(budget)} className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Delete ${name}`}><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1 capitalize"><Repeat className="h-3 w-3" />{budget.period_type || "monthly"}</span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" />{formatDate(budget.period_start)} – {formatDate(budget.period_end)}</span>
            </div>
            <span className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${styles.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />{styles.label}</span>
          </div>
        </div>

        <div className="mx-4 grid grid-cols-3 divide-x divide-slate-200 rounded-xl bg-slate-50 py-3 text-center sm:mx-5">
          <div className="px-2"><p className="text-[11px] font-medium text-slate-500">Spent</p><p className="mt-0.5 truncate text-sm font-bold text-slate-900">{formatMoney(budget.spent)}</p></div>
          <div className="px-2"><p className="text-[11px] font-medium text-slate-500">Budget</p><p className="mt-0.5 truncate text-sm font-bold text-slate-900">{formatMoney(budget.effective_budget ?? budget.amount)}</p></div>
          <div className="px-2"><p className="text-[11px] font-medium text-slate-500">{remaining < 0 ? "Over by" : "Left"}</p><p className={`mt-0.5 truncate text-sm font-bold ${remaining < 0 ? "text-rose-600" : "text-emerald-700"}`}>{formatMoney(Math.abs(remaining))}</p></div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-xs text-slate-500 sm:px-5">
          <span className="inline-flex items-center gap-1.5"><PiggyBank className="h-3.5 w-3.5 text-slate-400" />Daily allowance <strong className="font-semibold text-slate-800">{formatMoney(budget.daily_allowance)}</strong></span>
          {Boolean(budget.carry_forward) && <span className="rounded-md bg-primary-50 px-2 py-0.5 font-medium text-primary-700">+{formatMoney(budget.carry_amount)} carried</span>}
        </div>
        {status !== "on-track" && <p className={`flex items-center gap-1.5 border-t px-4 py-2.5 text-xs font-medium sm:px-5 ${status === "over" ? "border-rose-100 bg-rose-50/70 text-rose-700" : "border-amber-100 bg-amber-50/70 text-amber-800"}`}><AlertTriangle className="h-3.5 w-3.5 shrink-0" />{status === "over" ? "You have reached or exceeded this budget." : "You are approaching this budget limit."}</p>}
      </article>;
    })}
  </div>;
}
