import type { SummaryReport } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const count = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const number = (value: unknown) => Number(value) || 0;
const money = (value: unknown) => `BDT ${currency.format(number(value))}`;

const formatDate = (value: unknown, fallback: string) => {
  if (!value) return fallback;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const emptySummaryReport: SummaryReport = {
  fromDateLabel: "N/A",
  toDateLabel: "N/A",
  accountCount: 0,
  accountCountLabel: "0",
  currentBalance: 0,
  currentBalanceLabel: "BDT 0.00",
  totalIncome: 0,
  totalIncomeLabel: "BDT 0.00",
  totalExpense: 0,
  totalExpenseLabel: "BDT 0.00",
  totalWithdraw: 0,
  totalWithdrawLabel: "BDT 0.00",
  totalTransferOut: 0,
  totalTransferOutLabel: "BDT 0.00",
  netMovement: 0,
  netMovementLabel: "BDT 0.00",
};

export const mapSummaryReport = (payload: any): SummaryReport => {
  const totalIncome = number(payload?.total_income);
  const totalExpense = number(payload?.total_expense);
  const totalWithdraw = number(payload?.total_withdraw);
  const totalTransferOut = number(payload?.total_transfer_out);
  const netMovement =
    totalIncome - totalExpense - totalWithdraw - totalTransferOut;

  return {
    fromDateLabel: formatDate(payload?.from_date, "Beginning"),
    toDateLabel: formatDate(payload?.to_date, "Today"),
    accountCount: number(payload?.account_count),
    accountCountLabel: count.format(number(payload?.account_count)),
    currentBalance: number(payload?.current_balance),
    currentBalanceLabel: money(payload?.current_balance),
    totalIncome,
    totalIncomeLabel: money(totalIncome),
    totalExpense,
    totalExpenseLabel: money(totalExpense),
    totalWithdraw,
    totalWithdrawLabel: money(totalWithdraw),
    totalTransferOut,
    totalTransferOutLabel: money(totalTransferOut),
    netMovement,
    netMovementLabel: money(netMovement),
  };
};
