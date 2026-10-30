import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getCategoryBreakdown } from "../api/queries";
import type { CategoryType } from "../types";
import {
  buildCategoryBreakdownMetrics,
  mapCategoryBreakdown,
} from "../utils/categoryBreakdownMapper";

const dateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function useCategoryBreakdown() {
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    return {
      fromDate: dateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
      toDate: dateInput(today),
    };
  }, []);
  const [items, setItems] = useState<ReturnType<typeof mapCategoryBreakdown>>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate);
  const [toDate, setToDate] = useState(defaultDateRange.toDate);
  const [typeFilter, setTypeFilter] = useState<CategoryType>("all");
  const [search, setSearch] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(
        mapCategoryBreakdown(await getCategoryBreakdown(fromDate, toDate)),
      );
    } catch (error) {
      setItems([]);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load category breakdown.",
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(
      (row) =>
        (typeFilter === "all" || row.categoryType === typeFilter) &&
        (!query ||
          `${row.categoryName} ${row.categoryTypeLabel} ${row.totalAmountLabel}`
            .toLowerCase()
            .includes(query)),
    );
  }, [items, search, typeFilter]);
  return {
    rows,
    metrics: buildCategoryBreakdownMetrics(rows),
    loading,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    typeFilter,
    setTypeFilter,
    search,
    setSearch,
    defaultDateRange,
    refresh,
  };
}
