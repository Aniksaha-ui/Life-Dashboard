import { useApiData } from "../../../../hooks/useApi";
import { api } from "../../../../lib/api/client";
import type {
  MerchantTicketDetail,
  TransactionTicketFilterFieldsResponse,
  TransactionTicketListParams,
  TransactionTicketListResponse,
  TransactionTicketOverviewResponse,
} from "../types";
import type {
  TransactionDetail,
  TransactionDetailApiItem,
} from "../types/transaction";
import { mapApiTransactionDetailToModel } from "../utils/transactionMapper";

/**
 * Hook to fetch the filter configurations for transaction tickets
 */
export const useTransactionTicketFilterFields = () => {
  return useApiData<TransactionTicketFilterFieldsResponse | null>(
    () =>
      api.get<TransactionTicketFilterFieldsResponse>(
        "/filter-fields/transaction-tickets",
      ),
    {
      queryKey: ["transaction-tickets-filter-fields"],
    },
  );
};

const buildQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

/**
 * Hook to fetch the list of transaction tickets
 */
export const useTransactionTicketList = (
  params: TransactionTicketListParams,
  enabled = true,
) => {
  return useApiData<TransactionTicketListResponse | null>(
    () =>
      api.get<TransactionTicketListResponse>(
        `/transaction-tickets?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["transaction-tickets-list", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch the overview metrics for transaction tickets
 */
export const useTransactionTicketOverview = (
  params: { from_date: string; to_date: string; date_preset?: string },
  enabled = true,
) => {
  return useApiData<TransactionTicketOverviewResponse | null>(
    () =>
      api.get<TransactionTicketOverviewResponse>(
        `/transaction-tickets/overview?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["transaction-tickets-overview", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch details for a specific merchant ticket
 */
export const useMerchantTicketDetail = (id: number | null) => {
  return useApiData<MerchantTicketDetail | null>(
    () => {
      if (!id) return Promise.resolve(null);
      return api.get<MerchantTicketDetail>(`/transaction-tickets/${id}`);
    },
    {
      queryKey: ["merchant-ticket-detail", id],
      enabled: !!id,
    },
  );
};

/**
 * Hook to fetch a single transaction's details (local version)
 */
export const useTransactionDetail = (id: number | null) => {
  return useApiData<TransactionDetail | null>(
    () => {
      if (!id) return Promise.resolve(null);
      return api
        .get<TransactionDetailApiItem>(`/transactions/${id}`)
        .then((data) => (data ? mapApiTransactionDetailToModel(data) : null));
    },
    {
      queryKey: ["transaction-detail", id],
      enabled: !!id,
    },
  );
};
