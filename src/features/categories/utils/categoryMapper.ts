import type { CategoryApiItem, CategoryRow } from "../types";

export const mapCategory = (
  item: CategoryApiItem,
  serial: number,
): CategoryRow => {
  const type = String(
    item.type || "EXPENSE",
  ).toUpperCase() as CategoryRow["type"];
  const isDefault =
    item.is_default === true ||
    item.is_default === 1 ||
    item.is_default === "1";
  const isActiveKnown = item.is_active !== undefined && item.is_active !== null;
  const isActive =
    item.is_active === true || item.is_active === 1 || item.is_active === "1";
  const timestamp = item.updated_at || item.created_at;
  const date = timestamp ? new Date(timestamp) : null;
  return {
    id: item.id,
    serial,
    name: item.name || "Untitled category",
    slug: item.slug || "-",
    type,
    typeLabel: type === "INCOME" ? "Income" : "Expense",
    isDefault,
    statusLabel: isActiveKnown ? (isActive ? "Active" : "Inactive") : "N/A",
    updatedAtLabel:
      date && !Number.isNaN(date.getTime())
        ? date.toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Not available",
  };
};
