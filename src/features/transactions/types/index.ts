export interface TransactionOverviewProps {
  metrics: {
    total: number;
    totalAmount: number;
    successCount: number;
    failedCount: number;
  };
  onFilterChange: (filters: Record<string, any>) => void;
}

export interface TransactionFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  onClearFilters: () => void;
  /** Hidden from primary and advanced filter rows (e.g. merchant_id on profile page). */
  excludeFilterKeys?: string[];
}

export interface TransactionTableProps {
  data: TransactionRow[];
  isLoading?: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    total: number;
  };
  onPageChange: (nextPage: number) => void;
  onViewDetail: (id: number) => void;
  onViewCustomer: (tid: number) => void;
  onViewCard: (maskedCard: string) => void;
  onViewLogs: (tid: number, txnId: string, ip: string) => void;
  onExportCSV: () => void;
  isExporting?: boolean;
}

export interface ColumnHandlers {
  onViewDetail: (id: number) => void;
  onViewCustomer: (tid: number) => void;
  onViewCard: (maskedCard: string) => void;
  onViewLogs: (tid: number, txnId: string, ip: string) => void;
}

export interface TransactionDetailDrawerProps {
  transactionId: number | null;
  onClose: () => void;
  onShowLogs: (tid: number, txnId: string, ip: string) => void;
  onShowCard: (maskedCard: string) => void;
}

export interface TransactionDetail {
  tid: number;
  date: string;
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMedia: string;
  bankGateway: string;
  cardType: string;
  schemeSelected: string;
  sslId: string;
  sessionId: string;
  bankId: string;
  bankApprovalId: string;
  bankReceiptNo: string;
  referenceNo: string;
  cid?: string;
  userId?: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    cardHolder: string;
    maskedCard: string;
    issuedBank: string;
    ip: string;
    walletNo?: string;
  };
  amounts: {
    transaction: number;
    ssl: number;
    bank: number;
    store: number;
    reseller: number;
    merchant: number;
    susamount: number;
    merchantCurrency: string;
    merchantCurrencyRate: number;
    discountPct: number;
    discountAmt: number;
    discountRemarks?: string;
  };
  flow: {
    errorDescription?: string;
    apiValidated: boolean;
    gatewayVersion: string;
    validationStatus: string;
    isRisk: boolean;
    riskyReason?: string;
    directedToBank?: string;
    returnedFromBank?: string;
    bankApprovalId: string;
    bankReceiptNo: string;
  };
  risk: {
    validationStatus: string;
    apiValidated: boolean;
    isRisk: boolean;
    reason?: string;
    directedToBank?: string;
    returnedFromBank?: string;
  };
  agent: {
    platform: string;
    os: string;
    device: string;
    version: string;
    name: string;
    fullString: string;
  };
  cart: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  lifecycle: {
    settled: boolean;
    refundRequested: boolean;
    chargebackRequested: boolean;
    availOffer: boolean;
    settlementStatus: string;
  };
  moto: {
    status: string;
    mobile: string;
    maskedCard: string;
    request: string;
    store: string;
    desc: string;
    trxStatus: string;
  };
  requestParams: Record<string, any>;
  bankResponse: {
    raw: string;
    params: Record<string, any>;
  };
  merchantRequestInfo: {
    ip: string;
    metadata?: Record<string, any>;
  };
  emi: {
    statusText: string;
  };
}

export interface CustomerTransaction {
  id: string;
  date: string;
  customerId: string;
  store: {
    name: string;
    email: string;
    phone: string;
    id: string;
  };
  gateway: {
    bank: string;
    transactionId: string;
  };
  cardInfo: {
    number: string;
    brand: string;
    bank: string;
    country: string;
    type: string;
    holderName?: string;
  };
  ip: string;
  amount: number;
  status: string;
  statusMessage?: string;
}

export interface CustomerDetailsResponseData {
  card_no: string;
  customer: CustomerInfo;
  transactions: CustomerTransactionFromApi[];
  total_transactions: number;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  ip_city: string;
  ip_country: string;
}

export interface CustomerTransactionFromApi {
  serial: number;
  tid: number;
  transaction_id: string;
  mtxnid: string;
  incommingtime: string;
  date: string;
  time: string;
  store_id: string;
  gateway_name: string;
  gateway_id: number | null;
  banksslid: string;
  cardholder_name: string;
  ip: string;
  ip_city: string;
  ip_country: string;
  amount: number;
  status: string;
  status_badges: string[];
  status_display: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CustomerTransactionsDrawerProps {
  tid: number | null;
  onClose: () => void;
}

export interface CustomerTrackingResponseData {
  tid: number;
  track_cust_id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  transactions: CustomerTrackingTransactionFromApi[];
  total_transactions: number;
  pagination?: {
    current_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    total: number;
  };
  links?: {
    first: string | null;
    prev: string | null;
    next: string | null;
    last: string | null;
  };
}

export interface CustomerTrackingTransactionFromApi {
  serial: number;
  tid: number;
  track_cust_id: string;
  date: string;
  time: string;
  incommingtime: string;
  store_id: string;
  gateway_name: string;
  banksslid: string;
  card_no: string;
  cardholder_name: string;
  issuer_bank: string | null;
  issuer_country: string | null;
  issuer_country_code: string | null;
  issuer_card_brand: string | null;
  issuer_card_bin_type: string | null;
  amount: number;
  status: string;
  status_badges: string[];
  status_display: string;
  ip: string;
  ip_city: string;
  ip_country: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
}

export interface CardBinInfoResponseData {
  id: number;
  bin: string;
  brand: string;
  sub_brand: string;
  country_code: string;
  country_name: string;
  bank: string;
  bank_id: string;
  card_type: string;
  card_category: string;
  source_by: string;
  time_taken: number;
  created_on: string;
  updated_on: string;
  is_block_transaction: number;
  status: string;
}

export interface CardBinAndCustomerDetailsResponseData {
  card_no: string;
  bin_info: CardBinInfoResponseData | null;
  customer_details: CustomerDetailsResponseData | null;
  pagination?: {
    current_page: number;
    per_page: number;
    from: number | null;
    to: number | null;
    last_page: number;
    total: number;
  };
  links?: {
    first: string | null;
    prev: string | null;
    next: string | null;
    last: string | null;
  };
}

export interface FileLogsDrawerProps {
  tid: number | null;
  txnId: string | null;
  ip: string | null;
  onClose: () => void;
}

export interface TransactionLogApiItem {
  logs_on: string;
  tid: number;
  stage: string;
  ip: string;
  descriptions: string;
}

export interface TransactionLogResponse {
  logs: TransactionLogApiItem[];
}

export interface CardDetailsDrawerProps {
  maskedCard: string | null;
  onClose: () => void;
  onShowLogs: (tid: number, txnId: string, ip: string) => void;
}

export interface TransactionFilterOption {
  value: string | number;
  label: string;
}

export interface TransactionFilterField {
  key: string;
  label: string;
  type: "select" | "text" | "ip" | "number";
  placeholder?: string;
  options?: TransactionFilterOption[];
  default_value?: string | number | null;
  required?: boolean;
}

export interface TransactionFilterFieldsResponseData {
  module: string;
  fields: TransactionFilterField[];
  advanced_filter_names?: string[];
}

export interface TransactionListParams {
  date_preset?: string;
  from_date?: string;
  to_date?: string;
  transaction_id?: string;
  merchant_id?: string;
  store_id?: string;
  ip_address?: string;
  gate_id?: string;
  payment_type?: string;
  status?: string;
  issuer_location?: "local" | "foreign";
  bank_name?: string;
  banksslid?: string;
  bank_id_select?: string;
  card_type?: string;
  last_4_digit_of_card?: string;
  bank_id?: string;
  card_holder_given_name?: string;
  emi_status?: "all" | "0" | "1";
  page: number;
  per_page: number;
}

export type TransactionOverviewParams = Omit<
  TransactionListParams,
  "page" | "per_page"
>;

export interface TransactionOverviewResponse {
  total_transactions: number;
  success_transactions: number;
  failed_transactions: number;
  total_amount: number;
}

export interface TransactionApiItem {
  strid: string | null;
  tid: number | null;
  sslid: string | null;
  msslid: string | null;
  merchant_name: string | null;
  store_name: string | null;
  transaction_id: string;
  mtxnid: string | null;
  download_invoice_url?: string | null;
  mamount: number | string | null;
  incommingtime: string | null;
  bid: number | null;
  banksslid: string | null;
  bankgoingtime: string | null;
  rsid: string | null;
  bankretime: string | null;
  notice: string | null;
  notice_label: string | null;
  status: string;
  scredit_card_num: string | null;
  visitor_ip: string | null;
  cardtype: string | null;
  card_type: string | null;
  cardholdername: string | null;
  charge_amount: number | string | null;
  storeportion: number | string | null;
  other_charge: number | string | null;
  pay_type?: string | null;
  brac_ref_id: string | null;
  issuerbank: string | null;
  validated: number | null;
  gw_version: number | null;
  settlestatus: string | null;
  settled_manually?: number | null;
  avail_the_offer?: string | number | null;
  refundstatus: string | null;
  chargebackstatus: string | null;
  refundamount: number | string | null;
  disct_amount: number | string | null;
  error_reason: string | null;
  is_risk: number | null;
  risk_desc: string | null;
  bank_status: string | null;
  currency_amount: number | string | null;
  currency_type: string | null;
  currency_rate?: string | null;
  td_discount_perctentage: number | string | null;
  display_discount_perctentage?: string | null;
  td_discount_percentage_remarks: string | null;
  diff_create: number | null;
  is_viewed: number | null;
  sel_card: string | null;
  cus_name: string | null;
  cus_email: string | null;
  cus_phone: string | null;
  cus_wallet_no?: string | null;
  track_cust_id?: number | null;
  value_a?: string | null;
  value_b?: string | null;
  value_c?: string | null;
  value_d?: string | null;
  requested_parameter?: Record<string, unknown> | null;
  td_m_discount_amount: number | string | null;
  td_discount_id: number | null;
  cart_items?: Array<Record<string, unknown>>;
  emi_installment: number | null;
  emi_desc: string | null;
  emi_isser_bank?: number | null;
  emi_issuer_bank?: number | null;
  currency_conv_BDT: string | null;
  t_mamount: string | null;
  t_currency: string | null;
  payment_medium: string | null;
  issuer_card_brand?: string | null;
  issuer_card_bin_type?: string | null;
  issuer_bank?: string | null;
  issuer_country?: string | null;
  issuer_country_code?: string | null;
  issuer_bank_id?: string | null;
  ua_agent?: string | null;
  ua_name?: string | null;
  ua_version?: string | null;
  ua_platform?: string | null;
  ua_pattern?: string | null;
  ua_device?: string | null;
  ua_phoneCompName?: string | null;
  merchant_system_ip?: string | null;
  emi_status_message?: string | null;
}

export interface TransactionDetailApiItem extends TransactionApiItem {
  bk_receipt_no: string | null;
  session_id: number | null;
  cust_id: number | null;
  cus_add1: string | null;
  cus_add2: string | null;
  cus_city: string | null;
  cus_state: string | null;
  cus_postcode: string | null;
  cus_country: string | null;
  cus_fax: string | null;
  surl: string | null;
  furl: string | null;
  curl: string | null;
  bankportion: number | string | null;
  susamount: number | string | null;
  sslportion: number | string | null;
  reseller_commission: number | string | null;
}

export interface TransactionListResponse {
  items: TransactionApiItem[];
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

export interface TransactionRow {
  tid?: number;
  id: string;
  cardNum?: string;
  merchantId: string;
  merchantName?: string;
  storeId: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  method: string;
  channel: string;
  isInternational: boolean;
  bankApprovalCode?: string;
  failureReason?: string;
  cardLast4?: string;
  cardBin?: string;
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  bankTxnId?: string;
  bankName?: string;
  cardBrand?: string;
  storeName?: string;
  integrationType?: string;
  cardholderName?: string;
  cardBank?: string;
  cardCountry?: string;
  cardType?: string;
  ipAddress?: string;
}
