import type { CategoryBreakdownMetrics, CategoryBreakdownRow } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const amount = (value: unknown) => Number(value) || 0;
export const mapCategoryBreakdown = (
  payload: unknown,
): CategoryBreakdownRow[] => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : [];
  const total = source.reduce(
    (sum: number, item: any) => sum + amount(item.total_amount),
    0,
  );
  return source
    .map((item: any, index: number) => {
      const value = amount(item.total_amount);
      const categoryType = String(
        item.category_type ?? "EXPENSE",
      ).toUpperCase();
      return {
        serial: index + 1,
        id: String(item.category_id ?? index),
        categoryName: String(item.category_name ?? "N/A"),
        categoryType,
        categoryTypeLabel: categoryType === "INCOME" ? "Income" : "Expense",
        totalAmount: value,
        totalAmountLabel: `BDT ${currency.format(value)}`,
        share: total > 0 ? (value / total) * 100 : 0,
        shareLabel: `${(total > 0 ? (value / total) * 100 : 0).toFixed(1)}%`,
      };
    })
    .sort(
      (first: CategoryBreakdownRow, second: CategoryBreakdownRow) =>
        second.totalAmount - first.totalAmount,
    )
    .map((item: CategoryBreakdownRow, index: number) => ({
      ...item,
      serial: index + 1,
    }));
};
export const buildCategoryBreakdownMetrics = (
  rows: CategoryBreakdownRow[],
): CategoryBreakdownMetrics => {
  const total = rows.reduce((sum, row) => sum + row.totalAmount, 0);
  const top = rows[0];
  return {
    totalCategoriesLabel: String(rows.length),
    totalSpendLabel: `BDT ${currency.format(total)}`,
    topCategoryLabel: top?.categoryName ?? "N/A",
    topShareLabel: top?.shareLabel ?? "0.0%",
  };
};
