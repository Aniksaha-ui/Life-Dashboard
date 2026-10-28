export type MerchantStatus = "active" | "inactive" | "onboarding" | "suspended";
export type TransactionStatus = "success" | "failed" | "pending" | "refunded";
export type WorkItemStatus = "open" | "in_progress" | "blocked" | "done";
export type WorkItemType =
  "dispute" | "follow_up" | "failure_spike" | "settlement" | "approval";

export interface Merchant {
  id: string;
  name: string;
  storeId: string;
  ownerName: string; // KAM
  status: MerchantStatus;
  sector: string;
  lastTransactionDate: string;
  gmv7d: number;
  gmv30d: number;
  gmvTrend: number; // percentage
  txCount7d: number;
  txCount30d: number;
  txCountTrend: number; // percentage
  revenue7d: number;
  revenue30d: number;
  revenueTrend: number; // percentage
  successRate7d: number;
  topFailureReason: string;
  isNonTransacting: boolean;
  onboardingDate: string;
  type?: "Online" | "Physical" | "QR Payment";
  // Contact Information
  contactName?: string;
  contactPhone?: string;
  contactFax?: string;
  contactCountry?: string;
  // Meta Information
  addedBy?: string;
  updatedBy?: string;
  updatedOn?: string;
  // Support & Assignment Information
  techSupportBy?: string;
  salesforce?: string;
  hunter?: string;
  incubator?: string;
  introducerKam?: string;
  currentKam?: string;
  customerPayTdr: boolean;
  emiStatus: "Enabled" | "Disabled";
  // Edit form extended fields
  companyAddress?: string;
  email?: string;
  timeZone?: string;
  isMarqueeMerchant?: boolean;
  bank?: string;
  branchName?: string;
  accountName?: string;
  accountNumber?: string;
  eftnNumber?: string;
  settlementEmails?: string;
  agreementDone?: boolean;
  isMonthlyChargeAvailable?: boolean;
  monthlyChargeAmount?: string;
  tierClass?: string;
}

export interface Transaction {
  tid?: number;
  id: string;
  merchantId: string;
  storeId: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  date: string;
  method: string;
  channel: string; // Web, App
  isInternational: boolean;
  bankApprovalCode?: string;
  failureReason?: string;
  cardLast4?: string;
  cardBin?: string;
  // Enriched fields for new UI
  customerName?: string;
  customerEmail?: string;
  customerMobile?: string;
  bankTxnId?: string;
  bankName?: string;
  cardBrand?: string; // VISA | MASTER | AMEX
  storeName?: string;
  integrationType?: string; // Hosted Checkout | API
  cardholderName?: string;
  cardBank?: string;
  cardCountry?: string;
  cardType?: string; // Credit | Debit
  ipAddress?: string;
}

export interface WorkItem {
  id: string;
  title: string;
  subtitle: string;
  type: WorkItemType;
  severity: "high" | "medium" | "low";
  ownerId: string;
  dueDate: string;
  status: WorkItemStatus;
  relatedEntityId?: string; // merchantId or transactionId
  relatedEntityType?: "merchant" | "transaction" | "dispute";
}

export interface Settlement {
  id: string;
  batchId: string;
  txnId: string;
  settlementDate: string;
  merchantName: string;
  merchantId: string;
  storeId: string;
  storeName: string;
  bankDetails: {
    payeeName: string;
    bankName: string;
    branchName: string;
    accountNo: string;
    routingNo: string;
  };
  amount: number;
  settlementStatus: "Pending" | "Paid" | "Bounced" | "On Hold";
  paymentStatus: "Pay Now" | "Paid";
  confirmationStatus: "Payment Confirmed" | "Pending Confirmation";
  type: "Online" | "Physical";
  merchantType?: string;
  storeType?: string;
  onlineAmounts?: {
    opening: number;
    payable: number;
    settlement: number;
    paid: number;
    forwarded: number;
  };
  referenceNo?: string;
  transactionSummary?: Array<{
    type: string;
    noOfTrans: number;
    sslAmt: number;
    bankAmt: number;
    storeAmt: number;
    deductAmt: number;
  }>;
  paymentInformation?: Array<{
    id: number;
    chequeRef: string;
    acctPayee: string;
    amount: number;
    bank: string;
    attachment: string;
  }>;
}

export interface EMIOperation {
  id: string;
  requestedAt: string;
  transactionDate: string;
  emiRefId: string;
  storeName: string;
  merchantName: string;
  storeId: string;
  homePageOfStore?: string;
  bankName?: string;
  issuerBank: string;
  tenureMonths: number;
  transactionId: string;
  transactionAmount: number;
  emiAmount: number;
  emiCharge?: number;
  requestedRemarks?: string;
  status: "Approved" | "Declined" | "Pending";
  bankStatus: "Approved" | "Declined" | "Not Sent to Bank";
  bankSslId?: string;
  canProceed: boolean;
  canCancel: boolean;
}

export interface Dispute {
  id: string;
  merchantId: string;
  transactionId: string;
  amount: number;
  reason: string;
  status: "needs_response" | "in_review" | "won" | "lost";
  evidenceDueDate: string;
  createdDate: string;
}

export interface Investigation {
  id: string;
  caseId: string;
  title: string;
  status: "open" | "closed" | "escalated";
  riskLevel: "low" | "medium" | "high" | "critical";
  assignedTo: string; // userId
  createdAt: string;
  relatedEntityId: string; // merchantId or transactionId
  notes?: string;
}
export interface Chargeback {
  id: string;
  requestedOn: string;
  chargebackRefId: string;
  transactionId: string;
  transactionDate?: string;
  transactionAmount?: number;
  settledAmount?: number;
  merchantId: string;
  merchantName: string;
  storeId: string;
  storeName: string;
  homePageOfStore?: string;
  bankName?: string;
  escrowEnabled: boolean;
  stage: "1st Chargeback" | "Pre-Arbitration" | "Arbitration";
  reason: string;
  chargebackCategory?: string;
  amount: number;
  requestStatus: "Success" | "Waiting" | "Processing" | "Cancel" | "";
  approvalStatus: "Approve" | "Deny" | "Processing" | "Cancel" | "Waiting" | "";
  merchantRefCode?: string;
  bankSslId?: string;
  bank?: string;
  merchantStatus?: MerchantStatus;
  actionType?: string;
  requestedRemarks?: string;
  requestedBy?: string;
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

export interface Refund {
  id: string;
  refundId: number;
  sid: number;
  tid: number;
  storeId: string;
  msslid: string;
  merchantId: string;
  merchantName: string;
  storeName: string;
  storeUrl: string;
  storeLandingUrl: string;
  merchantTransactionId: string;
  transactionId: string;
  refundRefId: string;
  merchantRefCode: string;
  amount: number;
  settledAmount: number;
  requestedRemarks: string;
  hasEmi: number;
  settlementStatus: string;
  requestStatus: number;
  requestStatusLabel: string;
  approvedStatus: number;
  approvedStatusLabel: string;
  confirmedStatus: number;
  confirmedStatusLabel: string;
  requestedOn: string;
  confirmedOn: string;
  approvedOn: string;
  cardNo: string;
  cardType: string | null;
  mtxnid: string;
  mamount: number;
  incommingtime: string;
  bid: number;
  // Compatibility fields
  transactionDate?: string;
  transactionAmount?: number;
  bankName?: string;
  bankSslId?: string;
  bank?: string;
  requestedBy?: string;
  autoRefundStatus?: string | null;
  autoRefundAttempts?: number | null;
  autoRefundRemarks?: string | null;
  approvalOn?: string;
  approvalBy?: string;
  approvalRemarks?: string;
  approvedBy?: number;
  approvedByName?: string | null;
  confirmationOn?: string;
  confirmationBy?: string;
  confirmedBy?: number;
  confirmedByName?: string | null;
  confirmationRemarks?: string;
  confirmedRemarks?: string;
  finalConfirmation?: string;
  finalStatus?: "Success" | "Failed" | "Pending";
  settledStatus?: "Settled" | "Unsettled";
  approvalStatus?: string;
  strid?: string;
}

export interface ChannelSummary {
  id: string;
  name: string;
  amount: number;
  percentage: number;
}

export interface TransactionTicket {
  id: string;
  requestedOn: string;
  ticketNo: string;
  storeName: string;
  transactionId: string;
  queryTypes: string[];
  status: "Requested" | "Solved";
  canAddFeedback: boolean;
  merchantName: string;
  storeId: string;
  tid: number;
  description: string;

  // Requester Info
  requestedBy: string;
  accountType: string;
  userRole: string;
  requesterName: string;
  requesterEmail: string;
  requesterMobile: string;

  // Feedback
  requestFeedback?: string;
  feedbackGivenBy?: string;
  feedbackGivenOn?: string;
  feedbackRemarks?: string;
}

// Detailed Transaction View Model
export interface TransactionDetail {
  tid: number;
  // Section 1: Summary
  date: string;
  transactionId: string;
  status: string;
  amount: number;
  currency: string;
  paymentMedia: string;
  bankGateway: string;
  cardType: string;
  schemeSelected: string; // New
  sslId: string;
  sessionId: string;
  bankId: string;
  bankApprovalId: string;
  bankReceiptNo: string;
  referenceNo: string;
  cid?: string;
  userId?: string;

  // Section 2: Customer & Card
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

  // Section 3: Amount Breakdown
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

  // Section 4: Transaction Flow & Status
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

  // Section 5: Risk
  risk: {
    validationStatus: string;
    apiValidated: boolean;
    isRisk: boolean;
    reason?: string;
    incommingtime?: string;
    returnFromBankTime?: string;
  };

  // Section 7: Device
  agent: {
    platform: string;
    os: string;
    device: string;
    version: string;
    name: string;
    fullString: string;
  };

  // Section 8: Cart
  cart: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;

  // Section 6: Settlement & Flags
  lifecycle: {
    settled: boolean;
    refundRequested: boolean;
    chargebackRequested: boolean;
    availOffer: boolean;
    settlementStatus: string;
  };

  // Section 7: MOTO
  moto: {
    status: string;
    mobile: string;
    maskedCard: string;
    request: string;
    store: string;
    desc: string;
    trxStatus: string;
  };

  // Section 8: Requested Parameters
  requestParams: Record<string, any>;
  requested_parameter?: string;

  // Section 8.5: Bank Response
  bankResponse: {
    raw: string;
    params: Record<string, any>;
  };

  // Section 9: Merchant Request Info
  merchantRequestInfo: {
    ip: string;
    metadata?: Record<string, any>;
  };

  // Section 10: EMI
  emi: {
    statusText: string;
  };
}

export interface MerchantTicket {
  id: string;
  ticketNo: string;
  title: string;
  description: string;
  attachment?: string;
  attachmentUrl?: string;
  issueType: string;
  issueTypeLabel: string;
  merchantId: number;
  merchantMid: number;
  merchantMsslid: string;
  merchantCompanyName: string;
  merchantContactMobile: string;
  createdBy: number;
  createdByFullName: string;
  createdByEmail: string;
  createdByMobile: string;
  kamFullName: string;
  kamEmail: string;
  resolvedBy: number;
  resolvedByFullName: string;
  resolvedByEmail?: string | null;
  resolvedByMobile?: string | null;
  remarks: string | null;
  status: number;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface TransactionLog {
  id: string;
  transactionId: string;
  logsOn: string; // Date and Time
  stage:
    | "api (request)"
    | "api (response)"
    | "success (redirect)"
    | "ipn request"
    | "ipn return"
    | "validation"
    | "agreement"
    | string;
  ip: string;
  description: string;
}

export interface BinInfo {
  bin: string;
  brand: string;
  country: string;
  bank: string;
  cardType: string;
  cardCategory: string;
  status: string;
}

export interface CardDetails {
  binInfo: BinInfo;
  transactions: Transaction[];
}

export interface MerchantUser {
  id: string;
  merchantId: string;
  loginId: string;
  password?: string;
  role?: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobile?: string;
  phone?: string;
  status: "Active" | "De-active";
  merchantAppRole?: string;
  allowedIpList?: string;
  storeGroup?: string;
  addedBy?: string;
  addedOn?: string;
}

export interface Reseller {
  id: string;
  resellerId: string;
  name: string;
  email: string;
  phone: string;
  status: "Active" | "De-active";
  address?: string;
  fax?: string;
  // Account Information
  bank?: string;
  branchName?: string;
  accountName?: string;
  accountNumber?: string;
  eftnNumber?: string;
  bankCharge?: number;
  resellerCharge?: number;
  agreementCopy?: string;
  onboardingDate: string;
}

export interface MerchantStore {
  id: string;
  merchantId: string;
  storeId: string;
  storeName: string;
  baseUrl: string;
  currency: string;
  emiStatus: "No EMI" | "EMI Enabled";
  paymentType: "Only Online" | "Only QR" | "Online & QR";
  status: "Active" | "Inactive";
}

export interface LocalIssuerBank {
  id: string;
  bankRefId: string;
  bankName: string;
  swiftCode: string;
  npsbCode: string;
  emiRate: string;
  sslEmail: string;
  sslMobile: string;
  lastReportingDate: string;
  reportSendOn: string;
  lastEmailSent: string;
  emailStatus: "Yes" | "No";
}

export interface RecurringInfo {
  id: string;
  merchant: string;
  store: string;
  transactionId: string;
  amount: number;
  bankSslId: string;
  cardType?: string;
  creditCard: string;
  referenceId: string;
  time: string;
}
