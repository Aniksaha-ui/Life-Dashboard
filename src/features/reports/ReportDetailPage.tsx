import { ArrowLeft, BarChart3, RefreshCcw } from "lucide-react";
import { useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { getReportColumns } from "./components/columns";
import { ReportChart } from "./components/ReportChart";
import { ReportFilters } from "./components/ReportFilters";
import { ReportsOverview } from "./components/ReportsOverview";
import { getReportDefinition } from "./constants/reports";
import { ManagementSummary } from "./current-vs-previous-month-analysis/components/ManagementSummary";
import { useReport } from "./hooks/useReport";
import type { ReportDefinition } from "./types";
import { WeeklySpendProfile } from "./weekly-current-month-analysis/components/WeeklySpendProfile";

function ReportContent({ definition }: { definition: ReportDefinition }) {
  const state = useReport(definition);
  const columns = useMemo(() => getReportColumns(state.rows), [state.rows]);
  const Icon = definition.icon;
  const isCategoryUsage = definition.id === "category-usage-analysis";
  const isCurrentVsPrevious = definition.id === "current-vs-previous-month-analysis";
  const isWeeklyCurrentMonth = definition.id === "weekly-current-month-analysis";

  return (
    <div className="report-detail-page space-y-6">
      <div className="report-detail-header flex flex-col gap-4 rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <Link
            to="/reports"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4" />
            All reports
          </Link>
          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Icon className="h-6 w-6 text-primary-600" />
            {definition.title}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {definition.description}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void state.refresh()}
          disabled={state.loading}
          className="inline-flex items-center gap-2 self-start rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw
            className={`h-4 w-4 ${state.loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <ReportFilters
        supportsDateRange={definition.supportsDateRange}
        fromDate={state.fromDate}
        toDate={state.toDate}
        onFromDateChange={state.setFromDate}
        onToDateChange={state.setToDate}
        onClear={() => {
          state.setFromDate(state.defaultDateRange.fromDate);
          state.setToDate(state.defaultDateRange.toDate);
        }}
        onRefresh={() => void state.refresh()}
        isLoading={state.loading}
      />

      {!isWeeklyCurrentMonth && <ReportsOverview metrics={state.metrics} loading={state.loading} />}
      {isCurrentVsPrevious && !state.loading && <ManagementSummary report={state} />}
      {isWeeklyCurrentMonth && !state.loading && <WeeklySpendProfile rows={state.rows} />}
      {!isWeeklyCurrentMonth && <ReportChart chart={state.chart} />}

      {!isWeeklyCurrentMonth && (state.loading || state.rows.length > 0) && (
        <DataTable
          data={state.rows}
          columns={columns}
          isLoading={state.loading}
          loadingText="Loading report data..."
          hideToolbarDateFilter
          hideViewColumn
          filterActions={
            <label className="relative block w-full md:w-80">
              <span className="sr-only">Search report data</span>
              <input
                type="search"
                value={state.search}
                onChange={(event) => state.setSearch(event.target.value)}
                placeholder={isCategoryUsage ? "Search category, usage count, amount, or share" : "Search report data"}
                className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100"
              />
              {state.search && <button type="button" onClick={() => state.setSearch("")} aria-label="Clear search" className="absolute inset-y-0 right-2 my-auto grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700">×</button>}
            </label>
          }
        />
      )}

      {!isWeeklyCurrentMonth && !state.loading && !state.rows.length && (
        <section className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center shadow-sm">
          <BarChart3 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">
            This report does not include a tabular breakdown for the selected
            range.
          </p>
        </section>
      )}
    </div>
  );
}

export default function ReportDetailPage() {
  const { reportId } = useParams();
  const definition = getReportDefinition(reportId);

  if (!definition) return <Navigate to="/reports" replace />;

  return <ReportContent definition={definition} />;
}
