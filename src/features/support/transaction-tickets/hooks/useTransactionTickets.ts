import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { axiosInstance, logoutDueToSessionExpiry } from "../../../../lib/api";
import {
  downloadFile,
  inspectBlobExportResponse,
} from "../../../../utils/download";
import {
  useTransactionTicketFilterFields,
  useTransactionTicketList,
  useTransactionTicketOverview,
} from "../api/queries";
import {
  DEFAULT_TRANS_TICKET_PAGE,
  DEFAULT_TRANS_TICKET_PER_PAGE,
  getDefaultTransTicketParams,
} from "../constants/filterFallback";
import type { TransactionTicketListParams } from "../types";

const EMPTY_SELECT_QUERY_KEYS = new Set(["status"]);

const toOptional = (value: string | null): string | undefined => {
  if (!value || value === "all") return undefined;
  return value;
};

export function useTransactionTickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const { data: filterMeta, isError: isFilterMetaError } =
    useTransactionTicketFilterFields();
  const hasAppliedDatePresetMigration = useRef(false);
  const lastErrorToastKeyRef = useRef("");

  const hasDatePreset = useMemo(() => {
    // For transaction tickets, we always assume date preset is supported if provided by API
    // or we check the data.date_presets array
    return !!filterMeta?.date_presets?.length;
  }, [filterMeta]);

  const defaultDatePreset = useMemo(() => {
    if (filterMeta?.default_values?.date_preset) {
      return filterMeta.default_values.date_preset;
    }
    return "this_month";
  }, [filterMeta]);

  const defaultFieldQueryParams = useMemo(() => {
    const defaults: Record<string, string> = {};

    // 1. Start with field-level defaults
    (filterMeta?.fields || []).forEach((field) => {
      if (field.default_value === undefined || field.default_value === null)
        return;
      if (field.key === "date_preset") return;

      const rawValue = String(field.default_value);
      if (
        rawValue === "" &&
        field.type === "select" &&
        EMPTY_SELECT_QUERY_KEYS.has(field.key)
      ) {
        defaults[field.key] = "all";
        return;
      }

      if (rawValue !== "") {
        defaults[field.key] = rawValue;
      }
    });

    // 2. Override with top-level default_values if present
    if (filterMeta?.default_values) {
      Object.entries(filterMeta.default_values).forEach(([key, value]) => {
        if (key === "date_preset") return;

        if (value === "" && EMPTY_SELECT_QUERY_KEYS.has(key)) {
          defaults[key] = "all";
          return;
        }

        if (value !== "") {
          defaults[key] = value;
        } else {
          delete defaults[key];
        }
      });
    }

    return defaults;
  }, [filterMeta]);

  const isFilterMetaReady = !!filterMeta || isFilterMetaError;

  const isParamsHydrated = useMemo(() => {
    if (!isFilterMetaReady) return false;

    const requiredDefaults = {
      ...getDefaultTransTicketParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    };

    return Object.keys(requiredDefaults).every((key) => {
      const value = searchParams.get(key);
      return value !== null && value !== "";
    });
  }, [
    defaultDatePreset,
    defaultFieldQueryParams,
    isFilterMetaReady,
    searchParams,
  ]);

  useEffect(() => {
    if (!filterMeta && !isFilterMetaError) return;

    const defaults = {
      ...getDefaultTransTicketParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    };
    const next = new URLSearchParams(searchParams);
    let changed = false;

    Object.entries(defaults).forEach(([key, value]) => {
      if (!next.get(key)) {
        next.set(key, value);
        changed = true;
      }
    });

    if (
      !hasAppliedDatePresetMigration.current &&
      defaultDatePreset &&
      next.get("date_preset") === undefined
    ) {
      next.set("date_preset", defaultDatePreset);
      changed = true;
    }
    hasAppliedDatePresetMigration.current = true;

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [
    defaultDatePreset,
    defaultFieldQueryParams,
    filterMeta,
    isFilterMetaError,
    searchParams,
    setSearchParams,
  ]);

  const filters = useMemo(() => {
    const params: Record<string, any> = {};

    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    if (hasDatePreset && !params.date_preset)
      params.date_preset = defaultDatePreset;
    if (!params.page) params.page = DEFAULT_TRANS_TICKET_PAGE;
    if (!params.per_page) params.per_page = DEFAULT_TRANS_TICKET_PER_PAGE;

    if (params.advanced === "true") params.advanced = "1";
    if (params.advanced === "false") params.advanced = "0";
    if (!params.advanced) params.advanced = "0";

    if (params.status === "all") params.status = "";

    return params;
  }, [defaultDatePreset, hasDatePreset, searchParams]);

  const listParams = useMemo<TransactionTicketListParams>(() => {
    const datePreset =
      searchParams.get("date_preset") || defaultDatePreset || "";
    const rawStatus = searchParams.get("status");

    const params: TransactionTicketListParams = {
      date_preset: datePreset,
      from_date:
        datePreset === "custom_range"
          ? toOptional(searchParams.get("from_date"))
          : undefined,
      to_date:
        datePreset === "custom_range"
          ? toOptional(searchParams.get("to_date"))
          : undefined,
      page: Number(searchParams.get("page") || DEFAULT_TRANS_TICKET_PAGE),
      per_page: Number(
        searchParams.get("per_page") || DEFAULT_TRANS_TICKET_PER_PAGE,
      ),
      status: rawStatus === "all" ? "" : toOptional(rawStatus),
    };

    // Add other dynamic fields from searchParams
    searchParams.forEach((value, key) => {
      if (
        [
          "date_preset",
          "from_date",
          "to_date",
          "page",
          "per_page",
          "status",
          "advanced",
        ].includes(key)
      )
        return;

      params[key] = toOptional(value);
    });

    return params;
  }, [defaultDatePreset, searchParams]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const defaults = getDefaultTransTicketParams(defaultDatePreset);
    const params = new URLSearchParams();

    const datePreset = String(
      newFilters.date_preset || defaults.date_preset || "",
    );
    if (hasDatePreset && datePreset) {
      params.set("date_preset", datePreset);
    }

    params.set("page", "1");
    params.set("per_page", String(newFilters.per_page || defaults.per_page));
    params.set("advanced", newFilters.advanced === "1" ? "true" : "false");

    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        EMPTY_SELECT_QUERY_KEYS.has(key) &&
        (value === "" || value === "all")
      ) {
        params.set(key, "all");
        return;
      }

      if (
        key === "date_preset" ||
        key === "from_date" ||
        key === "to_date" ||
        key === "advanced" ||
        key === "page" ||
        key === "per_page"
      ) {
        return;
      }

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        return;
      }

      params.set(key, String(value));
    });

    if (hasDatePreset && datePreset === "custom_range") {
      if (newFilters.from_date)
        params.set("from_date", String(newFilters.from_date));
      if (newFilters.to_date) params.set("to_date", String(newFilters.to_date));
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({
      ...getDefaultTransTicketParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    });
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  const shouldFetchTransactionTickets = isFilterMetaReady && isParamsHydrated;

  const {
    data,
    isLoading,
    isError: isListError,
    error: listError,
  } = useTransactionTicketList(listParams, shouldFetchTransactionTickets);

  const {
    data: overviewData,
    isError: isOverviewError,
    error: overviewError,
  } = useTransactionTicketOverview(
    {
      from_date: listParams.from_date || "",
      to_date: listParams.to_date || "",
      date_preset: listParams.date_preset,
    },
    shouldFetchTransactionTickets,
  );

  useEffect(() => {
    if (!shouldFetchTransactionTickets) return;

    const listMessage = isListError
      ? (listError as Error | null)?.message ||
        "Failed to load transaction tickets."
      : "";
    const overviewMessage = isOverviewError
      ? (overviewError as Error | null)?.message ||
        "Failed to load transaction ticket overview."
      : "";
    const hasAnyError = Boolean(listMessage || overviewMessage);

    if (!hasAnyError) {
      lastErrorToastKeyRef.current = "";
      return;
    }

    const toastMessage = (() => {
      if (listMessage && overviewMessage) {
        return listMessage === overviewMessage
          ? listMessage
          : "Failed to load filtered data. Please try again.";
      }
      return listMessage || overviewMessage;
    })();

    const toastKey = `${searchParams.toString()}|${listMessage}|${overviewMessage}`;
    if (lastErrorToastKeyRef.current === toastKey) return;

    lastErrorToastKeyRef.current = toastKey;
    toast.error(toastMessage, { id: "transaction-tickets-filter-error" });
  }, [
    shouldFetchTransactionTickets,
    isListError,
    listError,
    isOverviewError,
    overviewError,
    searchParams,
  ]);

  const metrics = useMemo(() => {
    return {
      total: overviewData?.total_tickets || 0,
      pending: overviewData?.pending_tickets || 0,
      solved: overviewData?.solved_tickets || 0,
    };
  }, [overviewData]);

  const pagination = useMemo(() => {
    const paging = data?.pagination;
    return {
      currentPage: paging?.current_page || 1,
      totalPages: paging?.last_page || 1,
      total: paging?.total || 0,
      from: paging?.from,
      to: paging?.to,
    };
  }, [data]);

  const handleExportCSV = async () => {
    if (
      listParams.date_preset === "custom_range" &&
      (!listParams.from_date || !listParams.to_date)
    ) {
      toast.error("Please select a date range before exporting.");
      return;
    }

    const exportParams = { ...listParams };
    delete (exportParams as any).page;
    delete (exportParams as any).per_page;

    const loadingToast = toast.loading("Preparing your export...");
    setIsExporting(true);

    try {
      const response = await axiosInstance.post(
        "/transaction-tickets/export/excel",
        exportParams,
        {
          responseType: "blob",
        },
      );

      const inspection = await inspectBlobExportResponse(response);
      if (inspection.isError) {
        toast.dismiss(loadingToast);
        if (inspection.isSessionExpired) {
          logoutDueToSessionExpiry(
            inspection.message || "Session expired. Please login again.",
          );
          return;
        }
        throw new Error(inspection.message || "Failed to export CSV.");
      }

      const filename = `Transaction_Tickets_${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadFile(
        response.data,
        filename,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      toast.success("Export downloaded successfully", { id: loadingToast });
    } catch (error) {
      const status = (error as any)?.response?.status;
      if (status === 401) {
        toast.dismiss(loadingToast);
        logoutDueToSessionExpiry("Session expired. Please login again.");
        return;
      }
      console.error("Export failed:", error);
      toast.error("Failed to export CSV. Please try again.", {
        id: loadingToast,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    filters,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    filteredData: data?.items || [],
    isLoading,
    metrics,
    pagination,
    handleExportCSV,
    isExporting,
  };
}
