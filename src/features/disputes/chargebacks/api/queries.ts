import { useApiData } from "../../../../hooks/useApi";
import { api } from "../../../../lib/api/client";
import type {
  ChargebackDetail,
  ChargebackFilterFieldsResponse,
  ChargebackListParams,
  ChargebackListResponse,
  ChargebackOverviewResponse,
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
 * Hook to fetch the filter configurations for chargebacks
 */
export const useChargebackFilterFields = () => {
  return useApiData<ChargebackFilterFieldsResponse | null>(
    () => api.get<ChargebackFilterFieldsResponse>("/filter-fields/chargebacks"),
    {
      queryKey: ["chargebacks-filter-fields"],
    },
  );
};

/**
 * Hook to fetch the list of chargebacks
 */
export const useChargebackList = (params: ChargebackListParams) => {
  return useApiData<ChargebackListResponse | null>(
    () =>
      api.get<ChargebackListResponse>(
        `/chargebacks?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["chargebacks-list", params],
    },
  );
};

/**
 * Hook to fetch the overview metrics for chargebacks
 */
export const useChargebackOverview = (params: {
  from_date?: string;
  to_date?: string;
  date_preset?: string;
}) => {
  return useApiData<ChargebackOverviewResponse | null>(
    () =>
      api.get<ChargebackOverviewResponse>(
        `/chargebacks/overview?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["chargebacks-overview", params],
    },
  );
};

/**
 * Hook to fetch details for a specific chargeback
 */
export const useChargebackDetail = (id: number | null) => {
  return useApiData<ChargebackDetail | null>(
    () => {
      if (id === null) return Promise.resolve(null);
      return api.get<ChargebackDetail>(`/chargebacks/${id}`);
    },
    {
      queryKey: ["chargeback-detail", id],
      enabled: id !== null,
    },
  );
};
