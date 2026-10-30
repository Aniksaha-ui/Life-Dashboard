import { ArrowLeft, BarChart3, Flame, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportLoadingOverlay } from "../components/ReportLoadingOverlay";
import { BurnRateChart } from "./components/BurnRateChart";
import { BurnRateFilters } from "./components/BurnRateFilters";
import { BurnRateTable } from "./components/BurnRateTable";
import { useBurnRateAnalysis } from "./hooks/useBurnRateAnalysis";

function BurnRateContent({
  state,
}: {
  state: ReturnType<typeof useBurnRateAnalysis>;
}) {
  const metrics = [
    {
      label: "Months Tracked",
      value: state.report.monthsTrackedLabel,
      icon: BarChart3,
      tone: "bg-primary-50 text-primary-700",
    },
    {
      label: "Total Expense",
      value: state.report.totalExpenseLabel,
      icon: Wallet,
      tone: "bg-rose-50 text-rose-700",
    },
    {
      label: "Avg Burn Rate",
      value: state.report.averageBurnRateLabel,
      icon: Flame,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      label: "Peak Month",
      value: state.report.peakMonthLabel,
      icon: BarChart3,
      tone: "bg-emerald-50 text-emerald-700",
    },
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">
          Spend health
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">
          Understand your expense pace
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          This report shows total spending and the average amount spent on
          active days, helping you identify months where costs accelerated.
        </p>
      </section>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article
              key={metric.label}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <span
                className={`grid h-10 w-10 place-items-center rounded-xl ${metric.tone}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                {metric.label}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {metric.value}
              </p>
            </article>
          );
        })}
      </section>
      <BurnRateChart chart={state.report.chart} />
      <BurnRateTable
        rows={state.rows}
        search={state.search}
        onSearchChange={state.setSearch}
      />
    </div>
  );
}

export default function BurnRateAnalysisPage() {
  const state = useBurnRateAnalysis();
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-white p-5 shadow-sm sm:p-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All reports
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Flame className="h-6 w-6 text-amber-600" />
          Burn Rate Analysis
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Review expense intensity and average daily spending across your
          reporting period.
        </p>
      </header>
      <BurnRateFilters
        fromDate={state.fromDate}
        toDate={state.toDate}
        loading={state.loading}
        onFromDateChange={state.setFromDate}
        onToDateChange={state.setToDate}
        onThisMonth={() => {
          state.setFromDate(state.defaultDateRange.fromDate);
          state.setToDate(state.defaultDateRange.toDate);
        }}
        onRefresh={() => void state.refresh()}
      />
      {state.loading ? (
        <ReportLoadingOverlay />
      ) : (
        <BurnRateContent state={state} />
      )}
    </div>
  );
}
