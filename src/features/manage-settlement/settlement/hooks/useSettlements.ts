import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams } from "react-router-dom";
import { axiosInstance, logoutDueToSessionExpiry } from "../../../../lib/api";
import {
  downloadFile,
  inspectBlobExportResponse,
} from "../../../../utils/download";
import { useSettlementFilterFields, useSettlementList } from "../api/queries";
import {
  DEFAULT_SETTLEMENT_DATE_PRESET,
  DEFAULT_SETTLEMENT_PAGE,
  DEFAULT_SETTLEMENT_PER_PAGE,
  getDefaultSettlementParams,
} from "../constants/filterFallback";

export function useSettlements() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);
  const lastErrorToastKeyRef = useRef("");
  const { data: filterMeta, isError: isFilterMetaError } =
    useSettlementFilterFields();

  const defaultDatePreset =
    filterMeta?.default_values?.date_preset || DEFAULT_SETTLEMENT_DATE_PRESET;

  const defaultFieldQueryParams = useMemo(() => {
    const defaults: Record<string, string> = {};
    if (filterMeta?.default_values) {
      Object.entries(filterMeta.default_values).forEach(([key, value]) => {
        if (key === "date_preset") return;
        if (value === undefined || value === null || value === "") return;
        defaults[key] = String(value);
      });
    }
    return defaults;
  }, [filterMeta]);

  const isFilterMetaReady = !!filterMeta || isFilterMetaError;

  const isParamsHydrated = useMemo(() => {
    if (!isFilterMetaReady) return false;

    const requiredDefaults = {
      ...getDefaultSettlementParams(defaultDatePreset),
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

  // Sync URL with defaults on initial load
  useEffect(() => {
    if (!filterMeta && !isFilterMetaError) return;

    const defaults = getDefaultSettlementParams(defaultDatePreset);
    const next = new URLSearchParams(searchParams);
    let changed = false;

    Object.entries(defaults).forEach(([key, value]) => {
      if (!next.get(key)) {
        next.set(key, value);
        changed = true;
      }
    });

    // Add dynamic defaults from filterMeta if any
    if (filterMeta?.default_values) {
      Object.entries(filterMeta.default_values).forEach(([key, value]) => {
        if (key !== "date_preset" && !next.get(key) && value !== "") {
          next.set(key, String(value));
          changed = true;
        }
      });
    }

    if (changed) {
      setSearchParams(next, { replace: true });
    }
  }, [filterMeta, isFilterMetaError, searchParams, setSearchParams]);

  // Sync filters with URL
  const filters = useMemo(() => {
    const params: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });

    // Local fallbacks if URL isn't synced yet
    if (!params.page) params.page = DEFAULT_SETTLEMENT_PAGE;
    if (!params.per_page) params.per_page = DEFAULT_SETTLEMENT_PER_PAGE;
    if (!params.date_preset) params.date_preset = defaultDatePreset;

    return params;
  }, [defaultDatePreset, searchParams]);

  const handleFilterChange = useCallback(
    (newFilters: Record<string, any>) => {
      const params = new URLSearchParams();

      // Preserve per_page or use default
      params.set("page", "1");
      params.set("per_page", filters.per_page || DEFAULT_SETTLEMENT_PER_PAGE);
      params.set(
        "date_preset",
        String(
          newFilters.date_preset || filters.date_preset || defaultDatePreset,
        ),
      );
      params.set("advanced", newFilters.advanced === "1" ? "1" : "0");

      Object.entries(newFilters).forEach(([key, value]) => {
        if (
          [
            "page",
            "per_page",
            "date_preset",
            "advanced",
            "from_date",
            "to_date",
          ].includes(key)
        )
          return;

        if (value && value !== "" && value !== "all") {
          params.set(key, String(value));
        }
      });

      if (newFilters.date_preset === "custom_range") {
        if (newFilters.from_date)
          params.set("from_date", String(newFilters.from_date));
        if (newFilters.to_date)
          params.set("to_date", String(newFilters.to_date));
      }

      setSearchParams(params);
    },
    [defaultDatePreset, filters.per_page, filters.date_preset, setSearchParams],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    const defaults = getDefaultSettlementParams(defaultDatePreset);
    setSearchParams(defaults);
  }, [defaultDatePreset, setSearchParams]);

  const apiParams = useMemo(() => {
    const params: Record<string, any> = { ...filters };
    if (params.date_preset !== "custom_range") {
      delete params.from_date;
      delete params.to_date;
    }
    return params;
  }, [filters]);

  const handleExportCSV = useCallback(async () => {
    if (
      apiParams.date_preset === "custom_range" &&
      (!apiParams.from_date || !apiParams.to_date)
    ) {
      toast.error("Please select a date range before exporting.");
      return;
    }

    const exportParams = { ...apiParams };
    delete exportParams.page;
    delete exportParams.per_page;

    const loadingToast = toast.loading(
      "Preparing your exports for online and physical settlements...",
    );
    setIsExporting(true);

    try {
      const responseForOnline = await axiosInstance.post(
        "/settlements/export-online",
        exportParams,
        {
          responseType: "blob",
        },
      );

      const onlineInspection =
        await inspectBlobExportResponse(responseForOnline);
      if (onlineInspection.isError) {
        toast.dismiss(loadingToast);
        if (onlineInspection.isSessionExpired) {
          logoutDueToSessionExpiry(
            onlineInspection.message || "Session expired. Please login again.",
          );
          return;
        }
        throw new Error(onlineInspection.message || "Failed to export CSV.");
      }

      const filenameForOnline = `Online_Settlements_${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadFile(
        responseForOnline.data,
        filenameForOnline,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      const responseForPhysical = await axiosInstance.post(
        "/settlements/export-physical",
        exportParams,
        {
          responseType: "blob",
        },
      );

      const physicalInspection =
        await inspectBlobExportResponse(responseForPhysical);
      if (physicalInspection.isError) {
        toast.dismiss(loadingToast);
        if (physicalInspection.isSessionExpired) {
          logoutDueToSessionExpiry(
            physicalInspection.message ||
              "Session expired. Please login again.",
          );
          return;
        }
        throw new Error(physicalInspection.message || "Failed to export CSV.");
      }

      const filenameForPhysical = `Physical_Settlements_${new Date().toISOString().split("T")[0]}.xlsx`;
      downloadFile(
        responseForPhysical.data,
        filenameForPhysical,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      toast.success("Exports downloaded successfully", { id: loadingToast });
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
  }, [apiParams]);

  // Data Fetching
  const shouldFetchSettlements = isFilterMetaReady && isParamsHydrated;

  const {
    data: listData,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
  } = useSettlementList(apiParams, shouldFetchSettlements);

  useEffect(() => {
    if (!shouldFetchSettlements) return;

    const listMessage = isListError
      ? (listError as Error | null)?.message || "Failed to load settlements."
      : "";
    if (!listMessage) {
      lastErrorToastKeyRef.current = "";
      return;
    }

    const toastKey = `${searchParams.toString()}|${listMessage}`;
    if (lastErrorToastKeyRef.current === toastKey) return;

    lastErrorToastKeyRef.current = toastKey;
    toast.error(listMessage, { id: "settlements-filter-error" });
  }, [shouldFetchSettlements, isListError, listError, searchParams]);

  const settlements = listData?.items || [];
  const pagination = listData?.pagination
    ? {
        currentPage: listData.pagination.current_page,
        totalPages: listData.pagination.last_page,
        total: listData.pagination.total,
        from: listData.pagination.from,
        to: listData.pagination.to,
      }
    : {
        currentPage: 1,
        totalPages: 1,
        total: 0,
      };

  const metrics = useMemo(() => {
    return {
      bounceCount: 1,
      bounceAmount: 1110,
    };
    // }, [overviewData]);
  }, []);

  return {
    settlements,
    pagination,
    metrics,
    filters,
    // isLoading: isListLoading || isOverviewLoading,
    isLoading: isListLoading,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleExportCSV,
    isExporting,
  };
}
