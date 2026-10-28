import { useApiData, useApiMutation } from "../../../hooks/useApi";
import { api } from "../../../lib/api";
import type { NotificationListResponse } from "../types";

/**
 * Hook to fetch the list of notifications
 */
export const useNotificationList = (page: number = 1) => {
  return useApiData<NotificationListResponse | null>(
    () => api.get<NotificationListResponse>(`/notifications?page=${page}`),
    {
      queryKey: ["notifications-list", page],
    },
  );
};

/**
 * Hook to mark a notification as read (individual or all)
 */
export const useMarkNotificationRead = () => {
  return useApiMutation<any, number | "all">((id: number | "all") =>
    api.patch<any>(`/notifications/${id}/read`, {}),
  );
};
