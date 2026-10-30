import {
  ArrowDownCircle,
  ArrowLeftRight,
  ArrowUpCircle,
  Landmark,
  Wallet,
} from "lucide-react";
import type { SummaryReport } from "../types";

export function SummaryMetrics({ report }: { report: SummaryReport }) {
  const items = [
    {
      label: "Current Balance",
      value: report.currentBalanceLabel,
      icon: Wallet,
      tone: "bg-primary-50 text-primary-700",
    },
    {
      label: "Total Accounts",
      value: report.accountCountLabel,
      icon: Landmark,
      tone: "bg-violet-50 text-violet-700",
    },
    {
      label: "Income Total",
      value: report.totalIncomeLabel,
      icon: ArrowUpCircle,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Expense Total",
      value: report.totalExpenseLabel,
      icon: ArrowDownCircle,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Withdraw Total",
      value: report.totalWithdrawLabel,
      icon: ArrowDownCircle,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Transfer Out",
      value: report.totalTransferOutLabel,
      icon: ArrowLeftRight,
      tone: "bg-cyan-50 text-cyan-700",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <article
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${item.tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Summary
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {item.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
