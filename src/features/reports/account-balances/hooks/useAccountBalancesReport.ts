import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getAccountBalancesReport } from "../api/queries";
import type { AccountType } from "../types";
import {
  buildAccountBalanceMetrics,
  mapAccountBalances,
} from "../utils/accountBalanceMapper";

export function useAccountBalancesReport() {
  const [items, setItems] = useState<ReturnType<typeof mapAccountBalances>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType>("all");
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setItems(mapAccountBalances(await getAccountBalancesReport()));
    } catch (error) {
      setItems([]);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load account balances.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        (typeFilter === "all" || item.type === typeFilter) &&
        (!query || item.searchText.includes(query)),
    );
  }, [items, search, typeFilter]);
  return {
    rows,
    metrics: buildAccountBalanceMetrics(items),
    loading,
    search,
    setSearch,
    typeFilter,
    setTypeFilter,
    refresh,
  };
}
