import type { AccountApiItem, AccountRow } from "../types";

const currency = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const typeLabels = {
  CASH: "Cash",
  BANK: "Bank",
  CARD: "Card",
  MOBILE_BANKING: "Mobile Banking",
} as const;

export const mapAccount = (
  item: AccountApiItem,
  serial: number,
): AccountRow => {
  const type = String(item.type || "BANK").toUpperCase() as AccountRow["type"];
  const isActive =
    item.is_active === true || item.is_active === 1 || item.is_active === "1";
  const date = item.updated_at || item.created_at;
  const dateValue = date ? new Date(date) : null;

  return {
    id: item.id,
    serial,
    name: item.name || "Untitled account",
    institutionLabel:
      item.institution_name ||
      (type === "CASH" ? "Cash wallet" : "No institution provided"),
    type,
    typeLabel: typeLabels[type] || type,
    currentBalanceLabel: `BDT ${currency.format(Number(item.current_balance) || 0)}`,
    isActive,
    updatedAtLabel:
      dateValue && !Number.isNaN(dateValue.getTime())
        ? dateValue.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not available",
  };
};
