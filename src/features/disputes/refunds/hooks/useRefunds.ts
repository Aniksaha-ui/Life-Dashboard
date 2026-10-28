import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { axiosInstance, logoutDueToSessionExpiry } from "../../../../lib/api";
import {
  downloadFile,
  inspectBlobExportResponse,
} from "../../../../utils/download";
import {
  useRefundFilterFields,
  useRefundList,
  useRefundOverview,
} from "../api/queries";
import {
  DEFAULT_REFUND_DATE_PRESET,
  DEFAULT_REFUND_PAGE,
  DEFAULT_REFUND_PER_PAGE,
  getDefaultRefundParams,
} from "../constants/filterFallback";
import type { RefundListParams, RefundOverviewParams } from "../types";
import { mapApiRefundToRow } from "../utils/refundMappers";

const toOptional = (value: string | null): string | undefined => {
  if (!value || value === "all") return undefined;
  return value;
};

export function useRefunds() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const lastErrorToastKeyRef = useRef("");
  const hasAppliedDatePresetMigration = useRef(false);
  const { data: filterMeta, isError: isFilterMetaError } =
    useRefundFilterFields();

  const defaultDatePreset = useMemo(() => {
    const fromDefaultValues = filterMeta?.default_values?.date_preset;
    if (fromDefaultValues) return String(fromDefaultValues);

    const datePresetField = filterMeta?.fields?.find(
      (field) => field.key === "date_preset",
    );
    if (
      datePresetField?.default_value !== undefined &&
      datePresetField.default_value !== null &&
      datePresetField.default_value !== ""
    ) {
      return String(datePresetField.default_value);
    }

    return DEFAULT_REFUND_DATE_PRESET;
  }, [filterMeta]);

  const defaultFieldQueryParams = useMemo(() => {
    const defaults: Record<string, string> = {};
    (filterMeta?.fields || []).forEach((field) => {
      if (field.default_value === undefined || field.default_value === null)
        return;
      if (field.key === "date_preset") return;
      const rawValue = String(field.default_value);
      if (rawValue !== "") defaults[field.key] = rawValue;
    });

    if (filterMeta?.default_values) {
      Object.entries(filterMeta.default_values).forEach(([key, value]) => {
        if (key === "date_preset") return;
        if (value === undefined || value === null) return;

        const rawValue = String(value);
        if (rawValue !== "") {
          defaults[key] = rawValue;
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
      ...getDefaultRefundParams(defaultDatePreset),
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
      ...getDefaultRefundParams(defaultDatePreset),
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
      defaultDatePreset !== DEFAULT_REFUND_DATE_PRESET &&
      next.get("date_preset") === DEFAULT_REFUND_DATE_PRESET
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

    if (!params.date_preset) params.date_preset = defaultDatePreset;
    if (!params.page) params.page = DEFAULT_REFUND_PAGE;
    if (!params.per_page) params.per_page = DEFAULT_REFUND_PER_PAGE;

    if (params.advanced === "true") params.advanced = "1";
    if (params.advanced === "false") params.advanced = "0";
    if (!params.advanced) params.advanced = "0";
    if (params.refund_request_status === "all")
      params.refund_request_status = "";
    if (params.refund_approval_status === "all")
      params.refund_approval_status = "";

    return params;
  }, [defaultDatePreset, searchParams]);

  const listParams = useMemo<RefundListParams>(() => {
    const datePreset = searchParams.get("date_preset") || defaultDatePreset;
    const rawRequestStatus = searchParams.get("refund_request_status");
    const rawApprovalStatus = searchParams.get("refund_approval_status");

    return {
      date_preset: datePreset,
      from_date:
        datePreset === "custom_range"
          ? toOptional(searchParams.get("from_date"))
          : undefined,
      to_date:
        datePreset === "custom_range"
          ? toOptional(searchParams.get("to_date"))
          : undefined,
      merchant_transaction_id: toOptional(
        searchParams.get("merchant_transaction_id"),
      ),
      merchant_id: toOptional(searchParams.get("merchant_id")),
      store_id: toOptional(searchParams.get("store_id")),
      refund_reference_id: toOptional(searchParams.get("refund_reference_id")),
      merchant_reference_id: toOptional(
        searchParams.get("merchant_reference_id"),
      ),
      refund_request_status:
        rawRequestStatus === "all" ? "" : toOptional(rawRequestStatus),
      refund_approval_status:
        rawApprovalStatus === "all" ? "" : toOptional(rawApprovalStatus),
      card_no: toOptional(searchParams.get("card_no")),
      page: Number(searchParams.get("page") || DEFAULT_REFUND_PAGE),
      per_page: Number(searchParams.get("per_page") || DEFAULT_REFUND_PER_PAGE),
    };
  }, [defaultDatePreset, searchParams]);

  const overviewParams = useMemo<RefundOverviewParams>(() => {
    const { page, per_page, ...rest } = listParams;
    return rest;
  }, [listParams]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const defaults = getDefaultRefundParams(defaultDatePreset);
    const params = new URLSearchParams();
    const datePreset = String(newFilters.date_preset || defaults.date_preset);

    params.set("date_preset", datePreset);
    params.set("page", "1");
    params.set("per_page", String(newFilters.per_page || defaults.per_page));
    params.set("advanced", newFilters.advanced === "1" ? "true" : "false");

    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        (key === "refund_request_status" || key === "refund_approval_status") &&
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

    if (datePreset === "custom_range") {
      if (newFilters.from_date)
        params.set("from_date", String(newFilters.from_date));
      if (newFilters.to_date) params.set("to_date", String(newFilters.to_date));
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({
      ...getDefaultRefundParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    });
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  const shouldFetchRefunds = isFilterMetaReady && isParamsHydrated;

  const {
    data,
    isLoading,
    isError: isListError,
    error: listError,
  } = useRefundList(listParams, shouldFetchRefunds);
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    error: overviewError,
  } = useRefundOverview(overviewParams, shouldFetchRefunds);

  useEffect(() => {
    const listMessage = isListError
      ? (listError as Error | null)?.message || "Failed to load refunds."
      : "";
    const overviewMessage = isOverviewError
      ? (overviewError as Error | null)?.message ||
        "Failed to load refund overview."
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
    toast.error(toastMessage, { id: "refunds-filter-error" });
  }, [isListError, listError, isOverviewError, overviewError, searchParams]);

  const rows = useMemo(() => {
    return (data?.items || []).map(mapApiRefundToRow);
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
        "/refunds/export/excel",
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

      const filename = `Refunds_${new Date().toISOString().split("T")[0]}.xlsx`;
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

  const summaryMetrics = useMemo(() => {
    if (overviewData) {
      return {
        total: overviewData.total_requests || 0,
        pending:
          overviewData.total_pending_requests ||
          overviewData.pending_requests ||
          0,
        successful:
          overviewData.total_success_refunds ||
          overviewData.successful_refunds ||
          0,
        amount: Number(
          overviewData.refunded_amount || overviewData.total_refund_amount || 0,
        ),
      };
    }

    return {
      total: rows.length,
      pending: rows.filter((item) => item.finalStatus === "Pending").length,
      successful: rows.filter((item) => item.finalStatus === "Success").length,
      amount: rows.reduce((sum, item) => sum + item.amount, 0),
    };
  }, [overviewData, rows]);

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

  return {
    filters,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleExportCSV,
    filteredData: rows,
    metrics: summaryMetrics,
    isLoading: isLoading || isOverviewLoading,
    pagination,
    isExporting,
  };
}
