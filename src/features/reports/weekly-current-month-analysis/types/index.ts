import type { ReportRow } from "../../types";

export type WeeklyTransaction = Record<string, unknown>;

export interface WeeklyExpenseBlock {
  sequence: number;
  label: string;
  calendarLabel: string;
  range: string;
  start: string;
  end: string;
  total: number;
  expenseTotal: number;
  recurringTotal: number;
  average: number;
  count: number;
  share: number;
  deltaPercent: number | null;
  isPeak: boolean;
  recurringIncluded: boolean;
}

export const toNumber = (value: unknown): number => Number(value) || 0;

export const formatMoney = (value: number): string =>
  `BDT ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDisplayDate = (value: unknown): string => {
  if (!value) return "—";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const getCategoryName = (item: WeeklyTransaction): string => {
  if (
    item.category &&
    typeof item.category === "object" &&
    "name" in item.category
  ) {
    return String(
      (item.category as { name?: unknown }).name ?? "Uncategorized",
    );
  }
  if (typeof item.category_name === "string" && item.category_name.trim()) {
    return item.category_name;
  }

  return "Uncategorized";
};

export const getAccountName = (item: WeeklyTransaction): string => {
  if (
    item.account &&
    typeof item.account === "object" &&
    "name" in item.account
  ) {
    return String((item.account as { name?: unknown }).name ?? "—");
  }
  if (typeof item.account_name === "string" && item.account_name.trim()) {
    return item.account_name;
  }

  return "—";
};

export const isWeeklyOutflowTransaction = (item: WeeklyTransaction): boolean =>
  ["EXPENSE", "RECURRING"].includes(String(item.type ?? "").toUpperCase());

export const extractTransactionsForRange = (
  transactions: WeeklyTransaction[],
  start: string,
  end: string,
): WeeklyTransaction[] =>
  transactions.filter((item) => {
    const date = String(item.transaction_date ?? "").slice(0, 10);
    return date >= start && date <= end && isWeeklyOutflowTransaction(item);
  });

const finalizeMetrics = (
  blocks: Array<Omit<WeeklyExpenseBlock, "share" | "deltaPercent" | "isPeak">>,
): WeeklyExpenseBlock[] => {
  const grandTotal = blocks.reduce((sum, block) => sum + block.total, 0);
  const highestSpend = Math.max(...blocks.map((block) => block.total), 0);

  return blocks.map((block, index) => {
    const previousTotal = index > 0 ? blocks[index - 1].total : null;
    const deltaPercent =
      previousTotal !== null && previousTotal > 0
        ? ((block.total - previousTotal) / previousTotal) * 100
        : null;

    return {
      ...block,
      share: grandTotal > 0 ? (block.total / grandTotal) * 100 : 0,
      deltaPercent,
      isPeak: highestSpend > 0 && block.total === highestSpend,
    };
  });
};

export const mapWeeklyBlocks = (
  rows: ReportRow[],
  ledgerTransactions?: WeeklyTransaction[] | null,
): WeeklyExpenseBlock[] => {
  const baseBlocks = rows.map((row, index) => {
    const start = String(row.week_start ?? "");
    const end = String(row.week_end ?? "");
    const recurringIncluded = row.recurring_included === true;

    // When backend has not yet been updated to include RECURRING transactions,
    // recompute each week from the exact same ledger transactions shown in Details.
    if (!recurringIncluded && ledgerTransactions && start && end) {
      const matched = extractTransactionsForRange(
        ledgerTransactions,
        start,
        end,
      );
      let expenseTotal = 0;
      let recurringTotal = 0;

      for (const item of matched) {
        const amount = toNumber(item.amount);
        if (String(item.type ?? "").toUpperCase() === "RECURRING") {
          recurringTotal += amount;
        } else {
          expenseTotal += amount;
        }
      }

      const total = expenseTotal + recurringTotal;
      const count = matched.length;

      return {
        sequence: toNumber(row.week_sequence) || index + 1,
        label: String(row.week_label ?? `Week ${index + 1}`),
        calendarLabel: String(row.calendar_week_label ?? ""),
        range: String(row.range_label ?? "N/A"),
        start,
        end,
        total,
        expenseTotal,
        recurringTotal,
        average: count > 0 ? total / count : 0,
        count,
        recurringIncluded: true,
      };
    }

    const total = toNumber(row.total_expense);
    const recurringTotal = toNumber(row.recurring_total);
    const expenseTotal =
      row.expense_total !== undefined
        ? toNumber(row.expense_total)
        : Math.max(total - recurringTotal, 0);

    return {
      sequence: toNumber(row.week_sequence) || index + 1,
      label: String(row.week_label ?? `Week ${index + 1}`),
      calendarLabel: String(row.calendar_week_label ?? ""),
      range: String(row.range_label ?? "N/A"),
      start,
      end,
      total,
      expenseTotal,
      recurringTotal,
      average: toNumber(row.average_expense),
      count: toNumber(row.transaction_count),
      recurringIncluded,
    };
  });

  return finalizeMetrics(baseBlocks);
};
