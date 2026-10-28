export interface RefundOverviewProps {
  metrics: {
    total: number;
    pending: number;
    successful: number;
    amount: number;
  };
}

export interface RefundFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export interface RefundTableProps {
  data: RefundRow[];
  onViewDetails: (id: string) => void;
  isLoading: boolean;
  onExportCSV: () => void;
  isExporting?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (nextPage: number) => void;
}

export interface RefundDrawerProps {
  refundId: string | null;
  onClose: () => void;
}

export interface RefundFilterOption {
  value: string;
  label: string;
}

export interface RefundFilterField {
  key: string;
  label: string;
  type: "select" | "text" | "number";
  placeholder?: string;
  options?: RefundFilterOption[];
  required?: boolean;
  default_value?: string | number | null;
}

export interface RefundFilterFieldsResponseData {
  module: string;
  fields: RefundFilterField[];
  advanced_filter_names?: string[];
}

export interface RefundListParams {
  date_preset?: string;
  from_date?: string;
  to_date?: string;
  merchant_transaction_id?: string;
  merchant_id?: string;
  store_id?: string;
  refund_reference_id?: string;
  merchant_reference_id?: string;
  refund_request_status?: string;
  refund_approval_status?: string;
  card_no?: string;
  page: number;
  per_page: number;
}

export type RefundOverviewParams = Omit<RefundListParams, "page" | "per_page">;

export interface RefundOverviewResponse {
  total_requests: number;
  total_request_amount: number;
  total_refund_amount: number;
  total_success_refunds: number;
  total_cancel_refunds: number;
  total_pending_requests: number;
  pending_requests: number;
  successful_refunds: number;
  refunded_amount: number;
}

export interface RefundApiItem {
  refund_id: number;
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
  refund_reference_id: string;
  merchant_reference_id: string;
  refund_amount: number | string;
  settled_amount: number | string;
  request_remarks: string;
  has_emi: number;
  settlement_status: string;
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
  mamount: number | string;
  incommingtime: string;
  bid: number;
}

export interface RefundDetailApiItem extends RefundApiItem {
  request_by: number;
  request_by_name: string | null;
  confirmed_by: number;
  confirmed_by_name: string | null;
  confirmed_remarks: string;
  approved_by: number;
  approved_by_name: string | null;
  approved_remarks: string;
  strid: string;
  bank_name: string | null;
  bankssl_id: string | null;
  auto_refund_status: string | null;
  auto_refund_attempts: number | null;
  auto_refund_remarks: string | null;
}

export interface RefundListResponse {
  items: RefundApiItem[];
  pagination: {
    current_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    total: number;
  };
  links: {
    first: string | null;
    prev: string | null;
    next: string | null;
    last: string | null;
  };
}

export interface RefundRow {
  id: string;
  refundId: number;
  requestedOn: string;
  refundRefId: string;
  transactionId: string;
  transactionDate?: string;
  transactionAmount?: number;
  merchantId: string;
  merchantName: string;
  storeId: string;
  storeName: string;
  homePageOfStore?: string;
  bankName?: string;
  escrowEnabled: boolean;
  amount: number;
  settledAmount?: number;
  requestStatus: string;
  approvalStatus: string;
  finalStatus: string;
  settledStatus: string;
  merchantRefCode?: string;
  bankSslId?: string;
  bank?: string;
  requestedBy?: string;
  merchantsRemarks?: string;
  autoRefundStatus?: string;
  autoRefundRemarks?: string;
  autoRefundAttempts?: number;
  approvalRemarks?: string;
  approvalOn?: string;
  approvalBy?: string;
  confirmationRemarks?: string;
  confirmationOn?: string;
  confirmationBy?: string;
  finalConfirmation?: string;
}
