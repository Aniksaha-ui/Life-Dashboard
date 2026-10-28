import { useApiData, useApiMutation } from "../../../hooks/useApi";
import { api } from "../../../lib/api/client";
import type {
  CardBinAndCustomerDetailsResponseData,
  CustomerTrackingResponseData,
  TransactionDetail,
  TransactionDetailApiItem,
  TransactionFilterFieldsResponseData,
  TransactionListParams,
  TransactionListResponse,
  TransactionLogApiItem,
  TransactionOverviewParams,
  TransactionOverviewResponse,
} from "../types";
import { mapApiTransactionDetailToModel } from "../utils/transactionMappers";

const buildQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (
      (key === "status" || key === "card_type" || key === "bank_id_select") &&
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

/**
 * Hook to fetch dynamic transaction filter metadata
 */
export const useTransactionFilterFields = () => {
  return useApiData<TransactionFilterFieldsResponseData | null>(
    () =>
      api.get<TransactionFilterFieldsResponseData>(
        "/filter-fields/transactions",
      ),
    {
      queryKey: ["transactions-filter-fields"],
    },
  );
};

/**
 * Hook to fetch the list of transactions
 */
export const useTransactionList = (
  params: TransactionListParams,
  enabled = true,
) => {
  return useApiData<TransactionListResponse | null>(
    () =>
      api.get<TransactionListResponse>(
        `/transactions?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["transactions-list", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch transaction overview metrics
 */
export const useTransactionOverview = (
  params: TransactionOverviewParams,
  enabled = true,
) => {
  return useApiData<TransactionOverviewResponse | null>(
    () =>
      api.get<TransactionOverviewResponse>(
        `/transactions/overview?${buildQueryString(params)}`,
        undefined,
        { showErrorToast: false },
      ),
    {
      queryKey: ["transactions-overview", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch a single transaction's details
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

/**
 * Hook to fetch diagnostic logs for a transaction
 */
export const useTransactionLog = (tid: number | null) => {
  return useApiData<{ logs: TransactionLogApiItem[] } | null>(
    () => {
      if (!tid) return Promise.resolve(null);
      return api.get<{ logs: TransactionLogApiItem[] }>(
        `/transactions/${tid}/logs`,
      );
    },
    {
      queryKey: ["transaction-logs", tid],
      enabled: !!tid,
      staleTime: 0,
      gcTime: 0,
    },
  );
};

/**
 * Hook to send invoice for a transaction
 */
export const useSendInvoice = () => {
  return useApiMutation<{ message: string }, number>(async (tid: number) => {
    const response = await api.post<{ message: string }>(
      `/transactions/${tid}/invoice-send`,
      {},
      { showErrorToast: false },
    );
    if (!response) throw new Error("Failed to send invoice: No response");
    return response;
  });
};

export const useCustomerTransactionsByTid = (
  tid: number | null,
  page = 1,
  perPage = 10,
) => {
  return useApiData<CustomerTrackingResponseData | null>(
    () => {
      if (!tid) return Promise.resolve(null);
      const params = buildQueryString({ page, per_page: perPage });
      return api.get<CustomerTrackingResponseData>(
        `/transactions/${tid}/cust-details?${params}`,
      );
    },
    {
      queryKey: ["customer-transactions-by-tid", tid, page, perPage],
      enabled: !!tid,
    },
  );
};

export const useCardBinInfo = (
  cardNum: string | null,
  page = 1,
  perPage = 10,
) => {
  return useApiData<CardBinAndCustomerDetailsResponseData | null>(
    () => {
      if (!cardNum) return Promise.resolve(null);
      const params = buildQueryString({ page, per_page: perPage });
      return api.get<CardBinAndCustomerDetailsResponseData>(
        `/transactions/bin-info/${encodeURIComponent(cardNum)}?${params}`,
      );
    },
    {
      queryKey: ["transactions-bin-info", cardNum, page, perPage],
      enabled: !!cardNum,
    },
  );
};
