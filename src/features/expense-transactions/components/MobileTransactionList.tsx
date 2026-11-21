import { ReceiptText } from "lucide-react";
import {
  amountPrefix,
  amountToneClass,
  getTransactionDirection,
  getTransactionTypeMeta,
} from "./transactionTypes";

interface MobileTransactionListProps {
  rows: any[];
  loading: boolean;
  onSelect: (transaction: any) => void;
}

export function MobileTransactionList({ rows, loading, onSelect }: MobileTransactionListProps) {
  if (loading) {
    return (
      <div
        className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        aria-busy="true"
        aria-label="Loading transactions"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-3.5 py-3">
            <span className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-slate-100" />
            <span className="flex-1 space-y-2">
              <span className="block h-3.5 w-2/3 animate-pulse rounded bg-slate-100" />
              <span className="block h-3 w-1/2 animate-pulse rounded bg-slate-100" />
            </span>
            <span className="h-3.5 w-16 animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600">
          <ReceiptText className="h-5 w-5" />
        </span>
        <h2 className="mt-4 font-semibold text-slate-900">No transactions found</h2>
        <p className="mt-1 text-sm text-slate-500">
          Try a different date range or filter, or add a new transaction.
        </p>
      </div>
    );
  }

  const groups = rows.reduce<Record<string, any[]>>((result, row) => {
    const key = row.dateLabel || "Undated";
    result[key] = [...(result[key] || []), row];
    return result;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([date, transactions]) => (
        <section key={date}>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{date}</h3>
            <span className="text-[11px] font-medium text-slate-400">
              {transactions.length} {transactions.length === 1 ? "entry" : "entries"}
            </span>
          </div>
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {transactions.map((transaction) => {
              const meta = getTransactionTypeMeta(transaction.type);
              const direction = getTransactionDirection(transaction);
              const Icon = meta.icon;
              return (
                <button
                  key={transaction.id}
                  type="button"
                  onClick={() => onSelect(transaction)}
                  className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${meta.iconClassName}`}>
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {transaction.note || meta.label}
                      </span>
                      <span className={`shrink-0 text-sm font-bold tabular-nums ${amountToneClass[direction]}`}>
                        {amountPrefix[direction]}
                        {transaction.amountLabel}
                      </span>
                    </span>
                    <span className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-500">
                      <span className="truncate">
                        {meta.label} · {transaction.accountName}
                        {transaction.category ? ` · ${transaction.categoryName}` : ""}
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-400">
                        Bal. {transaction.balanceAfterLabel.replace("BDT ", "")}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
