import type {
  FinancialGranularity,
  FinancialOverviewReport,
  FinancialOverviewRow,
  TransferReceiptRow,
} from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const number = (value: unknown) => Number(value) || 0;
const money = (value: unknown) => `BDT ${currency.format(number(value))}`;

const periodLabel = (value: unknown, granularity: FinancialGranularity) => {
  if (!value) return "N/A";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: granularity === "daily" ? "numeric" : undefined,
    month: "long",
    year: "numeric",
  }).format(date);
};

export const mapFinancialOverview = (
  payload: any,
  granularity: FinancialGranularity,
): FinancialOverviewReport => {
  const summary = payload?.summary ?? {};
  const daily: FinancialOverviewRow[] = Array.isArray(payload?.daily)
    ? payload.daily.map((item: any, index: number) => {
        const netIncome = number(item.net_income);
        return {
          id: String(item.date ?? index),
          label: periodLabel(item.date, granularity),
          opening: number(item.opening_balance),
          income: number(item.total_income),
          costing: number(item.total_costing),
          transfers: number(item.total_bank_transfers),
          closing: number(item.closing_balance),
          transactionCount: number(item.transaction_count),
          openingBalanceLabel: money(item.opening_balance),
          incomeLabel: money(item.total_income),
          costingLabel: money(item.total_costing),
          transferLabel: money(item.total_bank_transfers),
          netIncomeLabel: money(netIncome),
          closingBalanceLabel: money(item.closing_balance),
          netIncome,
        };
      })
    : [];
  const transferReceipts: TransferReceiptRow[] = Array.isArray(
    payload?.transfer_receipts_by_account,
  )
    ? payload.transfer_receipts_by_account.map((item: any, index: number) => ({
        id: String(item.account_id ?? item.account_name ?? index),
        accountName: String(item.account_name ?? "N/A"),
        totalAmount: number(item.total_amount),
        totalAmountLabel: money(item.total_amount),
      }))
    : [];
  const net = number(summary.net_income);

  return {
    period: {
      fromDate: periodLabel(payload?.period?.from_date, "daily"),
      toDate: periodLabel(payload?.period?.to_date, "daily"),
    },
    metrics: [
      { label: "Opening Balance", value: money(summary.opening_balance) },
      { label: "Closing Balance", value: money(summary.closing_balance) },
      {
        label: "Total Income",
        value: money(summary.total_income),
        tone: "positive",
      },
      {
        label: "Total Costing",
        value: money(summary.total_costing),
        tone: "negative",
      },
      {
        label: "Bank-to-bank Transfers",
        value: money(summary.total_bank_transfers),
      },
      {
        label: "Net Income",
        value: money(net),
        tone: net >= 0 ? "positive" : "negative",
      },
    ],
    daily,
    transferReceipts,
  };
};
