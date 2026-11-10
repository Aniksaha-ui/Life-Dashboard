import { ChevronRight, ReceiptText } from "lucide-react";

interface MobileTransactionListProps {
  rows: any[];
  loading: boolean;
  onSelect: (transaction: any) => void;
}

const typeStyles: Record<string, string> = {
  EXPENSE: "border-rose-200 bg-rose-50 text-rose-600",
  INCOME: "border-emerald-200 bg-emerald-50 text-emerald-700",
  DEPOSIT: "border-cyan-200 bg-cyan-50 text-cyan-700",
  TRANSFER: "border-violet-200 bg-violet-50 text-violet-700",
};

export function MobileTransactionList({ rows, loading, onSelect }: MobileTransactionListProps) {
  if (loading) {
    return <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white" />)}</div>;
  }

  if (rows.length === 0) {
    return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-primary-50 text-primary-600"><ReceiptText className="h-5 w-5" /></span><h2 className="mt-4 font-semibold text-slate-900">No transactions found</h2><p className="mt-1 text-sm text-slate-500">Adjust your filters or add a new transaction.</p></div>;
  }

  const groups = rows.reduce<Record<string, any[]>>((result, row) => {
    const key = row.dateLabel || "Undated";
    result[key] = [...(result[key] || []), row];
    return result;
  }, {});

  return <div className="space-y-3">
    {Object.entries(groups).map(([date, transactions]) => (
      <section key={date} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><span className="text-[11px] font-bold uppercase tracking-wider text-primary-700">{date}</span><span className="text-xs font-medium text-slate-400">{transactions.length} {transactions.length === 1 ? "entry" : "entries"}</span></div>
        <div className="divide-y divide-slate-100">
          {transactions.map((transaction) => {
            const type = String(transaction.type || "TRANSACTION").toUpperCase();
            return <button key={transaction.id} type="button" onClick={() => onSelect(transaction)} className="block w-full px-4 py-3.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100">
              <div className="flex items-start gap-3"><span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-primary-600"><ReceiptText className="h-4 w-4" /></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{transaction.note || "No remarks added"}</p><p className="mt-0.5 truncate text-xs text-slate-500">{transaction.categoryName} · {transaction.accountName}</p></div><p className="shrink-0 text-right text-sm font-bold text-primary-700">{transaction.amountLabel}</p></div><div className="mt-2 flex items-center justify-between gap-2"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${typeStyles[type] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{type.replace(/_/g, " ")}</span><span className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">TXN #{transaction.id}<ChevronRight className="h-3.5 w-3.5 text-slate-400" /></span></div></div></div>
            </button>;
          })}
        </div>
      </section>
    ))}
  </div>;
}
