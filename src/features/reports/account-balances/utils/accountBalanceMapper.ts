import type {
  AccountBalanceChartItem,
  AccountBalanceMetrics,
  AccountBalanceRow,
} from "../types";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const countFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});
const accountTypes: Record<string, string> = {
  CASH: "Cash",
  BANK: "Bank",
  CARD: "Card",
  MOBILE_BANKING: "Mobile Banking",
};
const number = (value: unknown) => Number(value) || 0;
const formatDate = (value: unknown) => {
  if (!value) return "N/A";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
    .format(date)
    .replace(" am", "AM")
    .replace(" pm", "PM");
};

export const mapAccountBalances = (payload: unknown): AccountBalanceRow[] => {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as any)?.data)
      ? (payload as any).data
      : [];
  return items
    .map((item: any) => {
      const type = String(item.type ?? "BANK").toUpperCase();
      const isActive =
        item.is_active === true ||
        item.is_active === 1 ||
        item.is_active === "1";
      const institutionLabel =
        String(item.institution_name ?? "").trim() ||
        (type === "CASH" ? "Cash wallet" : "N/A");
      return {
        id: item.id ?? "N/A",
        name: String(item.name ?? "Untitled account"),
        institutionLabel,
        type,
        typeLabel: accountTypes[type] ?? type,
        currentBalance: number(item.current_balance),
        currentBalanceLabel: `BDT ${moneyFormatter.format(number(item.current_balance))}`,
        isActive,
        statusLabel: isActive ? "Active" : "Inactive",
        updatedAtLabel: formatDate(item.updated_at ?? item.created_at),
        searchText: [
          item.id,
          item.name,
          institutionLabel,
          type,
          isActive ? "active" : "inactive",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    })
    .sort(
      (first, second) =>
        first.type.localeCompare(second.type) ||
        first.name.localeCompare(second.name),
    );
};

export const buildAccountBalanceMetrics = (
  rows: AccountBalanceRow[],
): AccountBalanceMetrics => ({
  totalCountLabel: countFormatter.format(rows.length),
  activeCountLabel: countFormatter.format(
    rows.filter((row) => row.isActive).length,
  ),
  cashCountLabel: countFormatter.format(
    rows.filter((row) => row.type === "CASH").length,
  ),
  totalBalanceLabel: `BDT ${moneyFormatter.format(rows.reduce((total, row) => total + row.currentBalance, 0))}`,
});

const chartColors = [
  "#295cab",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0e7490",
  "#e11d48",
];

export const buildAccountBalanceChart = (
  rows: AccountBalanceRow[],
): AccountBalanceChartItem[] =>
  rows
    .filter((row) => row.currentBalance > 0)
    .sort((first, second) => second.currentBalance - first.currentBalance)
    .map((row, index) => ({
      name: row.name,
      value: row.currentBalance,
      label: row.currentBalanceLabel,
      color: chartColors[index % chartColors.length],
    }));
