import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getFinancialOverview } from "../api/queries";
import type { FinancialGranularity } from "../types";
import { mapFinancialOverview } from "../utils/financialOverviewMapper";

const toDateInput = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const getDefaultDateRange = () => {
  const today = new Date();
  return {
    fromDate: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    toDate: toDateInput(today),
  };
};

export function useFinancialOverview() {
  const defaultDateRange = useMemo(getDefaultDateRange, []);
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate);
  const [toDate, setToDate] = useState(defaultDateRange.toDate);
  const [granularity, setGranularity] =
    useState<FinancialGranularity>("monthly");
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [ledgerSearch, setLedgerSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await getFinancialOverview(fromDate, toDate, granularity));
    } catch (error) {
      setPayload(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load financial overview.",
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, granularity, toDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const report = useMemo(
    () => mapFinancialOverview(payload, granularity),
    [granularity, payload],
  );
  const ledgerRows = useMemo(() => {
    const search = ledgerSearch.trim().toLowerCase();
    if (!search) return report.daily;
    return report.daily.filter((row) =>
      [
        row.label,
        row.openingBalanceLabel,
        row.incomeLabel,
        row.costingLabel,
        row.netIncomeLabel,
        row.closingBalanceLabel,
        row.transactionCount,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    );
  }, [ledgerSearch, report.daily]);

  return {
    ...report,
    ledgerRows,
    ledgerSearch,
    setLedgerSearch,
    loading,
    refresh,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    granularity,
    setGranularity,
    defaultDateRange,
  };
}
