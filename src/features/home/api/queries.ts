import { useApiData } from "../../../hooks/useApi";
import { api } from "../../../lib/api/client";
import type {
  MetricsDetailData,
  SectorListData,
  SummaryData,
  SummaryParams,
} from "../types";

const buildQueryString = (params: SummaryParams): string => {
  const searchParams = new URLSearchParams();

  if (params.date_preset) searchParams.set("date_preset", params.date_preset);

  // Only send from/to date if custom_range is selected
  if (params.date_preset === "custom_range") {
    if (params.from_date) searchParams.set("from_date", params.from_date);
    if (params.to_date) searchParams.set("to_date", params.to_date);
  }

  if (params.sector && params.sector !== "All")
    searchParams.set("sector", params.sector);
  if (params.data_type) searchParams.set("data_type", params.data_type);

  return searchParams.toString();
};

/**
 * Hook to fetch dashboard summary data
 */
export const useSummary = (
  params: SummaryParams,
  options?: { enabled?: boolean },
) => {
  const queryString = buildQueryString(params);
  const url = `/dashboard/summary${queryString ? `?${queryString}` : ""}`;

  return useApiData<SummaryData | null>(() => api.get<SummaryData>(url), {
    queryKey: ["dashboard-summary", params],
    ...options,
  });
};

/**
 * Hook to fetch detailed data for a specific metric
 */
export const useMetricsDetail = (
  metricKey: string | null,
  params: SummaryParams,
  options?: { enabled?: boolean },
) => {
  const queryString = buildQueryString(params);
  const url = `/dashboard/summary/${metricKey}${queryString ? `?${queryString}` : ""}`;

  return useApiData<MetricsDetailData | null>(
    () => (metricKey ? api.get<MetricsDetailData>(url) : Promise.resolve(null)),
    {
      queryKey: ["dashboard-metric-detail", metricKey, params],
      enabled: metricKey ? (options?.enabled ?? true) : false,
      ...options,
    },
  );
};
/**
 * Hook to fetch available sectors
 */
export const useSectors = () => {
  return useApiData<SectorListData | null>(
    () => api.get<SectorListData>("/dashboard/sectors"),
    {
      queryKey: ["dashboard-sectors"],
    },
  );
};
