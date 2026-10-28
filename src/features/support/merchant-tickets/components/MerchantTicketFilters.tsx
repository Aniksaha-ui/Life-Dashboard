import { clsx } from "clsx";
import { ChevronDown, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { FilterBar, type FilterConfig } from "../../../../components/FilterBar";
import { useMerchantTicketFilterFields } from "../api/queries";
import {
  DEFAULT_TICKET_PAGE,
  DEFAULT_TICKET_PER_PAGE,
  TICKET_FALLBACK_ADVANCED_KEYS,
  TICKET_FALLBACK_FIELDS,
} from "../constants/filterFallback";
import type {
  MerchantTicketFilterField,
  MerchantTicketFiltersProps,
} from "../types";

const toFilterConfig = (
  field: MerchantTicketFilterField,
): FilterConfig | null => {
  if (
    field.key === "date_preset" ||
    field.key === "from_date" ||
    field.key === "to_date"
  )
    return null;

  if (field.type === "select") {
    if (!field.options || field.options.length === 0) {
      console.warn(
        `Skipping select filter "${field.key}" because options are missing.`,
      );
      return null;
    }

    return {
      key: field.key,
      type: "select",
      label: field.label,
      options: field.options.map((option) => ({
        label: option.label,
        value: String(option.value),
      })),
      placeholder: field.placeholder,
    };
  }

  return {
    key: field.key,
    type: "input",
    label: field.label,
    placeholder: field.placeholder || field.label,
  };
};

const hasActiveFilters = (
  filters: Record<string, any>,
  defaults: Record<string, string> = {},
) => {
  return Object.entries(filters).some(([key, value]) => {
    if (key === "advanced") return false;
    if (key === "page")
      return value && String(value) !== (defaults.page || DEFAULT_TICKET_PAGE);
    if (key === "per_page")
      return (
        value &&
        String(value) !== (defaults.per_page || DEFAULT_TICKET_PER_PAGE)
      );

    if (key === "date_preset") {
      const defaultDP = defaults.date_preset || "";
      return value !== defaultDP;
    }
    if (key === "from_date" || key === "to_date") return Boolean(value);

    const defaultValue = defaults[key];
    const normalize = (val: any) =>
      val === undefined || val === null || val === "all" || val === ""
        ? ""
        : String(val);

    return normalize(value) !== normalize(defaultValue);
  });
};

export function MerchantTicketFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: MerchantTicketFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(
    filters.advanced === "1",
  );
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState({
    from: String(filters.from_date || ""),
    to: String(filters.to_date || ""),
  });
  const dateDropdownRef = useRef<HTMLDivElement | null>(null);

  const { data: filterMeta, isError } = useMerchantTicketFilterFields();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dateDropdownRef.current?.contains(event.target as Node)) {
        setIsDateDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dynamicFields = useMemo(() => {
    if (!isError && filterMeta?.fields?.length) {
      return filterMeta.fields;
    }
    return TICKET_FALLBACK_FIELDS;
  }, [filterMeta, isError]);

  const advancedKeys = useMemo(() => {
    if (!isError && filterMeta) {
      if (!filterMeta.advanced_filter_names?.length) {
        return new Set<string>();
      }
      return new Set(filterMeta.advanced_filter_names);
    }
    return new Set(TICKET_FALLBACK_ADVANCED_KEYS);
  }, [filterMeta, isError]);

  const { primaryFilterConfig, advancedFilterConfig } = useMemo(() => {
    const primary: FilterConfig[] = [];
    const advanced: FilterConfig[] = [];

    dynamicFields.forEach((field) => {
      const config = toFilterConfig(field);
      if (!config) return;

      if (advancedKeys.has(field.key)) {
        advanced.push(config);
        return;
      }

      primary.push(config);
    });

    return {
      primaryFilterConfig: primary,
      advancedFilterConfig: advanced,
    };
  }, [advancedKeys, dynamicFields]);

  const datePresetField = useMemo(() => {
    return dynamicFields.find((field) => field.key === "date_preset");
  }, [dynamicFields]);

  const datePresetOptions = datePresetField?.options || [];

  const fieldDefaultValues = useMemo(() => {
    const defaults: Record<string, string> = {};
    dynamicFields.forEach((field) => {
      if (field.default_value === undefined || field.default_value === null)
        return;
      defaults[field.key] = String(field.default_value);
    });
    return defaults;
  }, [dynamicFields]);

  useEffect(() => {
    const nextFilters = { ...filters };
    Object.entries(fieldDefaultValues).forEach(([key, value]) => {
      if (nextFilters[key] === undefined || nextFilters[key] === null) {
        nextFilters[key] = value;
      }
    });
    setLocalFilters(nextFilters);
    setIsAdvancedOpen(nextFilters.advanced === "1");
    setTempDateRange({
      from: String(nextFilters.from_date || ""),
      to: String(nextFilters.to_date || ""),
    });
  }, [fieldDefaultValues, filters]);

  useEffect(() => {
    if (!isDateDropdownOpen) return;
    setTempDateRange({
      from: String(localFilters.from_date || ""),
      to: String(localFilters.to_date || ""),
    });
  }, [isDateDropdownOpen, localFilters.from_date, localFilters.to_date]);

  const handleLocalChange = (key: string, value: any) => {
    setLocalFilters((prev) => {
      const next = { ...prev, [key]: value };

      if (key === "date_preset" && value !== "custom_range") {
        delete next.from_date;
        delete next.to_date;
      }

      return next;
    });
  };

  const handleSearchClick = () => {
    if (
      localFilters.date_preset === "custom_range" &&
      (!localFilters.from_date || !localFilters.to_date)
    ) {
      toast.error(
        "Please select both From and To dates for Custom Date Range.",
      );
      setIsDateDropdownOpen(true);
      return;
    }

    const filtersToSync: Record<string, any> = {
      ...localFilters,
      advanced: isAdvancedOpen ? "1" : "0",
    };

    if (filtersToSync.date_preset !== "custom_range") {
      delete filtersToSync.from_date;
      delete filtersToSync.to_date;
    }

    onFilterChange(filtersToSync);
  };

  const isFiltersChanged = useMemo(() => {
    const current: Record<string, any> = { ...localFilters };
    if (current.date_preset !== "custom_range") {
      delete current.from_date;
      delete current.to_date;
    }

    const applied = { ...filters };

    // Normalize values for comparison
    const normalize = (val: any) =>
      val === undefined || val === null || val === "all" || val === ""
        ? ""
        : String(val);

    const allKeys = new Set([...Object.keys(current), ...Object.keys(applied)]);
    allKeys.delete("advanced");
    allKeys.delete("page");
    allKeys.delete("per_page");

    return Array.from(allKeys).some((key) => {
      return normalize(current[key]) !== normalize(applied[key]);
    });
  }, [localFilters, filters]);

  const getDatePresetLabel = () => {
    const selectedPreset = String(
      localFilters.date_preset || (datePresetField?.default_value ?? ""),
    );
    if (
      selectedPreset === "custom_range" &&
      localFilters.from_date &&
      localFilters.to_date
    ) {
      return `${new Date(String(localFilters.from_date)).toLocaleDateString()} - ${new Date(String(localFilters.to_date)).toLocaleDateString()}`;
    }

    return (
      datePresetOptions.find((option) => option.value === selectedPreset)
        ?.label ||
      datePresetField?.label ||
      "Select Date"
    );
  };

  const handleDatePresetSelect = (value: string) => {
    handleLocalChange("date_preset", value);
    if (value !== "custom_range") {
      setIsDateDropdownOpen(false);
    }
  };

  const handleApplyCustomRange = () => {
    handleLocalChange("date_preset", "custom_range");
    handleLocalChange("from_date", tempDateRange.from);
    handleLocalChange("to_date", tempDateRange.to);
    setIsDateDropdownOpen(false);
  };

  const handleInternalClearFilters = () => {
    setLocalFilters(fieldDefaultValues);
    setTempDateRange({ from: "", to: "" });
    setIsAdvancedOpen(false);
    onClearFilters();
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3 mb-1.5">
        {datePresetField && (
          <div className="relative" ref={dateDropdownRef}>
            <button
              onClick={() => setIsDateDropdownOpen((prev) => !prev)}
              className={clsx(
                "flex items-center justify-between gap-2 pl-3 pr-3 py-2 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 shadow-sm transition-all min-w-30",
                localFilters.date_preset && localFilters.date_preset !== ""
                  ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                  : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:border-primary-500 font-medium",
              )}
            >
              <span className="truncate">{getDatePresetLabel()}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isDateDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="py-1">
                  {datePresetOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() =>
                        handleDatePresetSelect(String(option.value))
                      }
                      className={clsx(
                        "w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                        localFilters.date_preset === option.value
                          ? "text-primary-600 bg-primary-50"
                          : "text-slate-700",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-3 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Custom Range
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                        From
                      </label>
                      <input
                        type="date"
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                        value={tempDateRange.from}
                        onChange={(e) => {
                          setTempDateRange((prev) => ({
                            ...prev,
                            from: e.target.value,
                          }));
                          handleLocalChange("date_preset", "custom_range");
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                        To
                      </label>
                      <input
                        type="date"
                        className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                        value={tempDateRange.to}
                        onChange={(e) => {
                          setTempDateRange((prev) => ({
                            ...prev,
                            to: e.target.value,
                          }));
                          handleLocalChange("date_preset", "custom_range");
                        }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleApplyCustomRange}
                    disabled={!tempDateRange.from || !tempDateRange.to}
                    className={clsx(
                      "w-full mt-3 py-2 text-white rounded-lg text-xs font-semibold transition-all shadow-sm",
                      !tempDateRange.from || !tempDateRange.to
                        ? "bg-slate-300 cursor-not-allowed"
                        : "bg-primary-600 hover:bg-primary-700 active:scale-[0.98]",
                    )}
                  >
                    Apply Range
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <FilterBar
          filters={localFilters}
          onFilterChange={handleLocalChange}
          config={primaryFilterConfig}
        />

        <button
          onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors border rounded-full",
            isAdvancedOpen
              ? "bg-slate-100 text-slate-900 border-slate-200"
              : "bg-white text-slate-600 border-transparent hover:bg-slate-50",
          )}
        >
          Advanced filters
          <span
            className={clsx(
              "transition-transform duration-200",
              isAdvancedOpen ? "rotate-180" : "",
            )}
          >
            ▾
          </span>
        </button>

        {!isAdvancedOpen && (
          <button
            onClick={handleSearchClick}
            disabled={!isFiltersChanged}
            className={clsx(
              "flex items-center gap-2 px-6 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
              isFiltersChanged
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            <Search className="w-4 h-4" />
            Apply Filters
          </button>
        )}

        {hasActiveFilters(localFilters, fieldDefaultValues) && (
          <button
            onClick={handleInternalClearFilters}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
          >
            Clear all
          </button>
        )}
      </div>

      <div
        className={clsx(
          "grid transition-all duration-300 ease-in-out px-1 w-full",
          isAdvancedOpen
            ? "grid-rows-[1fr] opacity-100 overflow-visible mt-1"
            : "grid-rows-[0fr] opacity-0 overflow-hidden",
        )}
      >
        <div className="min-h-0">
          <div className="pt-1.5 border-t border-slate-100/50 flex flex-wrap items-center gap-3">
            <FilterBar
              filters={localFilters}
              onFilterChange={handleLocalChange}
              config={advancedFilterConfig}
            />
            <button
              onClick={handleSearchClick}
              disabled={!isFiltersChanged}
              className={clsx(
                "flex items-center gap-2 px-6 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
                isFiltersChanged
                  ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                  : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
              )}
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
