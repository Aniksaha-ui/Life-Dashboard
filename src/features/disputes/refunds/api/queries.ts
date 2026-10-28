import { useApiData } from "../../../../hooks/useApi";
import { api } from "../../../../lib/api/client";
import type {
  RefundDetailApiItem,
  RefundFilterFieldsResponseData,
  RefundListParams,
  RefundListResponse,
  RefundOverviewParams,
  RefundOverviewResponse,
  RefundRow,
} from "../types";
import { mapApiRefundDetailToRow } from "../utils/refundMappers";

const buildQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (
      (key === "refund_request_status" || key === "refund_approval_status") &&
      value === ""
    ) {
      searchParams.set(key, "");
      return;
    }
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

export const useRefundFilterFields = () => {
  return useApiData<RefundFilterFieldsResponseData | null>(
    () => api.get<RefundFilterFieldsResponseData>("/filter-fields/refunds"),
    {
      queryKey: ["refunds-filter-fields"],
    },
  );
};

export const useRefundList = (params: RefundListParams, enabled = true) => {
  return useApiData<RefundListResponse | null>(
    () =>
      api.get<RefundListResponse>(
        `/refunds?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["refunds-list", params],
      enabled,
    },
  );
};

export const useRefundOverview = (
  params: RefundOverviewParams,
  enabled = true,
) => {
  return useApiData<RefundOverviewResponse | null>(
    () =>
      api.get<RefundOverviewResponse>(
        `/refunds/overview?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["refunds-overview", params],
      enabled,
    },
  );
};

export const useRefundDetail = (id: string | null) => {
  return useApiData<RefundRow | null>(
    () => {
      if (!id) return Promise.resolve(null);
      return api
        .get<RefundDetailApiItem>(`/refunds/${id}`)
        .then((data) => (data ? mapApiRefundDetailToRow(data) : null));
    },
    {
      queryKey: ["refund-detail", id],
      enabled: !!id,
    },
  );
};
