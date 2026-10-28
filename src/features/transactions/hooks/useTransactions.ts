import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { axiosInstance, logoutDueToSessionExpiry } from "../../../lib/api";
import {
  downloadFile,
  inspectBlobExportResponse,
} from "../../../utils/download";
import {
  useTransactionFilterFields,
  useTransactionList,
  useTransactionOverview,
} from "../api/queries";
import {
  DEFAULT_TRANSACTION_DATE_PRESET,
  DEFAULT_TRANSACTION_PAGE,
  DEFAULT_TRANSACTION_PER_PAGE,
  getDefaultTransactionParams,
} from "../constants/filterFallback";
import type {
  TransactionListParams,
  TransactionOverviewParams,
} from "../types";
import { mapApiTransactionToRow } from "../utils/transactionMappers";

const EMPTY_SELECT_QUERY_KEYS = new Set([
  "status",
  "card_type",
  "bank_id_select",
]);

const toOptional = (value: string | null): string | undefined => {
  if (!value || value === "all") return undefined;
  return value;
};

export function useTransactions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const { data: filterMeta, isError: isFilterMetaError } =
    useTransactionFilterFields();
  const hasAppliedDatePresetMigration = useRef(false);
  const lastErrorToastKeyRef = useRef("");

  const defaultDatePreset = useMemo(() => {
    const datePresetField = filterMeta?.fields?.find(
      (field) => field.key === "date_preset",
    );
    const defaultValue = datePresetField?.default_value;
    if (
      defaultValue === undefined ||
      defaultValue === null ||
      defaultValue === ""
    ) {
      return DEFAULT_TRANSACTION_DATE_PRESET;
    }
    return String(defaultValue);
  }, [filterMeta]);

  const defaultFieldQueryParams = useMemo(() => {
    const defaults: Record<string, string> = {};
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
    return defaults;
  }, [filterMeta]);

  const isFilterMetaReady = !!filterMeta || isFilterMetaError;

  const isParamsHydrated = useMemo(() => {
    if (!isFilterMetaReady) return false;

    const requiredDefaults = {
      ...getDefaultTransactionParams(defaultDatePreset),
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
      ...getDefaultTransactionParams(defaultDatePreset),
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
      defaultDatePreset !== DEFAULT_TRANSACTION_DATE_PRESET &&
      next.get("date_preset") === DEFAULT_TRANSACTION_DATE_PRESET
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
    if (!params.page) params.page = DEFAULT_TRANSACTION_PAGE;
    if (!params.per_page) params.per_page = DEFAULT_TRANSACTION_PER_PAGE;

    if (params.advanced === "true") params.advanced = "1";
    if (params.advanced === "false") params.advanced = "0";
    if (!params.advanced) params.advanced = "0";
    if (params.status === "all") params.status = "";
    if (params.card_type === "all") params.card_type = "";
    if (params.bank_id_select === "all") params.bank_id_select = "";

    return params;
  }, [defaultDatePreset, searchParams]);

  const listParams = useMemo<TransactionListParams>(() => {
    const datePreset = searchParams.get("date_preset") || defaultDatePreset;
    const rawStatus = searchParams.get("status");
    const rawCardType = searchParams.get("card_type");
    const rawBankIdSelect = searchParams.get("bank_id_select");

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
      transaction_id: toOptional(searchParams.get("transaction_id")),
      merchant_id: toOptional(searchParams.get("merchant_id")),
      store_id: toOptional(searchParams.get("store_id")),
      ip_address: toOptional(searchParams.get("ip_address")),
      gate_id: toOptional(searchParams.get("gate_id")),
      payment_type: toOptional(searchParams.get("payment_type")),
      status: rawStatus === "all" ? "" : toOptional(rawStatus),
      issuer_location: toOptional(
        searchParams.get("issuer_location"),
      ) as TransactionListParams["issuer_location"],
      bank_name: toOptional(searchParams.get("bank_name")),
      banksslid: toOptional(searchParams.get("banksslid")),
      bank_id_select:
        rawBankIdSelect === "all" ? "" : toOptional(rawBankIdSelect),
      card_type: rawCardType === "all" ? "" : toOptional(rawCardType),
      last_4_digit_of_card: toOptional(
        searchParams.get("last_4_digit_of_card"),
      ),
      bank_id: toOptional(searchParams.get("bank_id")),
      card_holder_given_name: toOptional(
        searchParams.get("card_holder_given_name"),
      ),
      emi_status: toOptional(
        searchParams.get("emi_status"),
      ) as TransactionListParams["emi_status"],
      page: Number(searchParams.get("page") || DEFAULT_TRANSACTION_PAGE),
      per_page: Number(
        searchParams.get("per_page") || DEFAULT_TRANSACTION_PER_PAGE,
      ),
    };
  }, [defaultDatePreset, searchParams]);

  const overviewParams = useMemo<TransactionOverviewParams>(() => {
    const { page, per_page, ...rest } = listParams;
    return rest;
  }, [listParams]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const defaults = getDefaultTransactionParams(defaultDatePreset);
    const params = new URLSearchParams();

    const datePreset = String(newFilters.date_preset || defaults.date_preset);
    params.set("date_preset", datePreset);
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

    if (datePreset === "custom_range") {
      if (newFilters.from_date)
        params.set("from_date", String(newFilters.from_date));
      if (newFilters.to_date) params.set("to_date", String(newFilters.to_date));
    }

    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({
      ...getDefaultTransactionParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    });
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
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
        "/transactions/export/excel",
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

      const filename = `Transactions_${new Date().toISOString().split("T")[0]}.xlsx`;
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

  const shouldFetchTransactions = isFilterMetaReady && isParamsHydrated;

  const {
    data,
    isLoading,
    isError: isListError,
    error: listError,
  } = useTransactionList(listParams, shouldFetchTransactions);
  const {
    data: overviewData,
    isLoading: isOverviewLoading,
    isError: isOverviewError,
    error: overviewError,
  } = useTransactionOverview(overviewParams, shouldFetchTransactions);

  useEffect(() => {
    if (!shouldFetchTransactions) return;

    const listMessage = isListError
      ? (listError as Error | null)?.message || "Failed to load transactions."
      : "";
    const overviewMessage = isOverviewError
      ? (overviewError as Error | null)?.message ||
        "Failed to load transaction overview."
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
    toast.error(toastMessage, { id: "transactions-filter-error" });
  }, [
    shouldFetchTransactions,
    isListError,
    listError,
    isOverviewError,
    overviewError,
    searchParams,
  ]);

  const rows = useMemo(() => {
    return (data?.items || []).map(mapApiTransactionToRow);
  }, [data]);

  const summaryMetrics = useMemo(() => {
    if (overviewData) {
      return {
        total: overviewData.total_transactions || 0,
        totalAmount: Number(overviewData.total_amount || 0),
        successCount: overviewData.success_transactions || 0,
        failedCount: overviewData.failed_transactions || 0,
      };
    }

    const total = rows.length;
    const totalAmount = rows.reduce((sum, item) => sum + item.amount, 0);
    const successCount = rows.filter((i) => i.status === "success").length;
    const failedCount = rows.filter((i) => i.status === "failed").length;
    return { total, totalAmount, successCount, failedCount };
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
    transactions: rows,
    filteredData: rows,
    summaryMetrics,
    filters,
    pagination,
    isLoading: isLoading || isOverviewLoading,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleExportCSV,
    isExporting,
  };
}
