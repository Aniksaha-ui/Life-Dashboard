import { MetricCard } from "../../../../components/MetricCard";
import type { RefundOverviewProps } from "../types";

export function RefundOverview({ metrics }: RefundOverviewProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Total Requests" value={metrics.total.toString()} />
        <MetricCard
          title="Pending Requests"
          value={metrics.pending.toString()}
        />
        <MetricCard
          title="Successful Refunds"
          value={metrics.successful.toString()}
        />
        <MetricCard
          title="Refunded Amount"
          value={`৳${metrics.amount.toLocaleString()}`}
        />
      </div>
    </div>
  );
}
