import { ArrowLeft, BarChart3, CalendarRange } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportLoadingOverlay } from "../components/ReportLoadingOverlay";
import { FinancialOverviewCharts } from "./components/FinancialOverviewCharts";
import { FinancialOverviewFilters } from "./components/FinancialOverviewFilters";
import {
  CashFlowHighlight,
  FinancialSummaryCards,
} from "./components/FinancialSummary";
import {
  FinancialOverviewTable,
  TransferReceiptsTable,
} from "./components/FinancialOverviewTable";
import { useFinancialOverview } from "./hooks/useFinancialOverview";

function FinancialOverviewContent({
  state,
}: {
  state: ReturnType<typeof useFinancialOverview>;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
              Reporting window
            </p>
            <p className="mt-1 text-lg font-semibold text-slate-900">
              {state.period.fromDate} to {state.period.toDate}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start rounded-lg bg-primary-50 px-3 py-2 text-sm font-medium text-primary-700">
            <CalendarRange className="h-4 w-4" />
            {state.granularity === "monthly" ? "Monthly view" : "Daily view"}
          </span>
        </div>
      </section>

      <CashFlowHighlight rows={state.daily} period={state.period} />
      <FinancialSummaryCards metrics={state.metrics} />

      <FinancialOverviewCharts
        rows={state.daily}
        granularity={state.granularity}
      />
      <TransferReceiptsTable rows={state.transferReceipts} />
      <FinancialOverviewTable
        rows={state.ledgerRows}
        search={state.ledgerSearch}
        onSearchChange={state.setLedgerSearch}
        granularity={state.granularity}
      />
    </div>
  );
}

export default function FinancialOverviewPage() {
  const state = useFinancialOverview();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 via-white to-white p-5 shadow-sm sm:p-6">
        <Link
          to="/reports"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          All reports
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold text-slate-900">
          <BarChart3 className="h-6 w-6 text-primary-600" />
          Financial Overview
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Portfolio balances, income, and costing performance for one reporting
          window.
        </p>
      </div>

      <FinancialOverviewFilters
        fromDate={state.fromDate}
        toDate={state.toDate}
        granularity={state.granularity}
        loading={state.loading}
        onFromDateChange={state.setFromDate}
        onToDateChange={state.setToDate}
        onGranularityChange={state.setGranularity}
        onRefresh={() => void state.refresh()}
      />

      {state.loading ? (
        <ReportLoadingOverlay />
      ) : (
        <FinancialOverviewContent state={state} />
      )}
    </div>
  );
}
