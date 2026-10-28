export interface ResellerAccountingPaymentInfo {
  id: string;
  chequeRef: string;
  acctPayee: string;
  amount: number;
  bank: string;
  attachment?: string;
}

export interface ResellerAccountingRecord {
  id: string;
  settlementDate: string;
  bankAccountName: string;
  bankAccountId: string;
  storeId: string;
  storeAmount: number;
  refundChargeAmount: number;
  paidAmount: number;
  transactionId: string;
  paymentInfo: ResellerAccountingPaymentInfo[];
}
