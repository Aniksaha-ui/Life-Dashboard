import {
  PiggyBank,
  ReceiptText,
  Repeat2,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

type Metrics = {
  total: number;
  income: number;
  expense: number;
  recurring: number;
  deposit: number;
};

const formatAmount = (value: number) =>
  `BDT ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function TransactionsOverview({
  loading,
  metrics,
}: {
  loading: boolean;
  metrics: Metrics;
}) {
  const items = [
    {
      icon: ReceiptText,
      label: "Total Transactions",
      value: metrics.total.toLocaleString("en-US"),
      iconClassName: "bg-primary-50 text-primary-600",
    },
    {
      icon: TrendingUp,
      label: "Income Total",
      value: formatAmount(metrics.income),
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: TrendingDown,
      label: "Total Expense",
      value: formatAmount(metrics.expense),
      iconClassName: "bg-amber-50 text-amber-600",
    },
    {
      icon: Repeat2,
      label: "Total Recurring Amount",
      value: formatAmount(metrics.recurring),
      iconClassName: "bg-violet-50 text-violet-600",
    },
    {
      icon: PiggyBank,
      label: "Deposits Total",
      value: formatAmount(metrics.deposit),
      iconClassName: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ icon: Icon, label, value, iconClassName }) => (
        <article
          key={label}
          className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <span className={`rounded-lg p-2.5 ${iconClassName}`}>
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-slate-500">
              {label}
            </p>
            <p className="mt-1 truncate text-xl font-bold text-slate-900">
              {loading ? "..." : value}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
