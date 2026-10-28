export interface ChargebackApiItem {
  chargeback_id: number;
  sid: number;
  tid: number;
  store_id: string;
  msslid: string;
  merchant_id: string;
  merchant_name: string;
  store_name: string;
  store_url: string;
  store_landing_url: string;
  merchant_transaction_id: string;
  transaction_id: string;
  chargeback_reference_id: string;
  merchant_reference_id: string;
  chargeback_amount: number;
  settled_amount: number;
  request_remarks: string;
  request_status: number;
  request_status_label: string;
  approved_status: number;
  approved_status_label: string;
  confirmed_status: number;
  confirmed_status_label: string;
  request_on: string;
  confirmed_on: string;
  approved_on: string;
  card_no: string;
  card_type: string;
  mtxnid: string;
  mamount: number;
  incommingtime: string;
  bid: number;
  stage_label: string;
}

export interface ChargebackListResponse {
  items: ChargebackApiItem[];
  pagination: {
    current_page: number;
    per_page: number;
    from: number;
    to: number;
    last_page: number;
    total: number;
  };
}

export interface ChargebackOverviewResponse {
  total_rows: number;
  total_success_amount: number;
  total_success_transaction: number;
  total_processing: number;
  total_requests: number;
  pending_requests: number;
  successful_chargeback: number;
  chargeback_amount: number;
}

export interface ChargebackDetail extends ChargebackApiItem {
  confirmed_remarks: string;
  approved_remarks: string;
  request_by: number;
  request_by_name: string;
  confirmed_by: number;
  confirmed_by_name: string | null;
  approved_by: number;
  approved_by_name: string | null;
  strid: string;
  bank_name: string;

  // CamelCase fields for the UI
  chargebackRefId?: string;
  banksslid?: string;
  escrowEnabled?: boolean;
  reason?: string;
  requestStatus?: string;
  merchantRefCode?: string;
  merchantName?: string;
  storeName?: string;
  storeId?: string;
  homePageOfStore?: string;
  transactionId?: string;
  transactionDate?: string;
  transactionAmount?: number;
  settledAmount?: number;
  stage?: string;
  amount?: number;
  bankName?: string;
  bank?: string;
  requestedRemarks?: string;
  requestedOn?: string;
  requestedBy?: string;
  autoRefundStatus?: string;
  autoRefundRemarks?: string;
  autoRefundAttempts?: number;
  approvalRemarks?: string;
  approvalOn?: string;
  approvalBy?: string;
  approvalStatus?: string;
  confirmationRemarks?: string;
  confirmationOn?: string;
  confirmationBy?: string;
  finalConfirmation?: string;
}

export interface ChargebackFilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date-range";
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  default_value?: string | number;
}

export interface ChargebackFilterFieldsResponse {
  module: string;
  date_presets?: { key: string; label: string }[];
  date_range?: {
    from_key: string;
    to_key: string;
    format: string;
    all_time_behavior: string;
  };
  fields: ChargebackFilterField[];
  advanced_filter_names: string[];
  default_values?: Record<string, string>;
}

export interface ChargebackListParams {
  from_date?: string;
  to_date?: string;
  date_preset?: string;
  page: number;
  per_page: number;
  [key: string]: any;
}

export interface ChargebackOverviewProps {
  metrics: ChargebackOverviewResponse;
}

export interface ChargebackFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export interface ChargebackTableProps {
  data: ChargebackApiItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onViewDetails: (id: number) => void;
  isLoading: boolean;
  onExportCSV: () => void;
  isExporting?: boolean;
}

export interface ChargebackDrawerProps {
  chargebackId: number | null;
  onClose: () => void;
}
