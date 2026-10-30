import { ArrowLeft, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { ReportLoadingOverlay } from "../components/ReportLoadingOverlay";
import { AccountBalanceFilters } from "./components/AccountBalanceFilters";
import { AccountBalanceMetrics } from "./components/AccountBalanceMetrics";
import { AccountBalanceTable } from "./components/AccountBalanceTable";
import { useAccountBalancesReport } from "./hooks/useAccountBalancesReport";

function AccountBalancesContent({
  state,
}: {
  state: ReturnType<typeof useAccountBalancesReport>;
}) {
  return (
    <div className="space-y-6">
      <AccountBalanceMetrics metrics={state.metrics} />
      <AccountBalanceTable
        rows={state.rows}
        search={state.search}
        onSearchChange={state.setSearch}
      />
    </div>
  );
}

export default function AccountBalancesReportPage() {
  const state = useAccountBalancesReport();
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
          <Wallet className="h-6 w-6 text-primary-600" />
          Account Balances
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Review current balances across cash, bank, card, and mobile banking
          accounts.
        </p>
      </header>
      <AccountBalanceFilters
        typeFilter={state.typeFilter}
        onTypeChange={state.setTypeFilter}
        onClear={() => {
          state.setTypeFilter("all");
          state.setSearch("");
        }}
        onRefresh={() => void state.refresh()}
        loading={state.loading}
      />
      {state.loading ? (
        <ReportLoadingOverlay />
      ) : (
        <AccountBalancesContent state={state} />
      )}
    </div>
  );
}
