import { ArrowLeft, BarChart3, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportLoadingOverlay } from "../components/ReportLoadingOverlay";
import { SummaryFilters } from "./components/SummaryFilters";
import { SummaryMetrics } from "./components/SummaryMetrics";
import { SummaryVisualization } from "./components/SummaryVisualization";
import { useSummaryReport } from "./hooks/useSummaryReport";

function SummaryContent({
  state,
}: {
  state: ReturnType<typeof useSummaryReport>;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
              Reporting window
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {state.report.fromDateLabel} to {state.report.toDateLabel}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              A concise view of balance, income, and every major outflow.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary-700 shadow-sm">
            <CalendarDays className="h-4 w-4" />
            Summary period
          </span>
        </div>
      </section>
      <SummaryMetrics report={state.report} />
      <SummaryVisualization report={state.report} />
    </div>
  );
}

export default function SummaryReportPage() {
  const state = useSummaryReport();
  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm sm:p-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All reports
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          Summary Report
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          A clear snapshot of cash position, income, and outflow for a selected
          period.
        </p>
      </header>
      <SummaryFilters
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
        <SummaryContent state={state} />
      )}
    </div>
  );
}
