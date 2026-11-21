import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Banknote,
  Landmark,
  PiggyBank,
  ReceiptText,
  Repeat2,
  type LucideIcon,
} from "lucide-react";

export type TransactionDirection = "in" | "out" | "neutral";

type TransactionTypeMeta = {
  label: string;
  icon: LucideIcon;
  iconClassName: string;
  badgeClassName: string;
  direction: TransactionDirection;
};

const fallbackMeta: TransactionTypeMeta = {
  label: "Transaction",
  icon: ReceiptText,
  iconClassName: "bg-slate-100 text-slate-600",
  badgeClassName: "bg-slate-100 text-slate-600 ring-slate-200",
  direction: "neutral",
};

const typeMeta: Record<string, TransactionTypeMeta> = {
  EXPENSE: {
    label: "Expense",
    icon: ArrowUpRight,
    iconClassName: "bg-rose-50 text-rose-600",
    badgeClassName: "bg-rose-50 text-rose-700 ring-rose-200",
    direction: "out",
  },
  INCOME: {
    label: "Income",
    icon: ArrowDownLeft,
    iconClassName: "bg-emerald-50 text-emerald-600",
    badgeClassName: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    direction: "in",
  },
  DEPOSIT: {
    label: "Deposit",
    icon: PiggyBank,
    iconClassName: "bg-cyan-50 text-cyan-600",
    badgeClassName: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    direction: "in",
  },
  RECURRING: {
    label: "Recurring",
    icon: Repeat2,
    iconClassName: "bg-violet-50 text-violet-600",
    badgeClassName: "bg-violet-50 text-violet-700 ring-violet-200",
    direction: "out",
  },
  TRANSFER: {
    label: "Transfer",
    icon: ArrowLeftRight,
    iconClassName: "bg-sky-50 text-sky-600",
    badgeClassName: "bg-sky-50 text-sky-700 ring-sky-200",
    direction: "neutral",
  },
  OPENING_BALANCE: {
    label: "Opening balance",
    icon: Landmark,
    iconClassName: "bg-primary-50 text-primary-600",
    badgeClassName: "bg-primary-50 text-primary-700 ring-primary-200",
    direction: "in",
  },
  WITHDRAW: {
    label: "Withdraw",
    icon: Banknote,
    iconClassName: "bg-amber-50 text-amber-600",
    badgeClassName: "bg-amber-50 text-amber-700 ring-amber-200",
    direction: "out",
  },
};

export const EDITABLE_TRANSACTION_TYPES = ["EXPENSE", "INCOME", "DEPOSIT"];

export const getTransactionTypeMeta = (type: unknown) =>
  typeMeta[String(type ?? "").toUpperCase()] ?? fallbackMeta;

export const getTransactionTypeLabel = (type: unknown) =>
  String(type ?? "").toLowerCase() === "all"
    ? "All"
    : getTransactionTypeMeta(type).label;

export const isTransactionEditable = (transaction: { type?: unknown }) =>
  EDITABLE_TRANSACTION_TYPES.includes(String(transaction?.type).toUpperCase());

export const getTransactionDirection = (transaction: {
  type?: unknown;
  balance_before?: unknown;
  balance_after?: unknown;
}): TransactionDirection => {
  const before = Number(transaction?.balance_before);
  const after = Number(transaction?.balance_after);
  if (
    transaction?.balance_before != null &&
    transaction?.balance_after != null &&
    Number.isFinite(before) &&
    Number.isFinite(after) &&
    before !== after
  ) {
    return after > before ? "in" : "out";
  }
  return getTransactionTypeMeta(transaction?.type).direction;
};

export const amountToneClass: Record<TransactionDirection, string> = {
  in: "text-emerald-600",
  out: "text-rose-600",
  neutral: "text-slate-900",
};

export const amountPrefix: Record<TransactionDirection, string> = {
  in: "+ ",
  out: "− ",
  neutral: "",
};
