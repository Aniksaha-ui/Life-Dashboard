export type CategoryType = "all" | "EXPENSE" | "INCOME";

export interface CategoryBreakdownRow {
  serial: number;
  id: string;
  categoryName: string;
  categoryType: string;
  categoryTypeLabel: string;
  totalAmount: number;
  totalAmountLabel: string;
  share: number;
  shareLabel: string;
}

export interface CategoryBreakdownMetrics {
  totalCategoriesLabel: string;
  totalSpendLabel: string;
  topCategoryLabel: string;
  topShareLabel: string;
}
