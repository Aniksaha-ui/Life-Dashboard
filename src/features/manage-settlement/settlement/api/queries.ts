import { useApiData, useApiMutation } from "../../../../hooks/useApi";
import { api } from "../../../../lib/api/client";
import type {
  SettlementDetail,
  SettlementListResponse,
  SettlementOverviewData,
} from "../types";

const buildQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

/**
 * Hook to fetch the list of settlements
 */
export const useSettlementList = (
  params: Record<string, any>,
  enabled = true,
) => {
  return useApiData<SettlementListResponse | null>(
    () =>
      api.get<SettlementListResponse>(
        `/settlements?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["settlements", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch settlement overview metrics
 */
export const useSettlementOverview = (
  params: Record<string, any>,
  enabled = true,
) => {
  return useApiData<SettlementOverviewData | null>(
    () =>
      api.get<SettlementOverviewData>(
        `/settlements/overview?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["settlements-overview", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch settlement details
 */
export const useSettlementDetails = (transactionId: string | null) => {
  return useApiData<SettlementDetail | null>(
    () => {
      if (!transactionId) return Promise.resolve(null);
      return api.get<SettlementDetail>(`/settlements/${transactionId}`);
    },
    {
      queryKey: ["settlement-details", transactionId],
      enabled: !!transactionId,
    },
  );
};

/**
 * Hook to fetch settlement filter fields
 */
export const useSettlementFilterFields = () => {
  return useApiData<any>(() => api.get<any>("/filter-fields/settlements"), {
    queryKey: ["settlement-filter-fields"],
  });
};

/**
 * Hook to resend settlement email
 */
export const useResendSettlementEmail = () => {
  return useApiMutation<any, string>((transactionId: string) =>
    api.post<any>(`/settlements/${transactionId}/resend-email`),
  );
};
