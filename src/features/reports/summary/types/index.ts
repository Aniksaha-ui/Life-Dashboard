export interface SummaryReport {
  fromDateLabel: string;
  toDateLabel: string;
  accountCount: number;
  accountCountLabel: string;
  currentBalance: number;
  currentBalanceLabel: string;
  totalIncome: number;
  totalIncomeLabel: string;
  totalExpense: number;
  totalExpenseLabel: string;
  totalWithdraw: number;
  totalWithdrawLabel: string;
  totalTransferOut: number;
  totalTransferOutLabel: string;
  netMovement: number;
  netMovementLabel: string;
}
