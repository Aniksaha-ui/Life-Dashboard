import { useEffect, useState } from "react";
import { useAuthStore } from "../../../stores/authStore";
import { useSectors, useSummary } from "../api/queries";
import type { SummaryData, SummaryParams } from "../types";
import { useDashboardFilters } from "../../../hooks/useDashboardFilters";

export function useHome() {
  const filters = useDashboardFilters("this_month");
  const user = useAuthStore((state) => state.user);

  // Only update the parameters sent to the API when we have a valid configuration
  // This ensures we don't trigger a new query key with partial dates
  const [stableQueryParams, setStableQueryParams] = useState<SummaryParams>(
    filters.queryParams as SummaryParams,
  );

  useEffect(() => {
    const isValid =
      filters.selectedPeriod !== "custom" ||
      (Boolean(filters.customDateRange.from) &&
        Boolean(filters.customDateRange.to));
    if (isValid) {
      setStableQueryParams(filters.queryParams as SummaryParams);
    }
  }, [filters.queryParams, filters.selectedPeriod, filters.customDateRange]);

  const summaryQuery = useSummary(stableQueryParams);
  const sectorsQuery = useSectors();

  // Default empty stats to show when API fails (e.g. 422 date validation error)
  const emptyStats: Partial<SummaryData> = {
    cards: {
      total_txn_volume: {
        title: "Total Transaction Volume",
        value: 0,
        trend_pct: 0,
      },
      total_txn_count: {
        title: "Total Transaction Count",
        value: 0,
        trend_pct: 0,
      },
      ssl_income: { title: "SSL Income", value: 0, trend_pct: 0 },
      emi_income: { title: "EMI Income", value: 0, trend_pct: 0 },
      txn_success_rate: { title: "TXN Success Rate", value: 0, trend_pct: 0 },
      txn_failed_count: { title: "TXN Failed Count", value: 0, trend_pct: 0 },
      failed_merchant_count: {
        title: "Failed Merchant Count",
        value: 0,
        trend_pct: 0,
      },
      chargeback_amount: { title: "Chargeback Amount", value: 0, trend_pct: 0 },
      escrow_hold: { title: "Escrow Hold", value: 0, trend_pct: 0 },
    },
    merchant_overview: {
      transacting: 0,
      non_transacting: 0,
      recently_onboarded: 0,
    },
    top_merchants: { txn_amount: [], txn_count: [], revenue: [] },
    channel_wise_summary: { txn_amount: [], txn_count: [] },
    total_tickets: { total: 0, open: 0 },
    settlements_bounce: { count: 0, bounce_amount: 0 },
    alerts: { visible_count: 0, total_items: 0, items: [] },
    meta: {
      from: "",
      to: "",
      kam_user_id: null,
      sector: null,
      prev_from: "",
      prev_to: "",
      period_label: "Selected Period",
    },
  };

  const availableSectors = sectorsQuery.data?.sectors || [];

  // If there is an error, we show 0 values and stop loading
  const hasError = !!summaryQuery.error;
  const statsData =
    summaryQuery.data || (hasError ? (emptyStats as SummaryData) : undefined);
  const isStatsLoading =
    (summaryQuery.isLoading || summaryQuery.isFetching) && !hasError;

  return {
    user,
    ...filters,
    stats: statsData,
    params: stableQueryParams,
    isLoading: isStatsLoading,
    error: summaryQuery.error,
    availableSectors,
  };
}
