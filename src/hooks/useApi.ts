import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiOptions<TVariables> {
  method?: HttpMethod;
  body?: TVariables;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  queryKey?: (string | object | number | null | undefined)[];
}

/**
 * Generic data fetching hook for GET/POST queries
 */
export const useApiData = <TData, TVariables = any>(
  url: string | (() => Promise<TData>),
  options?: ApiOptions<TVariables>,
) => {
  return useQuery({
    queryKey: options?.queryKey || [url],
    queryFn: async () => {
      if (typeof url === "function") {
        return url();
      }
    },
    enabled: options?.enabled ?? true,
    staleTime: options?.staleTime ?? 0,
    gcTime: options?.gcTime ?? 0,
  });
};

/**
 * Generic mutation hook for data changes
 */
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: Error, variables: TVariables) => void;
    showErrorToast?: boolean;
  },
) => {
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      options?.onSuccess?.(data, variables);
    },
    onError: (error: Error, variables) => {
      if (options?.showErrorToast !== false) {
        toast.error(error.message || "An error occurred");
      }
      options?.onError?.(error, variables);
    },
  });
};
