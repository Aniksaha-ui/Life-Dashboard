export type AccountType = "all" | "CASH" | "BANK" | "CARD" | "MOBILE_BANKING";

export interface AccountBalanceRow {
  id: string | number;
  name: string;
  institutionLabel: string;
  type: string;
  typeLabel: string;
  currentBalance: number;
  currentBalanceLabel: string;
  isActive: boolean;
  statusLabel: string;
  updatedAtLabel: string;
  searchText: string;
}

export interface AccountBalanceMetrics {
  totalCountLabel: string;
  activeCountLabel: string;
  cashCountLabel: string;
  totalBalanceLabel: string;
}

export interface AccountBalanceChartItem {
  name: string;
  value: number;
  label: string;
  color: string;
}
