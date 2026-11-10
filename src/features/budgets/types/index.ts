export type BudgetPeriod = "monthly" | "weekly";

export interface BudgetApiItem {
  id: string | number;
  category_id: string | number;
  category_name?: string;
  period_type?: BudgetPeriod;
  period_start?: string;
  period_end?: string;
  amount?: number | string;
  effective_budget?: number | string;
  spent?: number | string;
  remaining?: number | string;
  progress_percent?: number | string;
  warning_level?: "safe" | "watch" | "warning" | "exceeded" | string;
  daily_allowance?: number | string;
  carry_forward?: boolean | number | string;
  carry_amount?: number | string;
}

export interface BudgetFormValues {
  category_id: string;
  period_type: BudgetPeriod;
  amount: string;
  carry_forward: boolean;
}

export interface CategoryOption {
  id: string | number;
  name: string;
  type?: string;
}

export interface BudgetTotals {
  planned: number;
  spent: number;
  remaining: number;
}
