import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getReport } from "../api/queries";
import type { ReportDefinition } from "../types";
import { mapReportData } from "../utils/reportMapper";

const dateInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const initialRange = () => {
  const today = new Date();
  return {
    fromDate: dateInputValue(
      new Date(today.getFullYear(), today.getMonth(), 1),
    ),
    toDate: dateInputValue(today),
  };
};

export function useReport(definition: ReportDefinition) {
  const defaultDateRange = useMemo(initialRange, []);
  const [fromDate, setFromDate] = useState(defaultDateRange.fromDate);
  const [toDate, setToDate] = useState(defaultDateRange.toDate);
  const [payload, setPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setPayload(
        await getReport(
          definition.endpoint,
          definition.supportsDateRange ? { fromDate, toDate } : {},
        ),
      );
    } catch (error) {
      setPayload(null);
      toast.error(
        error instanceof Error ? error.message : "Unable to load report.",
      );
    } finally {
      setLoading(false);
    }
  }, [definition.endpoint, definition.supportsDateRange, fromDate, toDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const report = useMemo(() => mapReportData(payload), [payload]);
  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return report.rows;
    return report.rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(query),
    );
  }, [report.rows, search]);

  return {
    ...report,
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
