export interface MerchantTicketApiItem {
  id: number;
  ticket_no: string;
  title: string;
  description: string;
  attachment: string;
  attachment_url: string | null;
  issue_type: string;
  issue_type_label: string;
  merchant_id: number;
  merchant_mid: number;
  merchant_msslid: string;
  merchant_company_name: string;
  merchant_contact_mobile: string;
  created_by: number;
  created_by_full_name: string;
  created_by_email: string;
  created_by_mobile: string;
  kam_full_name: string;
  kam_email: string;
  resolved_by: number;
  resolved_by_full_name: string;
  resolved_by_email: string | null;
  resolved_by_mobile: string | null;
  remarks: string | null;
  status: number;
  status_label: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface MerchantTicketListResponse {
  items: MerchantTicketApiItem[];
  pagination: {
    current_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    total: number;
  };
}

export interface MerchantTicketFilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  default_value?: string | number | null;
}

export interface MerchantTicketFilterFieldsResponse {
  module: string;
  fields: MerchantTicketFilterField[];
  advanced_filter_names?: string[];
  default_values?: Record<string, string>;
}

export interface MerchantTicketListParams {
  date_preset?: string;
  from_date?: string;
  to_date?: string;
  ticket_no?: string;
  status?: string;
  issue_type?: string;
  merchant_id?: string;
  page: number;
  per_page: number;
}

export interface MerchantTicketFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export interface MerchantTicketTableProps {
  data: MerchantTicket[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (nextPage: number) => void;
  onViewDetails: (id: string) => void;
  onPreviewImage: (url: string) => void;
  isLoading: boolean;
}

export interface MerchantTicketDrawerProps {
  ticketId: string | null;
  onClose: () => void;
  onPreviewImage: (url: string) => void;
}

export interface MerchantTicket {
  id: string;
  ticketNo: string;
  title: string;
  issueType: string;
  merchantName: string;
  hasAttachment: boolean;
  attachmentUrl?: string;
  status: "Pending" | "Processing" | "Completed" | "Declined";
  createdAt: string;
  resolvedAt?: string;
  createdBy: string;
  resolvedBy?: string;
  remarks?: string;
  description: string;
  merchant_msslid: string;
}
