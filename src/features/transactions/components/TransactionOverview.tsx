import { MetricCard } from "../../../components/MetricCard";
import type { TransactionOverviewProps } from "../types";

export function TransactionOverview({
  metrics,
  onFilterChange,
}: TransactionOverviewProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Transactions"
          value={metrics.total.toString()}
        />
        <MetricCard
          title="Success Transactions"
          value={metrics.successCount.toString()}
          onClick={() => onFilterChange({ status: "success" })}
        />
        <MetricCard
          title="Failed Transactions"
          value={metrics.failedCount.toString()}
          onClick={() => onFilterChange({ status: "failure" })}
        />
        <MetricCard
          title="Total Amount"
          value={`৳${metrics.totalAmount.toLocaleString()}`}
        />
      </div>
    </div>
  );
}
