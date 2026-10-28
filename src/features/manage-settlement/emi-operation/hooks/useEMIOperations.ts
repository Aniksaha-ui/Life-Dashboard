import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { axiosInstance, logoutDueToSessionExpiry } from "../../../../lib/api";
import {
  downloadFile,
  inspectBlobExportResponse,
} from "../../../../utils/download";
import {
  useEMIOperationFilterFields,
  useEMIOperationList,
  useEMIOperationOverview,
} from "../api/queries";
import {
  DEFAULT_EMI_PAGE,
  DEFAULT_EMI_PER_PAGE,
  getDefaultEMIOperationParams,
} from "../constants/filterFallback";
import type { EMIOperationListParams } from "../types";

const EMPTY_SELECT_QUERY_KEYS = new Set([
  "emi_issuer",
  "emi_month",
  "request_status",
  "confirmed_status",
  "bank_status",
]);

export function useEMIOperations() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const { data: filterMeta, isError: isFilterMetaError } =
    useEMIOperationFilterFields();
  const hasAppliedDatePresetMigration = useRef(false);
  const lastErrorToastKeyRef = useRef("");

  const hasDatePreset = useMemo(() => {
    return !!filterMeta?.date_presets?.length;
  }, [filterMeta]);

  const defaultDatePreset = useMemo(() => {
    return filterMeta?.default_values?.date_preset || "this_month";
  }, [filterMeta]);

  const defaultFieldQueryParams = useMemo(() => {
    const defaults: Record<string, string> = {};
    (filterMeta?.fields || []).forEach((field) => {
      if (field.default_value === undefined || field.default_value === null)
        return;
      if (field.key === "date_preset") return;

      const rawValue = String(field.default_value);
      if (rawValue !== "") {
        defaults[field.key] = rawValue;
      }
    });

    if (filterMeta?.default_values) {
      Object.entries(filterMeta.default_values).forEach(([key, value]) => {
        if (key === "date_preset") return;

        if (value !== "") {
          defaults[key] = value;
        } else {
          delete defaults[key];
        }
      });
    }
    return defaults;
  }, [filterMeta]);

  useEffect(() => {
    if (!filterMeta && !isFilterMetaError) return;

    const defaults = {
      ...getDefaultEMIOperationParams(defaultDatePreset),
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
    if (!params.page) params.page = DEFAULT_EMI_PAGE;
    if (!params.per_page) params.per_page = DEFAULT_EMI_PER_PAGE;

    if (params.advanced === "true") params.advanced = "1";
    if (params.advanced === "false") params.advanced = "0";
    if (!params.advanced) params.advanced = "0";

    return params;
  }, [defaultDatePreset, hasDatePreset, searchParams]);

  const listParams = useMemo<EMIOperationListParams>(() => {
    const datePreset =
      searchParams.get("date_preset") || defaultDatePreset || "";

    const params: EMIOperationListParams = {
      date_preset: datePreset,
      from_date:
        datePreset === "custom_range"
          ? searchParams.get("from_date") || undefined
          : undefined,
      to_date:
        datePreset === "custom_range"
          ? searchParams.get("to_date") || undefined
          : undefined,
      page: Number(searchParams.get("page") || DEFAULT_EMI_PAGE),
      per_page: Number(searchParams.get("per_page") || DEFAULT_EMI_PER_PAGE),
    };

    const dynamicParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (
        [
          "date_preset",
          "from_date",
          "to_date",
          "page",
          "per_page",
          "advanced",
        ].includes(key)
      )
        return;
      if (value === "all" || value === "") return;
      dynamicParams[key] = value;
    });

    return {
      ...params,
      ...dynamicParams,
    };
  }, [defaultDatePreset, searchParams]);

  const {
    data: listResponse,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useEMIOperationList(listParams);
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    error: overviewError,
  } = useEMIOperationOverview(listParams);

  useEffect(() => {
    const listMessage = isListError
      ? (listError as Error | null)?.message || "Failed to load EMI operations."
      : "";
    const overviewMessage = isOverviewError
      ? (overviewError as Error | null)?.message ||
        "Failed to load EMI overview."
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
    toast.error(toastMessage, { id: "emi-operations-filter-error" });
  }, [isListError, listError, isOverviewError, overviewError, searchParams]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const defaults = getDefaultEMIOperationParams(defaultDatePreset);
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
        [
          "date_preset",
          "from_date",
          "to_date",
          "advanced",
          "page",
          "per_page",
        ].includes(key)
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
      ...getDefaultEMIOperationParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    setSearchParams(params);
  };

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
        "/emi-operations/export/excel",
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

      const filename = `EMI_Operations_${new Date().toISOString().split("T")[0]}.xlsx`;
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
    handleExportCSV,
    isExporting,
    filteredData: listResponse?.items || [],
    metrics: overviewData || {
      total_requests: 0,
      total_declined: 0,
      total_approved: 0,
      total_emi_amount: 0,
    },
    isLoading: isListLoading || isOverviewLoading,
    pagination: {
      currentPage: listResponse?.pagination.current_page || 1,
      totalPages: listResponse?.pagination.last_page || 1,
      total: listResponse?.pagination.total || 0,
      from: listResponse?.pagination.from,
      to: listResponse?.pagination.to,
    },
  };
}
