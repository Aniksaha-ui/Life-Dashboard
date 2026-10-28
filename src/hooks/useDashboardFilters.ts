import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Period options as seen in the UI
 * Today, Last Day, This Week, This Month, Past 7 Days, Past 30 Days
 */
export const getDatesForPeriod = (
  period: string,
  customRange?: { from: string; to: string },
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const to = new Date(); // now
  let from = new Date();
  from.setHours(0, 0, 0, 0);

  const formatDate = (date: Date) => date.toISOString().split("T")[0];

  switch (period) {
    case "today":
      // from = today (already set)
      break;
    case "last_day":
      from.setDate(today.getDate() - 1);
      to.setDate(today.getDate() - 1);
      to.setHours(23, 59, 59, 999);
      break;
    case "this_week":
      // Start of week (Sunday)
      from.setDate(today.getDate() - today.getDay());
      break;
    case "this_month":
      // Start of month
      from.setDate(1);
      break;
    case "7d":
      from.setDate(today.getDate() - 7);
      break;
    case "30d":
      from.setDate(today.getDate() - 30);
      break;
    case "custom":
      if (customRange) {
        return { from: customRange.from, to: customRange.to };
      }
      break;
    default:
      // Default to this month
      from.setDate(1);
  }

  return { from: formatDate(from), to: formatDate(to) };
};

export interface DashboardFiltersParams {
  date_preset: string;
  from_date?: string;
  to_date?: string;
  sector?: string;
  data_type?: "my" | "all";
}

export function useDashboardFilters(initialPeriod = "this_month") {
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [selectedSector, setSelectedSector] = useState("All");
  const [queueType, setQueueType] = useState<"my" | "all">("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    from: "",
    to: "",
  });
  const [tempDateRange, setTempDateRange] = useState({
    from: "",
    to: "",
  });

  // Keep temp range in sync with custom range when picker opens or custom range changes
  useEffect(() => {
    if (showDatePicker) {
      setTempDateRange(customDateRange);
    }
  }, [showDatePicker, customDateRange]);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const sectorDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
      if (
        sectorDropdownRef.current &&
        !sectorDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSectorDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter labels mapping for display
  const periodLabelMap: Record<string, string> = {
    today: "Today",
    last_day: "Last Day",
    this_week: "This Week",
    this_month: "This Month",
    "7d": "Past 7 Days",
    "30d": "Past 30 Days",
    custom: "Custom Range",
  };

  const selectedPeriodLabel = useMemo(() => {
    if (selectedPeriod === "custom") {
      if (customDateRange.from && customDateRange.to) {
        return `${customDateRange.from} - ${customDateRange.to}`;
      }
      return "Custom Range";
    }
    return periodLabelMap[selectedPeriod] || "This Month";
  }, [selectedPeriod, customDateRange, periodLabelMap]);

  const queryParams = useMemo(() => {
    const { from, to } = getDatesForPeriod(selectedPeriod, customDateRange);
    const apiPeriod =
      selectedPeriod === "custom" ? "custom_range" : selectedPeriod;

    const currentParams: DashboardFiltersParams = {
      date_preset: apiPeriod,
      from_date: selectedPeriod === "custom" ? from || undefined : undefined,
      to_date: selectedPeriod === "custom" ? to || undefined : undefined,
      sector: selectedSector === "All" ? undefined : selectedSector,
      data_type: queueType,
    };

    return currentParams;
  }, [selectedPeriod, customDateRange, selectedSector, queueType]);

  return {
    selectedPeriod,
    setSelectedPeriod: (period: string) => {
      setSelectedPeriod(period);
      if (period !== "custom") {
        setCustomDateRange({ from: "", to: "" });
        setTempDateRange({ from: "", to: "" });
        setShowDatePicker(false);
      }
    },
    selectedPeriodLabel,
    selectedSector,
    setSelectedSector,
    queueType,
    setQueueType,
    showDatePicker,
    setShowDatePicker,
    showSectorDropdown,
    setShowSectorDropdown,
    customDateRange,
    setCustomDateRange,
    tempDateRange,
    setTempDateRange,
    datePickerRef,
    sectorDropdownRef,
    queryParams,
  };
}
