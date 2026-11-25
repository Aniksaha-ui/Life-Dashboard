import { CalendarRange, FolderTree, ReceiptText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Drawer } from "../../../../components/Drawer";
import { Loader } from "../../../../components/Loader";
import { SearchField } from "../../../../components/SearchField";
import { getLedger } from "../../../expense-transactions/api/queries";
import {
  extractTransactionsForRange,
  formatDisplayDate,
  formatMoney,
  getAccountName,
  getCategoryName,
  toNumber,
  type WeeklyExpenseBlock,
  type WeeklyTransaction,
} from "../types";

export function WeeklyDetailDrawer({
  week,
  prefetchedTransactions,
  onClose,
}: {
  week: WeeklyExpenseBlock | null;
  prefetchedTransactions?: WeeklyTransaction[] | null;
  onClose: () => void;
}) {
  const [transactions, setTransactions] = useState<WeeklyTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"transactions" | "categories">("transactions");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!week?.start || !week.end) return;
    let active = true;
    setError("");
    setSearch("");
    setTab("transactions");

    if (prefetchedTransactions) {
      setLoading(false);
      setTransactions(
        extractTransactionsForRange(
          prefetchedTransactions,
          week.start,
          week.end,
        ),
      );
      return;
    }

    setLoading(true);
    setTransactions([]);

    void getLedger({ fromDate: week.start, toDate: week.end })
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : ((data as { data?: unknown[] }).data ?? []);
        const matched = extractTransactionsForRange(
          items as WeeklyTransaction[],
          week.start,
          week.end,
        );
        if (active) setTransactions(matched);
      })
      .catch((reason) => {
        if (active) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load weekly transactions.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [week, prefetchedTransactions]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? transactions.filter((item) =>
          `${item.note ?? ""} ${getCategoryName(item)} ${getAccountName(item)} ${item.amount ?? ""} ${item.type ?? ""}`
            .toLowerCase()
            .includes(query),
        )
      : transactions;
  }, [search, transactions]);

  const groups = useMemo(() => {
    const totalAmount = transactions.reduce(
      (sum, item) => sum + toNumber(item.amount),
      0,
    );
    const map = new Map<
      string,
      { name: string; amount: number; count: number }
    >();
    transactions.forEach((item) => {
      const name = getCategoryName(item);
      const group = map.get(name) ?? { name, amount: 0, count: 0 };
      group.amount += toNumber(item.amount);
      group.count += 1;
      map.set(name, group);
    });

    const query = search.trim().toLowerCase();
    return [...map.values()]
      .map((item) => ({
        ...item,
        share: totalAmount ? (item.amount / totalAmount) * 100 : 0,
      }))
      .filter(
        (item) =>
          !query ||
          `${item.name} ${item.amount} ${item.count}`
            .toLowerCase()
            .includes(query),
      )
      .sort((a, b) => b.amount - a.amount);
  }, [search, transactions]);

  const total = transactions.reduce(
    (sum, item) => sum + toNumber(item.amount),
    0,
  );
  const recurringTotal = transactions.reduce(
    (sum, item) =>
      String(item.type ?? "").toUpperCase() === "RECURRING"
        ? sum + toNumber(item.amount)
        : sum,
    0,
  );
  const regularTotal = total - recurringTotal;
  const avgPerTxn = transactions.length > 0 ? total / transactions.length : 0;

  return (
    <Drawer
      open={Boolean(week)}
      onClose={onClose}
      width="4xl"
      title={week ? `${week.label} Breakdown` : undefined}
      subtitle={
        week ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-200">
              {week.range}
            </span>
            <span className="font-semibold text-slate-500">
              {week.start} to {week.end}
            </span>
          </div>
        ) : undefined
      }
      noPadding
      contentClassName="flex-1 min-h-0 overflow-y-auto"
    >
      {week && (
        <div className="space-y-6 p-4 sm:p-6">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-white shadow-sm">
            <div className="flex items-start gap-4 p-5">
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full ${
                  week.isPeak
                    ? "bg-rose-50 text-rose-600"
                    : "bg-primary-50 text-primary-600"
                }`}
              >
                <CalendarRange className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {week.label} total expense
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums text-slate-900">
                  {loading ? "—" : formatMoney(total)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {week.share.toFixed(1)}% of selected period spend ·{" "}
                  {loading
                    ? "Loading..."
                    : `${transactions.length} transaction${transactions.length === 1 ? "" : "s"}`}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 divide-y divide-slate-100 border-t border-slate-100 bg-white/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="px-5 py-3">
                <p className="text-xs font-medium text-slate-500">
                  Regular expenses
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                  {loading ? "—" : formatMoney(regularTotal)}
                </p>
              </div>
              <div className="px-5 py-3">
                <p className="text-xs font-medium text-slate-500">
                  Recurring bills
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-violet-700">
                  {loading ? "—" : formatMoney(recurringTotal)}
                </p>
              </div>
              <div className="px-5 py-3">
                <p className="text-xs font-medium text-slate-500">
                  Avg / txn · Categories
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular-nums text-primary-700">
                  {loading
                    ? "—"
                    : `${formatMoney(avgPerTxn)} · ${groups.length}`}
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div
                className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto"
                role="tablist"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "transactions"}
                  onClick={() => setTab("transactions")}
                  className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === "transactions"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <ReceiptText className="h-4 w-4" />
                  All Transactions
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={tab === "categories"}
                  onClick={() => setTab("categories")}
                  className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    tab === "categories"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <FolderTree className="h-4 w-4" />
                  By Category
                </button>
              </div>
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder={
                  tab === "transactions"
                    ? "Search note, category, account"
                    : "Search categories"
                }
                className="w-full sm:w-72"
              />
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center">
                <Loader size="lg" />
              </div>
            ) : error ? (
              <p className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </p>
            ) : tab === "transactions" ? (
              <div className="divide-y divide-slate-100">
                {filtered.length ? (
                  filtered.map((item) => {
                    const isRecurring =
                      String(item.type ?? "").toUpperCase() === "RECURRING";
                    return (
                      <article
                        key={String(item.id)}
                        className="flex flex-col gap-2 px-4 py-3.5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-slate-900">
                              {String(item.note || "Expense transaction")}
                            </p>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                                isRecurring
                                  ? "bg-violet-50 text-violet-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isRecurring ? "Recurring" : "Expense"}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {getCategoryName(item)} · {getAccountName(item)} ·{" "}
                            {formatDisplayDate(item.transaction_date)}
                          </p>
                        </div>
                        <p className="shrink-0 font-bold tabular-nums text-rose-600 sm:text-right">
                          -{formatMoney(toNumber(item.amount))}
                        </p>
                      </article>
                    );
                  })
                ) : (
                  <p className="p-10 text-center text-sm text-slate-500">
                    No expense transactions were recorded in this week.
                  </p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {groups.length ? (
                  groups.map((group) => (
                    <article
                      key={group.name}
                      className="space-y-2 px-4 py-4 sm:px-5"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {group.name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {group.count} transaction
                            {group.count === 1 ? "" : "s"} ·{" "}
                            {group.share.toFixed(1)}% of weekly spend
                          </p>
                        </div>
                        <p className="shrink-0 font-bold tabular-nums text-slate-900">
                          {formatMoney(group.amount)}
                        </p>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary-500"
                          style={{ width: `${Math.max(group.share, 3)}%` }}
                        />
                      </div>
                    </article>
                  ))
                ) : (
                  <p className="p-10 text-center text-sm text-slate-500">
                    No categories found for this week.
                  </p>
                )}
              </div>
            )}
          </section>
        </div>
      )}
    </Drawer>
  );
}
