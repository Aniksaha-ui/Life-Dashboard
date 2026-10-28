export interface SettlementListItem {
  source_module: string;
  source_pk: number;
  settlement_date: string;
  transaction_id: string;
  merchant_name: string;
  merchant_code: string;
  store_name: string;
  store_id: string;
  payee_name: string;
  bank_name: string;
  branch_name: string;
  account_no: string;
  routing_no: string;
  bank_information: string;
  settlement_type: string;
  opening_amt: number;
  payable_amt: number;
  settle_amt: number;
  paid_amt: number;
  fwd_amt: number;
  status: string;
  action: {
    details_enabled: boolean;
  };
}

export interface SettlementOverviewData {
  bounce_count: number;
  bounce_amount: number;
}

export interface SettlementDetail {
  source_module: string;
  source_pk: number;
  transaction_id: string;
  batch_no: number;
  reference_no: string;
  status: {
    label: string;
  };
  actions: {
    resend_email: {
      enabled: boolean;
      implemented: boolean;
    };
  };
  transaction_summary: Array<{
    type: string;
    no_of_trans: number;
    ssl_amt: number;
    bank_amt: number;
    store_amt: number;
    deduct_amt: number;
  }>;
  payment_information: Array<{
    cheque_sl: number;
    cheque_ref: string;
    acct_payee: string;
    amount: number;
    bank: string;
    attachment: string | null;
  }>;
  general_information: {
    settlement_date: string;
    transaction_id: string;
    reference_no: string;
    merchant_name: string;
    store_name: string;
    settlement_type: string;
    total_amount: number;
    payee_name: string;
    bank_name: string;
    branch_name: string;
    account_no: number;
    routing_no: string;
  };
  amount_stacking: {
    opening_amt: number;
    payable_amt: number;
    settle_amt: number;
    paid_amt: number;
    fwd_amt: number;
  };
}

export interface SettlementListResponse {
  items: SettlementListItem[];
  pagination: {
    current_page: number;
    per_page: number;
    from: number;
    to: number;
    last_page: number;
    total: number;
  };
}

export interface SettlementOverviewProps {
  metrics: {
    bounceCount: number;
    bounceAmount: number;
  };
  onFilterChange: (filters: Record<string, any>) => void;
}

export interface SettlementFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
}

export interface SettlementTableProps {
  data: SettlementListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    from?: number;
    to?: number;
  };
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onViewDetail: (id: string) => void;
  onExportOnline: () => void;
  onExportPhysical: () => void;
}

export interface SettlementDrawerProps {
  transactionId: string | null;
  onClose: () => void;
}

export interface SettlementFilterField {
  key: string;
  label: string;
  type: "text" | "select" | "date-range";
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  default_value?: string | number;
}

export interface SettlementFilterFieldsResponse {
  module: string;
  date_presets?: { key: string; label: string }[];
  date_range?: {
    from_key: string;
    to_key: string;
    format: string;
    all_time_behavior: string;
  };
  fields: SettlementFilterField[];
  advanced_filter_names: string[];
  default_values?: Record<string, string>;
}

export interface useSettlementsReturn {
  settlements: SettlementListItem[];
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
    from?: number;
    to?: number;
  };
  metrics: {
    bounceCount: number;
    bounceAmount: number;
  };
  filters: Record<string, any>;
  isLoading: boolean;
  handleFilterChange: (filters: Record<string, any>) => void;
  handleClearFilters: () => void;
  handlePageChange: (page: number) => void;
  handleExportOnline: () => void;
  handleExportPhysical: () => void;
  isExporting: boolean;
}
