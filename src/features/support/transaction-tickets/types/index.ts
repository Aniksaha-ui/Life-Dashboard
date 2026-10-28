export interface TransactionTicketApiItem {
  id: number;
  ticket_no: string;
  requested_on: string;
  msslid: string | null;
  merchant_name: string;
  store_id: string;
  store_name: string;
  tid: number;
  transaction_id: string;
  banksslid: string;
  status: string;
  status_code: number;
  query_for: string[];
  ticketing_query_raw: string;
  created_by: number;
  created_by_name: string | null;
}

export interface MerchantTicketDetail {
  id: number;
  ticket_no: string;
  requested_on: string;
  msslid: string | null;
  merchant_id: string;
  merchant_name: string;
  store_id: string;
  store_name: string;
  tid: number;
  transaction_id: string;
  banksslid: string;
  status: string;
  status_code: number;
  query_for: string[];
  ticketing_query_raw: string | any;
  created_by: number;
  created_by_name: string;
  created_by_account: string | null;
  created_by_email: string | null;
  created_by_mobile: string | null;
  created_by_role: string | null;
  ticketing_remarks: string | null;
  feedback_given_by: number;
  feedback_given_by_name: string | null;
  feedback_given_on: string | null;
  feedback_remarks: string | null;
  mtxnid: string;
  mamount: number;
  notice: string;
  incommingtime: string;
  sslid: string;
  transaction_strid: string;
  transaction_banksslid: string;
  requested_parameter: string;
  created_by_full_name: string;
}

export interface TransactionTicketListResponse {
  items: TransactionTicketApiItem[];
  pagination: {
    current_page: number;
    per_page: number;
    from: number;
    to: number;
    last_page: number;
    total: number;
  };
}

export interface TransactionTicketOverviewResponse {
  total_tickets: number;
  pending_tickets: number;
  solved_tickets: number;
}

export interface TransactionTicketFilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date-range";
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  default_value?: string | number;
}

export interface TransactionTicketFilterFieldsResponse {
  module: string;
  date_presets?: { key: string; label: string }[];
  date_range?: {
    from_key: string;
    to_key: string;
    format: string;
    all_time_behavior: string;
  };
  fields: TransactionTicketFilterField[];
  advanced_filter_names: string[];
  default_values?: Record<string, string>;
}

export interface TransactionTicketListParams {
  from_date?: string;
  to_date?: string;
  date_preset?: string;
  page: number;
  per_page: number;
  status?: string;
  transaction_id?: string;
  merchant_id?: string;
  store_id?: string;
  ticket_no?: string;
  [key: string]: any; // Allow for dynamic filter keys
}

export interface TransactionTicketFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export interface TransactionTicketTableProps {
  data: TransactionTicketApiItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onViewSupportDetails: (id: string) => void;
  onViewTransactionDetails: (id: number) => void;
  isLoading: boolean;
  onExportCSV: () => void;
  isExporting?: boolean;
}

export interface TransactionTicketDrawerProps {
  ticketId: string | null;
  onClose: () => void;
}

export interface MetricData {
  total: number;
  pending: number;
  solved: number;
}
