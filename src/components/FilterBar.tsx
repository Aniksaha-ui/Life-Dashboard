import clsx from "clsx";
import { ChevronDown, X, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";
import { DatePicker } from "./DatePicker";
import { DateRangePicker } from "./DateRangePicker";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterConfig {
  key: string;
  type: "select" | "input" | "date" | "date-range" | "month-select";
  label: string;
  icon?: any;
  options?: FilterOption[];
  placeholder?: string;
  className?: string;
}

interface FilterBarProps {
  filters: Record<string, any>;
  onFilterChange: (key: string, value: any) => void;
  config: FilterConfig[];
  children?: React.ReactNode;
}

export function FilterBar({
  filters,
  onFilterChange,
  config,
  children,
}: FilterBarProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if ((target as Element).closest?.("[data-date-range-picker-portal]")) {
        return;
      }
      if (
        activeDropdown &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown]?.contains(target)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeDropdown]);

  const handleSelect = (key: string, value: any) => {
    onFilterChange(key, value);
    setActiveDropdown(null);
  };

  return (
    <div className="filter-bar-container flex items-center gap-3 flex-wrap">
      {config.map((filter) => {
        const Icon = filter.icon;
        const value = filters[filter.key];
        const hasSelection = value !== undefined && value !== null;
        const isActive = hasSelection && value !== "all";

        if (filter.type === "select") {
          const selectedLabel =
            filter.options?.find((opt) => opt.value === value)?.label ||
            filter.label;

          return (
            <div
              key={filter.key}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[filter.key] = el;
              }}
            >
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === filter.key ? null : filter.key,
                  )
                }
                className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
                  isActive
                    ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {hasSelection ? selectedLabel : filter.label}
                <ChevronDown className="w-3 h-3" />
              </button>

              {activeDropdown === filter.key && (
                <div className="absolute top-full left-0 mt-2 min-w-[180px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-1 max-h-60 overflow-y-auto">
                  {filter.options?.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSelect(filter.key, option.value)}
                      className={clsx(
                        "w-full px-4 py-2 text-left text-sm hover:bg-slate-50",
                        value === option.value
                          ? "text-primary-600 font-medium bg-slate-50"
                          : "text-slate-700",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (filter.type === "input") {
          return (
            <div key={filter.key} className="relative flex items-center">
              {Icon && (
                <div className="absolute left-3 text-slate-400 pointer-events-none">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <input
                type="text"
                placeholder={filter.placeholder || filter.label}
                value={value || ""}
                onChange={(e) => onFilterChange(filter.key, e.target.value)}
                className={clsx(
                  "py-1.5 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all",
                  Icon ? "pl-9" : "pl-3",
                  value ? "pr-8" : "pr-3",
                )}
                style={{ width: value ? "200px" : "140px" }}
              />
              {value && (
                <button
                  onClick={() => onFilterChange(filter.key, "")}
                  className="absolute right-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        }

        // Date Range Picker
        if (filter.type === "date-range") {
          const dateValue = (value as {
            preset?: string;
            from?: string;
            to?: string;
          }) || { preset: "all" };
          const presets = [
            { label: "All Time", value: "all" },
            { label: "Today", value: "today" },
            { label: "Last Day", value: "last_day" },
            { label: "This Week", value: "this_week" },
            { label: "This Month", value: "this_month" },
            { label: "Past 7 Days", value: "7d" },
            { label: "Past 30 Days", value: "30d" },
            { label: "Custom Range", value: "custom" },
          ];

          const getLabel = () => {
            if (
              dateValue.preset === "custom" &&
              dateValue.from &&
              dateValue.to
            ) {
              return `${format(parseISO(dateValue.from), "dd MMM yyyy")} - ${format(parseISO(dateValue.to), "dd MMM yyyy")}`;
            }
            return (
              presets.find((p) => p.value === dateValue.preset)?.label ||
              filter.label
            );
          };

          return (
            <div
              key={filter.key}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[filter.key] = el;
              }}
            >
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === filter.key ? null : filter.key,
                  )
                }
                className={clsx(
                  "flex items-center justify-between gap-2 pl-3 pr-3 py-1.5 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all min-w-[120px]",
                  dateValue.preset !== "all"
                    ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 focus:border-primary-500 font-medium",
                )}
              >
                <span className="truncate">{getLabel()}</span>
                <ChevronDown
                  className={clsx(
                    "w-4 h-4",
                    dateValue.preset !== "all"
                      ? "text-primary-600"
                      : "text-slate-400",
                  )}
                />
              </button>

              {activeDropdown === filter.key && (
                <div className="absolute top-full left-0 mt-2 w-[320px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="py-1">
                    {presets.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => {
                          if (preset.value !== "custom") {
                            handleSelect(filter.key, { preset: preset.value });
                          } else {
                            onFilterChange(filter.key, {
                              ...dateValue,
                              preset: "custom",
                            });
                          }
                        }}
                        className={clsx(
                          "w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                          dateValue.preset === preset.value
                            ? "text-primary-600 bg-primary-50"
                            : "text-slate-700",
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  <div
                    className="border-t border-slate-100 px-3 pt-2 pb-2 bg-slate-50/50"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <DateRangePicker
                      label="Start Date – End Date"
                      value={{
                        startDate: dateValue.from || "",
                        endDate: dateValue.to || "",
                      }}
                      onChange={(range) =>
                        onFilterChange(filter.key, {
                          ...dateValue,
                          preset: "custom",
                          from: range.startDate,
                          to: range.endDate,
                        })
                      }
                      placeholder="Select start & end date"
                      className="mb-0"
                      usePortal
                    />
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (filter.type === "month-select") {
          const selectedMonths = (value as string[]) || [];
          const allSelected = selectedMonths.length === filter.options?.length;
          const label = allSelected
            ? "All months selected"
            : selectedMonths.length === 0
              ? "No months selected"
              : selectedMonths.length === 1
                ? selectedMonths[0]
                : `${selectedMonths.length} months selected`;
          const isActive = selectedMonths.length > 0 && !allSelected;

          return (
            <div
              key={filter.key}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[filter.key] = el;
              }}
            >
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === filter.key ? null : filter.key,
                  )
                }
                className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
                  isActive
                    ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {label}
                <ChevronDown className="w-3 h-3" />
              </button>

              {activeDropdown === filter.key && (
                <div className="absolute top-full left-0 mt-2 min-w-[220px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <button
                    onClick={() => {
                      const allVals = filter.options?.map((o) => o.value) || [];
                      onFilterChange(filter.key, allSelected ? [] : allVals);
                    }}
                    className={clsx(
                      "w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors mb-1 flex items-center justify-between",
                      allSelected
                        ? "bg-primary-50 text-primary-600"
                        : "text-slate-500 hover:bg-slate-50",
                    )}
                  >
                    Select all
                    {allSelected && (
                      <Check className="w-3.5 h-3.5" strokeWidth={3} />
                    )}
                  </button>
                  <div className="h-px bg-slate-100 my-1 mx-1" />
                  <div className="space-y-0.5">
                    {filter.options?.map((option) => {
                      const isChecked = selectedMonths.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            const next = isChecked
                              ? selectedMonths.filter((v) => v !== option.value)
                              : [...selectedMonths, option.value];
                            onFilterChange(filter.key, next);
                          }}
                          className={clsx(
                            "w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between rounded-lg transition-all",
                            isChecked
                              ? "text-primary-600 font-semibold bg-primary-50/30"
                              : "text-slate-600 font-medium",
                          )}
                        >
                          {option.label}
                          <div
                            className={clsx(
                              "w-4 h-4 rounded border transition-all flex items-center justify-center",
                              isChecked
                                ? "bg-primary-600 border-primary-600 shadow-sm"
                                : "border-slate-300 bg-white",
                            )}
                          >
                            {isChecked && (
                              <Check
                                className="w-2.5 h-2.5 text-white"
                                strokeWidth={4}
                              />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        }

        if (filter.type === "date") {
          const dateValue = value || "";
          const displayLabel = dateValue
            ? format(parseISO(dateValue), "dd MMM yyyy")
            : filter.label;
          const isActive = !!dateValue;

          return (
            <div
              key={filter.key}
              className="relative"
              ref={(el) => {
                dropdownRefs.current[filter.key] = el;
              }}
            >
              <button
                onClick={() =>
                  setActiveDropdown(
                    activeDropdown === filter.key ? null : filter.key,
                  )
                }
                className={clsx(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
                  isActive
                    ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {displayLabel}
                <ChevronDown className="w-3 h-3" />
              </button>

              {activeDropdown === filter.key && (
                <div
                  className="absolute top-full left-0 mt-2 min-w-[280px] bg-white rounded-lg shadow-lg border border-slate-200 z-50 p-3 animate-in fade-in slide-in-from-top-1 duration-200"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <DatePicker
                    label={filter.label}
                    value={dateValue}
                    onChange={(nextValue) =>
                      onFilterChange(filter.key, nextValue)
                    }
                    placeholder="Select date"
                    className="mb-0"
                  />
                  {dateValue && (
                    <button
                      onClick={() => {
                        onFilterChange(filter.key, "");
                        setActiveDropdown(null);
                      }}
                      className="mt-1 w-full py-1 text-center text-[10px] font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider border border-rose-100 rounded bg-rose-50/50 transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        }

        return null;
      })}

      {children}
    </div>
  );
}

/** True when FilterBar-style filters have an active (non-default) selection. */
export function hasFilterBarSelection(
  filters: Record<string, unknown>,
): boolean {
  return Object.values(filters).some((value) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      value === "all"
    ) {
      return false;
    }
    if (typeof value === "object" && value !== null && "preset" in value) {
      const preset = (value as { preset?: string }).preset;
      return !!preset && preset !== "all";
    }
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return true;
  });
}

/** Place after the Apply Filters button in filter rows. */
export function ClearAllFiltersButton({
  onClick,
  filters,
  className,
}: {
  onClick: () => void;
  filters: Record<string, unknown>;
  className?: string;
}) {
  if (!hasFilterBarSelection(filters)) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "text-xs text-slate-500 hover:text-slate-800 font-medium px-2",
        className,
      )}
    >
      Clear all
    </button>
  );
}
