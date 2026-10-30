import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getBurnRateReport } from "../api/queries";
import {
  emptyBurnRateReport,
  mapBurnRateReport,
} from "../utils/burnRateMapper";

const inputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function useBurnRateAnalysis() {
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    return {
      fromDate: inputDate(new Date(today.getFullYear(), today.getMonth(), 1)),
      toDate: inputDate(today),
    };
  }, []);
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate);
  const [toDate, setToDate] = useState(defaultDateRange.toDate);
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await getBurnRateReport(fromDate, toDate));
    } catch (error) {
      setPayload(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load burn rate analysis.",
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const report = useMemo(
    () => (payload ? mapBurnRateReport(payload) : emptyBurnRateReport),
    [payload],
  );
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? report.rows.filter((row) =>
          `${row.monthLabel} ${row.totalExpenseLabel} ${row.averageBurnRateLabel}`
            .toLowerCase()
            .includes(query),
        )
      : report.rows;
  }, [report.rows, search]);
  return {
    report,
    rows,
    loading,
    search,
    setSearch,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    defaultDateRange,
    refresh,
  };
}
