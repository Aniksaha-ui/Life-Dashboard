import { MetricCard } from "../../../../components/MetricCard";
import type { SettlementOverviewProps } from "../types";

export function SettlementOverview({
  metrics,
  onFilterChange,
}: SettlementOverviewProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Bounce Count"
          value={metrics.bounceCount.toString()}
          onClick={() => onFilterChange({ status: "Bounced" })}
        />
        <MetricCard
          title="Bounce Amount"
          value={`৳${metrics.bounceAmount.toLocaleString()}`}
          onClick={() => onFilterChange({ status: "Bounced" })}
        />
      </div>
    </div>
  );
}
