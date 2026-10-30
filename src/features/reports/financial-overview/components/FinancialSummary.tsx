import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  Landmark,
  WalletCards,
} from "lucide-react";
import type { FinancialOverviewReport, FinancialOverviewRow } from "../types";

const metricPresentation = [
  { icon: WalletCards, tone: "bg-primary-50 text-primary-700" },
  { icon: Landmark, tone: "bg-violet-50 text-violet-700" },
  { icon: ArrowUpRight, tone: "bg-emerald-50 text-emerald-700" },
  { icon: ArrowDownRight, tone: "bg-rose-50 text-rose-700" },
  { icon: ArrowUpRight, tone: "bg-amber-50 text-amber-700" },
  { icon: CircleDollarSign, tone: "bg-cyan-50 text-cyan-700" },
];

export function FinancialSummaryCards({
  metrics,
}: {
  metrics: FinancialOverviewReport["metrics"];
}) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric, index) => {
        const presentation = metricPresentation[index] ?? metricPresentation[0];
        const Icon = presentation.icon;
        const valueTone =
          metric.tone === "positive"
            ? "text-emerald-700"
            : metric.tone === "negative"
              ? "text-rose-700"
              : "text-slate-900";
        return (
          <article
            key={metric.label}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${presentation.tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Overview
              </span>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {metric.label}
            </p>
            <p className={`mt-1 text-xl font-bold tracking-tight ${valueTone}`}>
              {metric.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}

export function CashFlowHighlight({
  rows,
  period,
}: {
  rows: FinancialOverviewRow[];
  period: FinancialOverviewReport["period"];
}) {
  const income = rows.reduce((total, row) => total + row.income, 0);
  const costing = rows.reduce((total, row) => total + row.costing, 0);
  const net = income - costing;
  const expenseRatio = income > 0 ? Math.min((costing / income) * 100, 100) : 0;

  return (
    <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-primary-800 via-primary-700 to-primary-600 p-5 text-white shadow-lg shadow-primary-900/10 sm:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-200">
            Financial health
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {net >= 0 ? "Positive cash flow" : "Cash flow needs attention"}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-primary-100">
            {period.fromDate} to {period.toDate} · {rows.length} reporting
            period{rows.length === 1 ? "" : "s"} analysed.
          </p>
        </div>
        <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary-100">
            Net cash flow
          </p>
          <p className="mt-1 text-2xl font-bold">
            BDT {net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 border-t border-white/15 pt-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-primary-100">
            <span>Costing relative to income</span>
            <span>{expenseRatio.toFixed(1)}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-amber-300"
              style={{ width: `${expenseRatio}%` }}
            />
          </div>
        </div>
        <p className="text-sm font-medium text-primary-100">
          Income: BDT{" "}
          {income.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </p>
      </div>
    </section>
  );
}
