import { MetricCard } from "../../../../components/MetricCard";
import type { MetricData } from "../types";

export function TransactionTicketOverview({
  metrics,
}: {
  metrics: MetricData;
}) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <h2 className="text-sm font-semibold text-slate-900">Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Tickets" value={metrics.total.toString()} />
        <MetricCard
          title="Pending Tickets"
          value={metrics.pending.toString()}
        />
        <MetricCard title="Solved Tickets" value={metrics.solved.toString()} />
      </div>
    </div>
  );
}
