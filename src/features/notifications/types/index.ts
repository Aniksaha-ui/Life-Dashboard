export interface NotificationApiItem {
  id: number;
  user_id: number;
  title: string;
  is_read: number; // 0 or 1
  content: string; // HTML content
  user_role_id: number | null;
  content_type: string;
  created_at: string;
}

export interface NotificationPagination {
  current_page: number;
  per_page: number;
  from: number;
  to: number;
  last_page: number;
  total: number;
}

export interface NotificationListResponse {
  items: NotificationApiItem[];
  pagination: NotificationPagination;
}

export interface NotificationDetails {
  ticketNo?: string;
  date?: string;
  merchantId?: string;
  storeId?: string;
  transactionId?: string;
  bankSslId?: string;
  changedBy?: string;
}

export interface NotificationModel {
  id: number;
  title: string;
  createdAt: string;
  isRead: boolean;
  type: "ticket" | "campaign" | "info";
  content: string;
  details?: NotificationDetails;
}
