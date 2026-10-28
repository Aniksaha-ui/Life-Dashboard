import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { createCategory, getCategories, updateCategory } from "../api/queries";
import type { CategoryFormValues } from "../types";
import { mapCategory } from "../utils/categoryMapper";

export function useCategories() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof getCategories>>>(
    [],
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await getCategories());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load categories.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const rows = useMemo(
    () =>
      items
        .filter(
          (item) =>
            typeFilter === "all" ||
            String(item.type).toUpperCase() === typeFilter,
        )
        .filter((item) =>
          `${item.id} ${item.name} ${item.slug} ${item.type} ${item.is_default ? "default" : "custom"}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .map(mapCategory),
    [items, search, typeFilter],
  );
  const metrics = useMemo(
    () => ({
      total: items.length,
      expense: items.filter(
        (item) => String(item.type).toUpperCase() === "EXPENSE",
      ).length,
      income: items.filter(
        (item) => String(item.type).toUpperCase() === "INCOME",
      ).length,
      custom: items.filter(
        (item) =>
          !(
            item.is_default === true ||
            item.is_default === 1 ||
            item.is_default === "1"
          ),
      ).length,
    }),
    [items],
  );
  const save = async (values: CategoryFormValues, id?: string | number) => {
    if (id) await updateCategory(id, values);
    else await createCategory(values);
    toast.success(
      id ? "Category updated successfully." : "Category created successfully.",
    );
    await refresh();
  };
  return {
    rows,
    metrics,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    isLoading,
    refresh,
    save,
  };
}
