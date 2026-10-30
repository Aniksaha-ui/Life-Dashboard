import type { RecurringExpense, RecurringExpenseRow } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatDate = (value: unknown, fallback = "N/A") => {
  if (!value) return fallback;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const toDateKey = (value: unknown) => String(value ?? "").slice(0, 10);

export const mapRecurringExpense = (
  item: RecurringExpense,
  serial: number,
): RecurringExpenseRow => {
  const active = Boolean(
    item.is_active === true || item.is_active === 1 || item.is_active === "1",
  );
  const nextRunKey = toDateKey(item.next_run_date);
  const dueNow =
    active &&
    Boolean(nextRunKey) &&
    nextRunKey <= new Date().toLocaleDateString("en-CA");

  return {
    ...item,
    serial,
    titleLabel: item.title || "Untitled recurring expense",
    accountLabel: item.account?.name || "N/A",
    categoryLabel: item.category?.name || "N/A",
    frequencyLabel: String(item.frequency || "MONTHLY")
      .replace(/^./, (value) => value.toUpperCase())
      .toLowerCase()
      .replace(/^./, (value) => value.toUpperCase()),
    amountLabel: `BDT ${currency.format(Number(item.amount || 0))}`,
    nextRunLabel: formatDate(item.next_run_date, "Not scheduled"),
    statusLabel: !active ? "Inactive" : dueNow ? "Due Now" : "Active",
    dueNow,
  };
};
