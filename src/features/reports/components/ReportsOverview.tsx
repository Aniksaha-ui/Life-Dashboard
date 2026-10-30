import { MetricCard } from "../../../components/MetricCard";
import type { ReportMetric } from "../types";

export function ReportsOverview({
  metrics,
  loading,
}: {
  metrics: ReportMetric[];
  loading: boolean;
}) {
  const items = metrics.length
    ? metrics
    : [
        { label: "Report data", value: "—" },
        { label: "Reporting period", value: "—" },
        { label: "Total records", value: "—" },
      ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <MetricCard
          key={item.label}
          title={item.label}
          value={item.value}
          isLoading={loading}
        />
      ))}
    </section>
  );
}
