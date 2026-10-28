import { useQuery } from "@tanstack/react-query";
import { api } from "../../../../lib/api/client";
import type {
  EMIOperationDetailsApiItem,
  EMIOperationFilterFieldsResponse,
  EMIOperationListParams,
  EMIOperationListResponse,
  EMIOperationOverviewResponse,
} from "../types";

/**
 * Hook to fetch EMI operation filter fields
 */
export const useEMIOperationFilterFields = () => {
  return useQuery({
    queryKey: ["emi-operations", "filters"],
    queryFn: () =>
      api.get<EMIOperationFilterFieldsResponse>(
        "/filter-fields/emi-operations",
      ),
  });
};

/**
 * Hook to fetch EMI operation list
 */
export const useEMIOperationList = (params: EMIOperationListParams) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["emi-operations", "list", params],
    queryFn: () =>
      api.get<EMIOperationListResponse>(
        `/emi-operations?${queryParams.toString()}`,
        undefined,
        { showErrorToast: false },
      ),
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch EMI operation overview metrics
 */
export const useEMIOperationOverview = (
  params: Partial<EMIOperationListParams>,
) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (
      key !== "page" &&
      key !== "per_page" &&
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      queryParams.append(key, String(value));
    }
  });

  return useQuery({
    queryKey: ["emi-operations", "overview", params],
    queryFn: () =>
      api.get<EMIOperationOverviewResponse>(
        `/emi-operations/overview?${queryParams.toString()}`,
        undefined,
        { showErrorToast: false },
      ),
  });
};

/**
 * Hook to fetch EMI operation details
 */
export const useEMIOperationDetails = (emiId: number | null) => {
  return useQuery({
    queryKey: ["emi-operations", "details", emiId],
    queryFn: () =>
      api.get<EMIOperationDetailsApiItem>(`/emi-operations/${emiId}`),
    enabled: !!emiId,
  });
};
