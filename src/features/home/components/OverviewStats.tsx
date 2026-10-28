import { useState } from "react";
import { formatNumber } from "../../../utils/format";
import { useMetricsDetail } from "../api/queries";
import type { SummaryData, SummaryParams } from "../types";
import { MetricsDrawer } from "./MetricsDrawer";
import { StatCard } from "./StatCard";

interface OverviewStatsProps {
  stats?: SummaryData["cards"];
  isLoading?: boolean;
}

export function OverviewStats({
  stats,
  params,
  isLoading,
}: OverviewStatsProps & { params: SummaryParams }) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { data: detailData, isLoading: isDetailLoading } = useMetricsDetail(
    selectedMetric,
    params,
  );

  const formatTrend = (pct: number | null | undefined) => {
    if (!pct && pct !== 0) return `0% from previous period`;
    const prefix = pct > 0 ? "+" : "";
    return `${prefix}${formatNumber(pct)}% from previous period`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={stats?.total_txn_volume.title || "Total Transaction Volume"}
          value={`৳${formatNumber(stats?.total_txn_volume.value || 0)}`}
          subtext={formatTrend(stats?.total_txn_volume.trend_pct)}
          isLoading={isLoading}
          onClick={() => setSelectedMetric("total_txn_volume")}
        />
        <StatCard
          title={stats?.total_txn_count.title || "Total Transaction Count"}
          value={formatNumber(stats?.total_txn_count.value || 0)}
          subtext={formatTrend(stats?.total_txn_count.trend_pct)}
          isLoading={isLoading}
          onClick={() => setSelectedMetric("total_txn_count")}
        />
        <StatCard
          title={stats?.ssl_income.title || "SSL Income"}
          value={`৳${formatNumber(stats?.ssl_income.value || 0)}`}
          subtext={formatTrend(stats?.ssl_income.trend_pct)}
          isLoading={isLoading}
          color="#8b5cf6"
          onClick={() => setSelectedMetric("ssl_income")}
        />
        <StatCard
          title={stats?.emi_income.title || "EMI Income"}
          value={`৳${formatNumber(stats?.emi_income.value || 0)}`}
          subtext={formatTrend(stats?.emi_income.trend_pct)}
          isLoading={isLoading}
          color="#f59e0b"
          onClick={() => setSelectedMetric("emi_income")}
        />
        <StatCard
          title={stats?.txn_success_rate.title || "TXN Success Rate"}
          value={`${formatNumber(stats?.txn_success_rate.value || 0)}%`}
          subtext={formatTrend(stats?.txn_success_rate.trend_pct)}
          isLoading={isLoading}
          color="#10b981"
          onClick={() => setSelectedMetric("txn_success_rate")}
        />
        <StatCard
          title={stats?.txn_failed_count.title || "TXN Failed Count"}
          value={formatNumber(stats?.txn_failed_count.value || 0)}
          subtext={formatTrend(stats?.txn_failed_count.trend_pct)}
          isLoading={isLoading}
          color="#ef4444"
          onClick={() => setSelectedMetric("txn_failed_count")}
        />
        <StatCard
          title={stats?.chargeback_amount.title || "Chargeback Amount"}
          value={`৳${formatNumber(stats?.chargeback_amount.value || 0)}`}
          subtext={formatTrend(stats?.chargeback_amount.trend_pct)}
          isLoading={isLoading}
          color="#f43f5e"
          onClick={() => setSelectedMetric("chargeback_amount")}
        />
        <StatCard
          title={stats?.escrow_hold.title || "Escrow Hold"}
          value={`৳${formatNumber(stats?.escrow_hold.value || 0)}`}
          subtext={formatTrend(stats?.escrow_hold.trend_pct)}
          isLoading={isLoading}
          color="#f59e0b"
          onClick={() => setSelectedMetric("escrow_hold")}
        />
      </div>

      <MetricsDrawer
        open={!!selectedMetric}
        onClose={() => setSelectedMetric(null)}
        data={detailData || null}
        isLoading={isDetailLoading}
      />
    </>
  );
}
