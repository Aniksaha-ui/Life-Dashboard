import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Flame,
  Layers,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "../../../../components/EmptyState";
import { getLedger } from "../../../expense-transactions/api/queries";
import type { ReportRow } from "../../types";
import {
  formatDisplayDate,
  formatMoney,
  mapWeeklyBlocks,
  type WeeklyExpenseBlock,
  type WeeklyTransaction,
} from "../types";
import { WeeklyDetailDrawer } from "./WeeklyDetailDrawer";
import { WeeklySpendChart } from "./WeeklySpendChart";

interface WeeklySpendProfileProps {
  rows: ReportRow[];
  fromDate?: string;
  toDate?: string;
}

export function WeeklySpendProfile({
  rows,
  fromDate,
  toDate,
}: WeeklySpendProfileProps) {
  const [selected, setSelected] = useState<WeeklyExpenseBlock | null>(null);
  const [ledgerTransactions, setLedgerTransactions] = useState<
    WeeklyTransaction[] | null
  >(null);

  const needsClientReconcile =
    rows.length > 0 && rows.some((row) => row.recurring_included !== true);
  const rangeStart = rows[0]?.week_start
    ? String(rows[0].week_start)
    : fromDate;
  const rangeEnd = rows[rows.length - 1]?.week_end
    ? String(rows[rows.length - 1].week_end)
    : toDate;

  useEffect(() => {
    if (!needsClientReconcile || !rangeStart || !rangeEnd) {
      setLedgerTransactions(null);
      return;
    }

    let active = true;
    void getLedger({ fromDate: rangeStart, toDate: rangeEnd })
      .then((data) => {
        if (!active) return;
        const items = Array.isArray(data)
          ? data
          : ((data as { data?: unknown[] }).data ?? []);
        setLedgerTransactions(items as WeeklyTransaction[]);
      })
      .catch(() => {
        if (active) setLedgerTransactions(null);
      });

    return () => {
      active = false;
    };
  }, [needsClientReconcile, rangeStart, rangeEnd]);

  const weeks = useMemo(
    () => mapWeeklyBlocks(rows, ledgerTransactions),
    [rows, ledgerTransactions],
  );

  const summary = useMemo(() => {
    const totalSpend = weeks.reduce((sum, week) => sum + week.total, 0);
    const totalTransactions = weeks.reduce((sum, week) => sum + week.count, 0);
    const activeWeeks = weeks.filter((week) => week.count > 0).length;
    const averageWeeklySpend = weeks.length > 0 ? totalSpend / weeks.length : 0;
    const peakWeek = weeks.reduce<WeeklyExpenseBlock | null>(
      (highest, week) =>
        !highest || week.total > highest.total ? week : highest,
      null,
    );

    return {
      totalSpend,
      totalTransactions,
      activeWeeks,
      averageWeeklySpend,
      peakWeek,
    };
  }, [weeks]);

  const maximum = Math.max(...weeks.map((week) => week.total), 1);

  if (!weeks.length) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <EmptyState
          title="No weekly data available"
          subtitle="Adjust the reporting date range or record expenses to view weekly spending blocks."
        />
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Summary Strip */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
              Total period spend
            </p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-rose-100/80 text-rose-600">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
            {formatMoney(summary.totalSpend)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across {summary.totalTransactions} expense transaction
            {summary.totalTransactions === 1 ? "" : "s"}
          </p>
        </article>

        <article className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-white to-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              Weekly average
            </p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-100/80 text-blue-600">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
            {formatMoney(summary.averageWeeklySpend)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Per week over {weeks.length} week{weeks.length === 1 ? "" : "s"}
          </p>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              Peak spending week
            </p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-amber-100/80 text-amber-600">
              <Flame className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
            {summary.peakWeek && summary.peakWeek.total > 0
              ? formatMoney(summary.peakWeek.total)
              : "BDT 0.00"}
          </p>
          <p className="mt-1 truncate text-xs text-slate-500">
            {summary.peakWeek && summary.peakWeek.total > 0
              ? `${summary.peakWeek.label} (${summary.peakWeek.range})`
              : "No expenses recorded yet"}
          </p>
        </article>

        <article className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Active weeks
            </p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-100/80 text-emerald-600">
              <Layers className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2.5 text-2xl font-bold tracking-tight tabular-nums text-slate-900">
            {summary.activeWeeks}{" "}
            <span className="text-base font-semibold text-slate-400">
              / {weeks.length}
            </span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {fromDate && toDate
              ? `${formatDisplayDate(fromDate)} – ${formatDisplayDate(toDate)}`
              : "Weeks with recorded spend"}
          </p>
        </article>
      </section>

      {/* Interactive Weekly Spend Chart */}
      <WeeklySpendChart
        weeks={weeks}
        averageWeeklySpend={summary.averageWeeklySpend}
        onSelectWeek={setSelected}
      />

      {/* Weekly Breakdown Cards */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
              Spending cadence
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Weekly breakdown
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Select any week card to inspect transactions and category totals.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            <CalendarDays className="h-3.5 w-3.5" />
            {weeks.length} weekly block{weeks.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-3">
          {weeks.map((week) => {
            const barWidth =
              week.total > 0 ? Math.max((week.total / maximum) * 100, 6) : 0;

            return (
              <button
                key={`${week.label}-${week.start}`}
                type="button"
                onClick={() => setSelected(week)}
                className={`group flex flex-col justify-between rounded-2xl border p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md ${
                  week.isPeak
                    ? "border-rose-200 bg-gradient-to-br from-rose-50/50 via-white to-white hover:border-rose-300"
                    : "border-slate-200 bg-white hover:border-primary-300 hover:bg-primary-50/20"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {week.label}
                        </span>
                        {week.isPeak && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                            <Flame className="h-3 w-3" />
                            Peak
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {week.range}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        week.isPeak
                          ? "bg-rose-100 text-rose-700"
                          : "bg-primary-50 text-primary-700"
                      }`}
                    >
                      {week.share.toFixed(1)}%
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-2xl font-bold tracking-tight tabular-nums text-slate-900">
                      {formatMoney(week.total)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span>
                        {week.count} txn{week.count === 1 ? "" : "s"}
                      </span>
                      <span>·</span>
                      <span>Avg {formatMoney(week.average)}</span>
                      {week.deltaPercent !== null && (
                        <span
                          className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            week.deltaPercent > 0
                              ? "bg-rose-50 text-rose-700"
                              : week.deltaPercent < 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {week.deltaPercent > 0 ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : week.deltaPercent < 0 ? (
                            <ArrowDownRight className="h-3 w-3" />
                          ) : null}
                          {week.deltaPercent > 0 ? "+" : ""}
                          {week.deltaPercent.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all ${
                        week.isPeak
                          ? "bg-gradient-to-r from-rose-500 to-rose-400"
                          : "bg-gradient-to-r from-primary-600 to-primary-400"
                      }`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      {week.calendarLabel || `${week.start} → ${week.end}`}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-primary-600 transition-transform group-hover:translate-x-0.5">
                      Inspect week
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <WeeklyDetailDrawer
        week={selected}
        prefetchedTransactions={ledgerTransactions}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
