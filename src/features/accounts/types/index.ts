export type AccountType = "CASH" | "BANK" | "CARD" | "MOBILE_BANKING";

export interface AccountApiItem {
  id: number | string;
  name?: string;
  type?: string;
  institution_name?: string | null;
  current_balance?: number | string;
  is_active?: boolean | number | string;
  low_balance_threshold?: number | string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AccountRow {
  id: number | string;
  serial: number;
  name: string;
  institutionLabel: string;
  type: AccountType;
  typeLabel: string;
  currentBalanceLabel: string;
  isActive: boolean;
  updatedAtLabel: string;
}

export interface AccountFormValues {
  name: string;
  type: AccountType;
  institution_name: string;
  opening_balance: string;
  opening_balance_date: string;
  low_balance_threshold: string;
  is_active: "1" | "0";
}
