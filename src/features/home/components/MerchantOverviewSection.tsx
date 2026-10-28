import { Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "../../../utils/format";
import type { MerchantOverview, SummaryParams } from "../types";
import { useMetricsDetail } from "../api/queries";
import { MerchantDetailsDrawer } from "./MerchantDetailsDrawer";
import { MerchantSummaryCard } from "./MerchantSummaryCard";
import { StatCard } from "./StatCard";
import { Loader } from "../../../components/Loader";

interface MerchantOverviewSectionProps {
  stats?: MerchantOverview;
  params: SummaryParams;
  periodLabel: string;
}

export function MerchantOverviewSection({
  stats,
  params,
  periodLabel,
}: MerchantOverviewSectionProps) {
  const [showMerchantDetails, setShowMerchantDetails] = useState(false);
  const [activeChartKey, setActiveChartKey] = useState<string | null>(null);

  // Fetch detailed metrics for the drawer
  const { data: detailData, isLoading: isDetailLoading } = useMetricsDetail(
    showMerchantDetails ? "merchant_overview" : null,
    params,
  );

  // Helper to get period label for drawer
  const getPeriodLabel = () =>
    detailData?.meta.period_label || periodLabel || "Selected Period";

  // Extract metrics from API data
  const apiMetrics = detailData?.extra_metrics || {};
  const seriesData = detailData?.series || [];

  const totalMerchants =
    apiMetrics.total_merchant ??
    stats?.total_merchants ??
    (stats?.transacting ?? 0) + (stats?.non_transacting ?? 0);
  const transacting = apiMetrics.transacting ?? stats?.transacting ?? 0;
  const nonTransacting =
    apiMetrics.non_transacting ?? stats?.non_transacting ?? 0;
  const recentlyOnboarded =
    apiMetrics.recently_onboarded ?? stats?.recently_onboarded ?? 0;
  const enabled =
    apiMetrics.enabled ?? stats?.enabled_merchants ?? totalMerchants;
  const disabled = apiMetrics.disabled ?? stats?.disabled_merchants ?? 0;

  const healthPercentage =
    apiMetrics.merchant_health_pct ??
    (totalMerchants > 0 ? Math.round((transacting / totalMerchants) * 100) : 0);

  const getHealthStatus = (pct: number) => {
    if (pct >= 90) return "Excellent";
    if (pct >= 80) return "Good";
    if (pct >= 70) return "Average";
    if (pct >= 50) return "Bad";
    return "Very Bad";
  };

  const healthStatus = getHealthStatus(healthPercentage);

  // Derive display info for the active chart metric
  const activeChartMetric = useMemo(() => {
    if (!activeChartKey) return null;

    // In a real scenario, the series data would ideally be keyed by metric
    // For now, since the API returns one series, we use it for the primary metrics
    // and handle specific ones if needed.

    switch (activeChartKey) {
      case "totalMerchants":
        return {
          title: "Total Merchant",
          value: formatNumber(totalMerchants),
          subtext: "Total merchants onboarded",
          color: "#6366f1",
          data: seriesData,
        };
      case "enabled":
        return {
          title: "Enabled",
          value: formatNumber(enabled),
          subtext: `${apiMetrics.enabled_status_pct || 0}% of total`,
          color: "#0ea5e9",
          data: seriesData,
        };
      case "disabled":
        return {
          title: "Disabled",
          value: formatNumber(disabled),
          subtext: `${apiMetrics.disabled_of_total_pct || 0}% of total`,
          color: "#94a3b8",
          data: seriesData,
        };
      case "transacting":
        return {
          title: "Transacting",
          value: formatNumber(transacting),
          subtext: `${apiMetrics.transacting_engagement_pct || 0}% engagement`,
          color: "#3b82f6",
          data: seriesData,
        };
      case "non-transacting":
        return {
          title: "Non transacting",
          value: formatNumber(nonTransacting),
          subtext: "No transaction in period",
          color: "#f59e0b",
          data: seriesData,
        };
      case "health":
        return {
          title: "Merchant Health",
          value: `${healthPercentage}%`,
          subtext: healthStatus,
          color: "#f43f5e",
          data: seriesData,
        };
      case "recently-onboarded":
        return {
          title: "Recently Onboarded",
          value: formatNumber(recentlyOnboarded),
          subtext: `Delta: ${apiMetrics.recently_onboarded_delta || 0}`,
          color: "#10b981",
          data: seriesData,
        };
      default:
        return null;
    }
  }, [
    activeChartKey,
    totalMerchants,
    enabled,
    disabled,
    transacting,
    nonTransacting,
    recentlyOnboarded,
    healthPercentage,
    healthStatus,
    seriesData,
    apiMetrics,
  ]);

  // Effect to set default metric when opening drawer if none selected
  useEffect(() => {
    if (showMerchantDetails && !activeChartKey) {
      setActiveChartKey("totalMerchants");
    }
  }, [showMerchantDetails, activeChartKey]);

  return (
    <>
      <MerchantSummaryCard
        stats={stats}
        isLoading={!stats}
        onViewDetails={() => setShowMerchantDetails(true)}
        periodLabel={periodLabel}
      />

      <MerchantDetailsDrawer
        open={showMerchantDetails}
        onClose={() => setShowMerchantDetails(false)}
        title="Merchant Overview Details"
      >
        <div className="space-y-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            Showing for {getPeriodLabel()}
          </div>

          {isDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-400">
              <Loader size="md" className="mb-2" />
              <p>Fetching merchant details...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  title="Total Merchant"
                  value={formatNumber(totalMerchants)}
                  subtext="Total onboarded"
                  chartData={seriesData}
                  color="#6366f1"
                  variant="simple"
                  onClick={() => setActiveChartKey("totalMerchants")}
                  isSelected={activeChartKey === "totalMerchants"}
                />
                <StatCard
                  title="Enabled"
                  value={formatNumber(enabled)}
                  subtext={`${apiMetrics.enabled_status_pct || 0}% active`}
                  chartData={seriesData}
                  color="#0ea5e9"
                  variant="simple"
                  onClick={() => setActiveChartKey("enabled")}
                  isSelected={activeChartKey === "enabled"}
                />
                <StatCard
                  title="Disabled"
                  value={formatNumber(disabled)}
                  subtext={`${apiMetrics.disabled_of_total_pct || 0}% inactive`}
                  chartData={seriesData}
                  color="#94a3b8"
                  variant="simple"
                  onClick={() => setActiveChartKey("disabled")}
                  isSelected={activeChartKey === "disabled"}
                />
                <StatCard
                  title="Merchant Health"
                  value={`${healthPercentage}%`}
                  subtext={healthStatus}
                  chartData={seriesData}
                  color="#f43f5e"
                  variant="simple"
                  onClick={() => setActiveChartKey("health")}
                  isSelected={activeChartKey === "health"}
                />
                <StatCard
                  title="Transacting"
                  value={formatNumber(transacting)}
                  subtext={`${apiMetrics.transacting_engagement_pct || 0}% engagement`}
                  chartData={seriesData}
                  color="#3b82f6"
                  variant="simple"
                  onClick={() => setActiveChartKey("transacting")}
                  isSelected={activeChartKey === "transacting"}
                />
                <StatCard
                  title="Non transacting"
                  value={formatNumber(nonTransacting)}
                  subtext="No activity"
                  chartData={seriesData}
                  color="#f59e0b"
                  variant="simple"
                  onClick={() => setActiveChartKey("non-transacting")}
                  isSelected={activeChartKey === "non-transacting"}
                />
                <StatCard
                  title="Recently Onboarded"
                  value={formatNumber(recentlyOnboarded)}
                  subtext="New this period"
                  chartData={seriesData}
                  color="#10b981"
                  variant="simple"
                  onClick={() => setActiveChartKey("recently-onboarded")}
                  isSelected={activeChartKey === "recently-onboarded"}
                />
              </div>

              {activeChartMetric && (
                <div
                  className="bg-white rounded-xl p-6 border border-slate-200 scroll-mt-4"
                  id="merchant-chart-section"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {activeChartMetric.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-slate-900">
                          {activeChartMetric.value}
                        </span>
                        <span className="text-sm font-medium text-slate-500">
                          {activeChartMetric.subtext}
                        </span>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-white rounded-full border border-slate-200 text-xs font-medium text-slate-600 shadow-sm">
                      {getPeriodLabel()}
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={activeChartMetric.data}
                        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#E2E8F0"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fill: "#64748B" }}
                          dy={10}
                          minTickGap={30}
                        />
                        <YAxis hide={true} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            borderRadius: "8px",
                            border: "1px solid #E2E8F0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                          }}
                          itemStyle={{ color: "#1E293B", fontWeight: 600 }}
                          formatter={(
                            value: number | undefined,
                            name: string | undefined,
                          ) => [
                            typeof value === "number"
                              ? formatNumber(value)
                              : value,
                            name || activeChartMetric.title,
                          ]}
                        />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={activeChartMetric.color}
                          strokeWidth={2}
                          dot={{ r: 4, strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </MerchantDetailsDrawer>
    </>
  );
}
