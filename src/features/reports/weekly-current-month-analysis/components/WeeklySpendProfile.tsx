import { ArrowRight, FolderTree, ReceiptText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Drawer } from "../../../../components/Drawer";
import { Loader } from "../../../../components/Loader";
import { getLedger } from "../../../expense-transactions/api/queries";
import type { ReportRow } from "../../types";

const number = (value: unknown) => Number(value) || 0;
const money = (value: number) =>
  `BDT ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
type Transaction = Record<string, unknown>;
type Week = {
  label: string;
  range: string;
  start: string;
  end: string;
  total: number;
  average: number;
  count: number;
  share: number;
};
const categoryName = (item: Transaction) =>
  item.category && typeof item.category === "object" && "name" in item.category
    ? String((item.category as { name?: unknown }).name ?? "Uncategorized")
    : "Uncategorized";

const mapWeeks = (rows: ReportRow[]) => {
  const all = rows.reduce((sum, row) => sum + number(row.total_expense), 0);
  return rows.map((row, index): Week => {
    const total = number(row.total_expense);
    return {
      label: String(row.week_label ?? `Week ${index + 1}`),
      range: String(row.range_label ?? "N/A"),
      start: String(row.week_start ?? ""),
      end: String(row.week_end ?? ""),
      total,
      average: number(row.average_expense),
      count: number(row.transaction_count),
      share: all ? (total / all) * 100 : 0,
    };
  });
};

function WeeklyDetailDrawer({
  week,
  onClose,
}: {
  week: Week | null;
  onClose: () => void;
}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"transactions" | "categories">("transactions");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!week?.start || !week.end) return;
    let active = true;
    setLoading(true);
    setError("");
    setSearch("");
    setTab("transactions");
    setTransactions([]);
    void getLedger()
      .then((data) => {
        const items = Array.isArray(data)
          ? data
          : ((data as { data?: unknown[] }).data ?? []);
        const matched = items.filter((raw) => {
          const item = raw as Transaction;
          const date = String(item.transaction_date ?? "").slice(0, 10);
          return (
            date >= week.start &&
            date <= week.end &&
            ["EXPENSE", "RECURRING"].includes(
              String(item.type ?? "").toUpperCase(),
            )
          );
        }) as Transaction[];
        if (active) setTransactions(matched);
      })
      .catch((reason) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Unable to load weekly transactions.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [week]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? transactions.filter((item) =>
          `${item.note ?? ""} ${categoryName(item)} ${item.amount ?? ""}`
            .toLowerCase()
            .includes(query),
        )
      : transactions;
  }, [search, transactions]);
  const groups = useMemo(() => {
    const total = transactions.reduce(
      (sum, item) => sum + number(item.amount),
      0,
    );
    const map = new Map<
      string,
      { name: string; amount: number; count: number }
    >();
    transactions.forEach((item) => {
      const name = categoryName(item);
      const group = map.get(name) ?? { name, amount: 0, count: 0 };
      group.amount += number(item.amount);
      group.count += 1;
      map.set(name, group);
    });
    const query = search.trim().toLowerCase();
    return [...map.values()]
      .map((item) => ({
        ...item,
        share: total ? (item.amount / total) * 100 : 0,
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
    (sum, item) => sum + number(item.amount),
    0,
  );

  return (
    <Drawer
      open={Boolean(week)}
      onClose={onClose}
      width="4xl"
      title={week ? `${week.label} transactions` : undefined}
      subtitle={week ? `${week.range} · ${week.start} to ${week.end}` : undefined}
      noPadding
      contentClassName="flex-1 min-h-0 overflow-y-auto"
    >
      {week && (
        <div className="min-h-full bg-slate-50">
          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                Weekly overview
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Review the week’s spend, then switch between individual transactions and category totals.
              </p>
            </div>
            <section className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
                  Total transactions
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {loading ? "—" : transactions.length}
                </p>
              </article>
              <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  Total amount
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {loading ? "—" : money(total)}
                </p>
              </article>
              <article className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm sm:p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-violet-700">
                  Categories
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                  {loading ? "—" : groups.length}
                </p>
              </article>
            </section>
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto" role="tablist">
                  <button
                    type="button"
                    onClick={() => setTab("transactions")}
                    className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab === "transactions" ? "bg-primary-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    <ReceiptText className="h-4 w-4" />
                    All Transactions
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("categories")}
                    className={`inline-flex min-w-0 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${tab === "categories" ? "bg-primary-600 text-white shadow-sm" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                  >
                    <FolderTree className="h-4 w-4" />
                    Group by Category
                  </button>
                </div>
                <label className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={
                      tab === "transactions"
                        ? "Search transactions"
                        : "Search categories"
                    }
                    className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-100"
                  />
                </label>
              </div>
              {loading ? (
                <div className="flex min-h-72 items-center justify-center">
                  <Loader size="lg" />
                </div>
              ) : error ? (
                <p className="m-4 rounded-xl bg-rose-50 p-4 text-sm text-rose-700">
                  {error}
                </p>
              ) : tab === "transactions" ? (
                <div className="space-y-3 p-3 sm:space-y-0 sm:divide-y sm:divide-slate-100 sm:p-0">
                  {filtered.length ? (
                    filtered.map((item) => (
                      <article
                        key={String(item.id)}
                        className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:rounded-none sm:border-0 sm:bg-white sm:px-5"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {String(item.note || "Expense transaction")}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {categoryName(item)} ·{" "}
                            {String(item.transaction_date ?? "N/A").slice(
                              0,
                              10,
                            )}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="font-semibold text-slate-900">
                            {money(number(item.amount))}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {String(item.type ?? "Expense")}
                          </p>
                        </div>
                      </article>
                    ))
                  ) : (
                    <p className="p-10 text-center text-sm text-slate-500">
                      No expense transactions were recorded in this week.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3 p-3 sm:space-y-0 sm:divide-y sm:divide-slate-100 sm:p-0">
                  {groups.length ? (
                    groups.map((group) => (
                      <article
                        key={group.name}
                        className="grid gap-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:rounded-none sm:border-0 sm:bg-white sm:px-5"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {group.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {group.count} transactions ·{" "}
                            {group.share.toFixed(1)}% of weekly spend
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 sm:text-right">
                          {money(group.amount)}
                        </p>
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
        </div>
      )}
    </Drawer>
  );
}

export function WeeklySpendProfile({ rows }: { rows: ReportRow[] }) {
  const [selected, setSelected] = useState<Week | null>(null);
  const weeks = useMemo(() => mapWeeks(rows), [rows]);
  const maximum = Math.max(...weeks.map((week) => week.total), 1);
  const peak = weeks.reduce<Week | null>(
    (highest, week) =>
      !highest || week.total > highest.total ? week : highest,
    null,
  );
  if (!weeks.length) return null;
  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
              Spending cadence
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Weekly spend profile
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select a week to inspect transactions and category spending.
            </p>
          </div>
          <div className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2 text-right">
            <p className="text-[10px] font-semibold uppercase text-primary-700">
              Peak week
            </p>
            <p className="mt-1 text-sm font-bold text-slate-900">
              {peak?.label}
            </p>
            <p className="text-xs text-slate-600">{money(peak?.total ?? 0)}</p>
          </div>
        </div>
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4 sm:p-5">
          {weeks.map((week) => (
            <button
              key={`${week.label}-${week.range}`}
              type="button"
              onClick={() => setSelected(week)}
              className="group rounded-xl border border-slate-200 bg-slate-50/60 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary-300 hover:bg-primary-50/40 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{week.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{week.range}</p>
                </div>
                <span className="rounded-full bg-primary-100 px-2 py-1 text-[11px] font-semibold text-primary-700">
                  {week.share.toFixed(1)}%
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary-500 to-primary-400"
                  style={{
                    width: `${Math.max((week.total / maximum) * 100, week.total ? 6 : 0)}%`,
                  }}
                />
              </div>
              <div className="mt-4 flex items-end justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">
                    {money(week.total)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {week.count} transactions
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600">
                  Details <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>
      <WeeklyDetailDrawer week={selected} onClose={() => setSelected(null)} />
    </>
  );
}
