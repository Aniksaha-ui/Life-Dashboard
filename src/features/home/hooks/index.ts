import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api/client";
import type { MerchantMetricType } from "../types";

export function useHomeStats(
  ownerId?: string,
  period?: string,
  customRange?: { from: string; to: string },
  sector?: string,
) {
  return useQuery({
    queryKey: ["home-stats", ownerId, period, customRange, sector],
    queryFn: () => api.home.getStats(ownerId, period, customRange, sector),
  });
}

export function useTopMerchants(
  metric: MerchantMetricType,
  period: string,
  ownerId?: string,
  customRange?: { from: string; to: string },
  sector?: string,
) {
  return useQuery({
    queryKey: ["top-merchants", metric, period, ownerId, customRange, sector],
    queryFn: () =>
      api.home.getTopMerchants(metric, period, ownerId, customRange, sector),
  });
}

export function useChannelSummary(
  ownerId?: string,
  period?: string,
  customRange?: { from: string; to: string },
  sector?: string,
  activeTab?: "amount" | "count",
) {
  return useQuery({
    queryKey: [
      "channel-summary",
      ownerId,
      period,
      customRange,
      sector,
      activeTab,
    ],
    queryFn: () =>
      api.home.getChannelSummary(
        ownerId,
        period,
        customRange,
        sector,
        activeTab,
      ),
  });
}

export function useActionCenter(ownerId?: string) {
  return useQuery({
    queryKey: ["home-actions", ownerId],
    queryFn: () => api.home.getActions(ownerId),
  });
}
