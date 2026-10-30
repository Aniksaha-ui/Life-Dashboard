export type FinancialGranularity = "daily" | "monthly";

export interface FinancialOverviewRow {
  id: string;
  label: string;
  opening: number;
  income: number;
  costing: number;
  transfers: number;
  closing: number;
  transactionCount: number;
  openingBalanceLabel: string;
  incomeLabel: string;
  costingLabel: string;
  transferLabel: string;
  netIncomeLabel: string;
  closingBalanceLabel: string;
  netIncome: number;
}

export interface TransferReceiptRow {
  id: string;
  accountName: string;
  totalAmount: number;
  totalAmountLabel: string;
}

export interface FinancialOverviewReport {
  period: { fromDate: string; toDate: string };
  metrics: Array<{
    label: string;
    value: string;
    tone?: "default" | "positive" | "negative";
  }>;
  daily: FinancialOverviewRow[];
  transferReceipts: TransferReceiptRow[];
}
