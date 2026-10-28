export type OpResellerStatus = "Pending" | "Uploaded" | "Approved" | "Rejected";

export interface OpResellerDocumentLogEntry {
  id: string;
  action: string;
  remarks: string;
  performedBy: string;
  performedAt: string;
}

export interface OpResellerDocument {
  id: string;
  name: string;
  fileName: string;
  fileType: "image" | "pdf";
  fileUrl?: string;
  thumbnailUrl?: string;
  uploadedAt?: string;
  actionedAt?: string;
  status: "Uploaded" | "Missing" | "Accepted" | "Rejected";
  rejectedReason?: string;
  logs: OpResellerDocumentLogEntry[];
}

export type OpResellerMerchantStatus =
  "Active" | "Pending" | "Inactive" | "Rejected";

export interface OpResellerMerchant {
  id: string;
  name: string;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  service: string;
  sector: string;
  remarks?: string;
  invitedAt: string;
  status: OpResellerMerchantStatus;
}

export type OpResellerSettlementStatus =
  "Paid" | "Pending" | "Processing" | "On Hold";

export interface OpResellerSettlementLedgerRow {
  id: string;
  merchantName: string;
  mid: string;
  txnVolume: number;
  ratePercent: number;
  commission: number;
  status: OpResellerSettlementStatus;
  periodLabel: string;
}

export interface OpResellerSettlementTrendPoint {
  month: string;
  commission: number;
}

export interface OpResellerSettlements {
  mtdEarnings: number;
  mtdChangePercent: number;
  pendingSettlement: number;
  pendingClearsOn: string;
  totalPaidLifetime: number;
  lifetimeMonths: number;
  trend: OpResellerSettlementTrendPoint[];
  ledger: OpResellerSettlementLedgerRow[];
}

export interface OpResellerTransactionDayPoint {
  date: string;
  volume: number;
  count: number;
}

export interface OpResellerPaymentDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface OpResellerTransactionOverview {
  volumeChangePercent: number;
  countChangePercent: number;
  daily: OpResellerTransactionDayPoint[];
  paymentDistribution: OpResellerPaymentDistributionItem[];
}

export interface OpReseller {
  id: string;
  resellerId: string;
  name: string;
  sector: string;
  website: string;
  pocName: string;
  pocEmail: string;
  pocPhone: string;
  onboardingDate: string;
  status: OpResellerStatus;
  pendingReason?: string;
  rejectedReason?: string;
  address: string;
  email: string;
  phone: string;
  documents: OpResellerDocument[];
  merchants: OpResellerMerchant[];
  settlements: OpResellerSettlements;
  transactionOverview: OpResellerTransactionOverview;
}
