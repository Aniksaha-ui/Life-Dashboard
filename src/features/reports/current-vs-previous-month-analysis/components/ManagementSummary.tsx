import { ArrowDownRight, ArrowUpRight, CircleDollarSign, ReceiptText, Wallet } from "lucide-react";
import { useMemo } from "react";
import type { ReportData, ReportRow } from "../../types";

const numberValue = (value: unknown) => Number(value) || 0;

const currency = (value: number) =>
  `BDT ${Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const rowFor = (rows: ReportRow[], key: string, fallback: number) =>
  rows.find((row) => row.period_key === key) ?? rows[fallback];

export function ManagementSummary({ report }: { report: ReportData }) {
  const summary = useMemo(() => {
    const previous = rowFor(report.rows, "previous_month", 0);
    const current = rowFor(report.rows, "current_month", 1);

    return [
      { label: "Income", icon: CircleDollarSign, field: "income", positiveIsGood: true },
      { label: "Total outflow", icon: ReceiptText, field: "total_outflow", positiveIsGood: false },
      { label: "Recurring bills", icon: Wallet, field: "recurring", positiveIsGood: false },
      { label: "Net movement", icon: ArrowUpRight, field: "net", positiveIsGood: true },
    ].map((item) => {
      const before = numberValue(previous?.[item.field]);
      const after = numberValue(current?.[item.field]);
      const difference = after - before;
      const change = before === 0 ? null : (difference / Math.abs(before)) * 100;

      return { ...item, difference, change };
    });
  }, [report.rows]);

  return (
    <section aria-labelledby="management-summary-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">Management summary</p>
          <h2 id="management-summary-title" className="mt-1 text-lg font-semibold text-slate-900">What changed from last month</h2>
        </div>
        <p className="text-xs text-slate-500">Measured against the prior reporting month.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const favorable = item.positiveIsGood ? item.difference >= 0 : item.difference <= 0;
          const TrendIcon = item.difference >= 0 ? ArrowUpRight : ArrowDownRight;
          const Icon = item.icon;

          return (
            <article key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-50 text-primary-600"><Icon className="h-4 w-4" /></span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${favorable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  <TrendIcon className="h-3.5 w-3.5" />
                  {item.change === null ? "New this month" : `${item.change >= 0 ? "+" : ""}${item.change.toFixed(1)}%`}
                </span>
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</p>
              <p className={`mt-1 text-lg font-bold ${favorable ? "text-emerald-700" : "text-rose-700"}`}>{item.difference >= 0 ? "+" : "−"}{currency(item.difference)}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
