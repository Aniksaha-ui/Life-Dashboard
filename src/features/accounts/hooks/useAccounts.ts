import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  createAccount,
  getAccount,
  getAccounts,
  updateAccount,
} from "../api/queries";
import type { AccountApiItem, AccountFormValues } from "../types";
import { mapAccount } from "../utils/accountMapper";

export function useAccounts() {
  const [items, setItems] = useState<AccountApiItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setItems(await getAccounts());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load accounts.",
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
          `${item.id} ${item.name} ${item.institution_name} ${item.type} ${item.is_active ? "active" : "inactive"}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .map(mapAccount),
    [items, search, typeFilter],
  );
  const metrics = useMemo(
    () => ({
      total: items.length,
      active: items.filter(
        (item) =>
          item.is_active === true ||
          item.is_active === 1 ||
          item.is_active === "1",
      ).length,
      cash: items.filter((item) => String(item.type).toUpperCase() === "CASH")
        .length,
      balance: items.reduce(
        (sum, item) => sum + (Number(item.current_balance) || 0),
        0,
      ),
    }),
    [items],
  );
  const save = async (values: AccountFormValues, id?: string | number) => {
    if (id) await updateAccount(id, values);
    else await createAccount(values);
    toast.success(
      id ? "Account updated successfully." : "Account created successfully.",
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
    getAccount,
  };
}
