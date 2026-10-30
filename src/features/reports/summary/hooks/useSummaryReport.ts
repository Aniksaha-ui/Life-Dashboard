import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getSummaryReport } from "../api/queries";
import { emptySummaryReport, mapSummaryReport } from "../utils/summaryMapper";

const inputDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function useSummaryReport() {
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

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(await getSummaryReport(fromDate, toDate));
    } catch (error) {
      setPayload(null);
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load summary report.",
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    report: useMemo(
      () => (payload ? mapSummaryReport(payload) : emptySummaryReport),
      [payload],
    ),
    loading,
    refresh,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
    defaultDateRange,
  };
}
