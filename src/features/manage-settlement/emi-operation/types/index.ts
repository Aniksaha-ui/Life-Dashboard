export interface EMIOperationApiItem {
  emi_id: number;
  tid: number;
  store_sid: number;
  store_id: string;
  store_name: string;
  merchant_id: string;
  merchant_name: string;
  request_on: string;
  emi_ref_id: string;
  emi_issuer: number;
  emi_issuer_bank_name: string;
  emi_month: number;
  emi_month_label: string;
  transaction_id: string;
  mamount: number;
  emi_amount: number;
  request_status: number;
  request_status_label: string;
  confirmed_status: number;
  confirmed_status_label: string;
  approved_status: number;
  bank_status: string;
  bank_status_label: string;
  can_proceed: boolean;
  can_cancel: boolean;
}

export interface EMIOperationDetailsApiItem extends EMIOperationApiItem {
  store_url: string;
  request_remarks: string;
  confirmed_on: string;
  confirmed_by: number;
  confirmed_by_name: string | null;
  confirmed_remarks: string;
  approved_on: string;
  approved_by: number;
  approved_by_name: string | null;
  approved_remarks: string;
  bankssl_id: string;
  sys_email_on: string | null;
  is_sys_email_sent: number;
  merchant_transaction_id: string;
  ssl_transaction_id: string;
  transaction_date: string;
  transaction_bank_name: string;
  transaction_card_type: string;
  transaction_amount: number;
  emi_attachment_doc_path: string;
  emi_attachment_file_type: string;
  emi_attachment_file_of: string;
}

export interface EMIOperationListResponse {
  items: EMIOperationApiItem[];
  pagination: {
    current_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    total: number;
  };
}

export interface EMIOperationOverviewResponse {
  total_requests: number;
  total_declined: number;
  total_approved: number;
  total_emi_amount: number;
}

export interface EMIOperationFilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  default_value?: string | number | null;
}

export interface EMIOperationFilterFieldsResponse {
  module: string;
  date_presets: { key: string; label: string }[];
  fields: EMIOperationFilterField[];
  advanced_filter_names?: string[];
  default_values?: Record<string, any>;
}

export interface EMIOperationListParams {
  date_preset?: string;
  from_date?: string;
  to_date?: string;
  emi_ref_id?: string;
  transaction_id?: string;
  banksslid?: string;
  merchant_id?: string;
  store_id?: string;
  emi_issuer?: string;
  emi_month?: string;
  request_status?: string;
  confirmed_status?: string;
  bank_status?: string;
  page: number;
  per_page: number;
}

export interface EMIFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export interface EMIOverviewProps {
  metrics: EMIOperationOverviewResponse;
}

export interface EMITableProps {
  data: EMIOperationApiItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (nextPage: number) => void;
  onViewDetail: (id: number) => void;
  isLoading: boolean;
  onExportCSV: () => void;
  isExporting?: boolean;
}

export interface EMIDrawerProps {
  emiId: number | null;
  onClose: () => void;
}

export type EMIOperationFiltersProps = EMIFiltersProps;
export type EMIOperationOverviewProps = EMIOverviewProps;
export type EMIOperationTableProps = EMITableProps;
export type EMIOperationDrawerProps = EMIDrawerProps;
