import { CircleDollarSign, PiggyBank, Wallet } from "lucide-react";
import type { AccountBalanceMetrics } from "../types";

export function AccountBalanceMetrics({
  metrics,
}: {
  metrics: AccountBalanceMetrics;
}) {
  const cards = [
    {
      label: "Total Accounts",
      value: metrics.totalCountLabel,
      icon: Wallet,
      tone: "bg-primary-50 text-primary-700",
    },
    {
      label: "Active Accounts",
      value: metrics.activeCountLabel,
      icon: CircleDollarSign,
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Cash Accounts",
      value: metrics.cashCountLabel,
      icon: PiggyBank,
      tone: "bg-cyan-50 text-cyan-700",
    },
    {
      label: "Tracked Balance",
      value: metrics.totalBalanceLabel,
      icon: Wallet,
      tone: "bg-amber-50 text-amber-700",
    },
  ];
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-xl ${card.tone}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {card.label}
            </p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {card.value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
