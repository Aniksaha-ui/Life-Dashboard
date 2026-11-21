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
      label: "Transactions",
      value: metrics.total.toLocaleString("en-US"),
      hint: "In the selected period",
      iconClassName: "bg-primary-50 text-primary-600",
    },
    {
      icon: TrendingUp,
      label: "Income",
      value: formatAmount(metrics.income),
      hint: "Money received",
      iconClassName: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: TrendingDown,
      label: "Expense",
      value: formatAmount(metrics.expense),
      hint: "Money spent",
      iconClassName: "bg-rose-50 text-rose-600",
    },
    {
      icon: Repeat2,
      label: "Recurring",
      value: formatAmount(metrics.recurring),
      hint: "Scheduled payments",
      iconClassName: "bg-violet-50 text-violet-600",
    },
    {
      icon: PiggyBank,
      label: "Deposits",
      value: formatAmount(metrics.deposit),
      hint: "Added to savings",
      iconClassName: "bg-cyan-50 text-cyan-600",
    },
  ];

  return (
    <section
      aria-label="Transaction summary"
      className="-mx-4 flex snap-x snap-mandatory scroll-px-4 sm:scroll-px-5 md:scroll-px-0 gap-3 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-5 sm:px-5 md:mx-0 md:grid md:grid-cols-6 md:overflow-visible md:px-0 md:pb-0 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden"
    >
      {items.map(({ icon: Icon, label, value, hint, iconClassName }, index) => (
        <article
          key={label}
          className={`flex min-w-[10.5rem] shrink-0 snap-start flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:min-w-0 xl:col-span-1 ${index < 3 ? "md:col-span-2" : "md:col-span-3"}`}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${iconClassName}`}>
              <Icon className="h-4 w-4" />
            </span>
          </div>
          <div className="min-w-0">
            {loading ? (
              <span className="block h-6 w-24 animate-pulse rounded bg-slate-100" />
            ) : (
              <p
                className="truncate text-lg font-bold tracking-tight text-slate-900"
                title={value}
              >
                {value}
              </p>
            )}
            <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
