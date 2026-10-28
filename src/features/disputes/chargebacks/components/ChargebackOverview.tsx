import { MetricCard } from "../../../../components/MetricCard";
import type { ChargebackOverviewProps } from "../types";

export function ChargebackOverview({ metrics }: ChargebackOverviewProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value={metrics.total_requests.toString()}
        />
        <MetricCard
          title="Pending Requests"
          value={metrics.pending_requests.toString()}
        />
        <MetricCard
          title="Successful Chargeback"
          value={metrics.successful_chargeback.toString()}
        />
        <MetricCard
          title="Chargeback Amount"
          value={`৳${metrics.chargeback_amount.toLocaleString()}`}
        />
      </div>
    </div>
  );
}
