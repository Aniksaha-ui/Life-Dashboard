import { MetricCard } from "../../../../components/MetricCard";
import type { EMIOperationOverviewProps } from "../types";

export function EMIOverview({ metrics }: EMIOperationOverviewProps) {
  return (
    <div className="flex flex-col gap-4 py-6">
      <h2 className="text-sm font-semibold text-slate-900 px-1">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value={metrics.total_requests.toString()}
        />
        <MetricCard
          title="Approved"
          value={metrics.total_approved.toString()}
        />
        <MetricCard
          title="Declined"
          value={metrics.total_declined.toString()}
        />
        <MetricCard
          title="EMI Amount (BDT)"
          value={`৳${Number(metrics.total_emi_amount).toLocaleString()}`}
        />
      </div>
    </div>
  );
}
