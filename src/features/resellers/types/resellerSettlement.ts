export type ResellerSettlementPaymentStatus =
  "Not Settled" | "Settled" | "Processing" | "On Hold";

export type ResellerSettlementStatus =
  "INITIATE" | "PROCESSING" | "SETTLED" | "FAILED";

export interface ResellerSettlement {
  id: string;
  date: string;
  merchantId: string;
  storeId: string;
  resellerName: string;
  resellerId: string;
  transactionCount: number;
  transactionAmount: number;
  payable: number;
  deductAmount: number;
  paymentStatus: ResellerSettlementPaymentStatus;
  missingCommissionCount: number;
  settlementDate?: string;
  settlementStatus: ResellerSettlementStatus;
  settlementBatchNo?: string;
  createdOn: string;
}
