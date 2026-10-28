import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  useMerchantTicketFilterFields,
  useMerchantTicketList,
} from "../api/queries";
import {
  DEFAULT_TICKET_PAGE,
  DEFAULT_TICKET_PER_PAGE,
  getDefaultTicketParams,
} from "../constants/filterFallback";
import type { MerchantTicketListParams } from "../types";
import { mapApiTicketToRow } from "../utils/merchantTicketMapper";

const EMPTY_SELECT_QUERY_KEYS = new Set(["status", "issue_type"]);

const toOptional = (value: string | null): string | undefined => {
  if (!value || value === "all") return undefined;
  return value;
};

export function useMerchantTickets() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: filterMeta, isError: isFilterMetaError } =
    useMerchantTicketFilterFields();
  const hasAppliedDatePresetMigration = useRef(false);

  const hasDatePreset = useMemo(() => {
    return !!filterMeta?.fields?.find((field) => field.key === "date_preset");
  }, [filterMeta]);

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
      return undefined;
    }
    return String(defaultValue);
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
      ...getDefaultTicketParams(defaultDatePreset),
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
      ...getDefaultTicketParams(defaultDatePreset),
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
    if (!params.page) params.page = DEFAULT_TICKET_PAGE;
    if (!params.per_page) params.per_page = DEFAULT_TICKET_PER_PAGE;

    if (params.advanced === "true") params.advanced = "1";
    if (params.advanced === "false") params.advanced = "0";
    if (!params.advanced) params.advanced = "0";

    if (params.status === "all") params.status = "";
    if (params.issue_type === "all") params.issue_type = "";

    return params;
  }, [defaultDatePreset, hasDatePreset, searchParams]);

  const listParams = useMemo<MerchantTicketListParams>(() => {
    const datePreset = searchParams.get("date_preset") || defaultDatePreset;
    const rawStatus = searchParams.get("status");
    const rawIssueType = searchParams.get("issue_type");

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
      ticket_no: toOptional(searchParams.get("ticket_no")),
      merchant_id: toOptional(searchParams.get("merchant_id")),
      status: rawStatus === "all" ? "" : toOptional(rawStatus),
      issue_type: rawIssueType === "all" ? "" : toOptional(rawIssueType),
      page: Number(searchParams.get("page") || DEFAULT_TICKET_PAGE),
      per_page: Number(searchParams.get("per_page") || DEFAULT_TICKET_PER_PAGE),
    };
  }, [defaultDatePreset, searchParams]);

  const handleFilterChange = (newFilters: Record<string, any>) => {
    const defaults = getDefaultTicketParams(defaultDatePreset);
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
      ...getDefaultTicketParams(defaultDatePreset),
      ...defaultFieldQueryParams,
    });
  };

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    setSearchParams(params);
  };

  const shouldFetchMerchantTickets = isFilterMetaReady && isParamsHydrated;

  const { data, isLoading } = useMerchantTicketList(
    listParams,
    shouldFetchMerchantTickets,
  );

  const tickets = useMemo(() => {
    return (data?.items || []).map(mapApiTicketToRow);
  }, [data]);

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
    filteredData: tickets,
    pagination,
    isLoading,
  };
}
