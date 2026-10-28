import { useApiData } from "../../../../hooks/useApi";
import { api as realApi } from "../../../../lib/api/client";
import type {
  MerchantTicket,
  MerchantTicketApiItem,
  MerchantTicketFilterFieldsResponse,
  MerchantTicketListResponse,
} from "../types";
import { mapApiTicketToRow } from "../utils/merchantTicketMapper";

const buildQueryString = (params: object): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    searchParams.set(key, String(value));
  });
  return searchParams.toString();
};

/**
 * Hook to fetch the filter field configurations
 */
export const useMerchantTicketFilterFields = () => {
  return useApiData<MerchantTicketFilterFieldsResponse | null>(
    () =>
      realApi.get<MerchantTicketFilterFieldsResponse>(
        "/filter-fields/merchant-tickets",
      ),
    {
      queryKey: ["merchant-tickets-filter-fields"],
    },
  );
};

/**
 * Hook to fetch the list of merchant tickets
 */
export const useMerchantTicketList = (
  params: Record<string, any>,
  enabled = true,
) => {
  return useApiData<MerchantTicketListResponse | null>(
    () =>
      realApi.get<MerchantTicketListResponse>(
        `/merchant-tickets?${buildQueryString(params)}`,
      ),
    {
      queryKey: ["merchant-tickets-list", params],
      enabled,
    },
  );
};

/**
 * Hook to fetch a single merchant ticket's details
 */
export const useMerchantTicketDetail = (id: string | null) => {
  return useApiData<MerchantTicket | null>(
    () => {
      if (!id) return Promise.resolve(null);
      return realApi
        .get<MerchantTicketApiItem>(`/merchant-tickets/${id}`)
        .then((data) => (data ? mapApiTicketToRow(data) : null));
    },
    {
      queryKey: ["merchant-ticket-detail", id],
      enabled: !!id,
    },
  );
};
