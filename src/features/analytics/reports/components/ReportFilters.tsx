// Report Filters - Date range and timezone controls
import { clsx } from "clsx";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReportFilters as Filters } from "../reportApi";
import type { FilterType } from "../reportRegistry";
import {
  MERCHANT_ACTIVITY_SECTOR_OPTIONS,
  MERCHANT_ACTIVITY_STATUS_OPTIONS,
} from "../data/merchantActivityReportData";
import { REVENUE_KAM_OPTIONS } from "../data/revenueReportData";

interface ReportFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  availableFilters?: FilterType[];
  reportId?: string;
}

const sectors = [
  { value: "all", label: "All Sectors" },
  { value: "retail", label: "Retail" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "it", label: "IT & Software" },
  { value: "education", label: "Education" },
  { value: "apparel", label: "Apparel" },
  { value: "healthcare", label: "Healthcare" },
];

const riskySanctionTypes = [
  { value: "all", label: "Select Type" },
  { value: "Customer Name", label: "Customer Name" },
  { value: "Strid", label: "Strid" },
  { value: "Email", label: "Email" },
  { value: "Phone No", label: "Phone No" },
  { value: "City", label: "City" },
];

const reportTypeOptions = [
  { value: "count", label: "Number" },
  { value: "amount", label: "Amount" },
  { value: "revenue", label: "Revenue" },
];

const kamTransactionTrendOptions = [
  { value: "all", label: "All" },
  { value: "amount", label: "Amount" },
  { value: "transaction", label: "Transaction" },
  { value: "revenue", label: "Revenue" },
];

function getTrendOptions(reportId?: string) {
  if (reportId === "kam-transaction-report") {
    return kamTransactionTrendOptions;
  }
  return reportTypeOptions;
}

function getTrendFilterLabel(reportId?: string) {
  if (reportId === "kam-transaction-report") {
    return "Trend";
  }
  return "Report Type";
}

const monthOptions = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

const bankOptions = [
  { value: "all", label: "All Banks" },
  { value: "brac", label: "BRAC Bank" },
  { value: "city", label: "City Bank" },
  { value: "dbbl", label: "Dutch Bangla" },
  { value: "ebl", label: "Eastern Bank" },
];

const revenueTypes = [
  { value: "all", label: "All Types" },
  { value: "commission", label: "Commission" },
  { value: "setup_fee", label: "Setup Fee" },
  { value: "amc", label: "AMC" },
];

const kamRevenueTypeOptions = [
  { value: "kam", label: "Revenue by KAM" },
  { value: "merchant", label: "Revenue by Merchants" },
];

function getRevenueTypeOptions(reportId?: string) {
  if (reportId === "kam-revenue") {
    return kamRevenueTypeOptions;
  }
  return revenueTypes;
}

function getStatusOptions(reportId?: string) {
  if (reportId === "merchant-activity") {
    return [...MERCHANT_ACTIVITY_STATUS_OPTIONS];
  }
  return statusOptions;
}

function getStatusFilterLabel(reportId?: string, status?: string) {
  if (status) {
    return getStatusOptions(reportId).find((s) => s.value === status)?.label;
  }
  if (reportId === "merchant-activity") {
    return "All Status";
  }
  return "Status";
}

function getSectorOptions(reportId?: string) {
  if (reportId === "merchant-activity") {
    return MERCHANT_ACTIVITY_SECTOR_OPTIONS;
  }
  return sectors;
}

const segmentOptions = [
  { value: "all", label: "All Segments" },
  { value: "enterprise", label: "Enterprise" },
  { value: "sme", label: "SME" },
  { value: "micro", label: "Micro" },
  { value: "automobile", label: "Automobile" },
  { value: "retail", label: "Retail" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "it", label: "IT & Software" },
  { value: "education", label: "Education" },
  { value: "fashion", label: "Fashion" },
  { value: "healthcare", label: "Healthcare" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "resolved", label: "Resolved" },
  { value: "escalated", label: "Escalated" },
  { value: "failed", label: "Failed" },
];

const dateRangePresets = [
  { label: "All Time", value: "all" },
  { label: "Today", value: "today" },
  { label: "Last Day", value: "last_day" },
  { label: "This Week", value: "this_week" },
  { label: "This Month", value: "this_month" },
  { label: "Past 7 Days", value: "7d" },
  { label: "Past 30 Days", value: "30d" },
];

const surveyQuestions = [
  {
    value: "referral",
    label:
      "Have you heard about the SSLCOMMERZ Referral Program where you can earn BDT 500 for every business/merchant you refer?",
  },
  {
    value: "satisfaction",
    label: "How satisfied are you with our payment gateway service?",
  },
  {
    value: "safety",
    label: "How safe do your customers feel safe paying through SSLCOMMERZ?",
  },
  {
    value: "recommend",
    label: "How likely are you to recommend our service to others?",
  },
  {
    value: "kam_support",
    label: "How satisfied are you with your Key Account Manager's Support?",
  },
  { value: "kam_name", label: "Provide your Key Account Manager's name" },
  { value: "discovery", label: "How you know about our service?" },
  { value: "collection", label: "How can you collect payment?" },
];

const MAX_CUSTOM_RANGE_MONTHS_BY_REPORT: Record<string, number> = {
  "hunter-wise-merchant-onboarding": 12,
  "kam-transaction-report": 12,
  "sector-wise-onboarding": 12,
  "lead-generation-vas": 12,
  "onboarded-invoice-summary": 1,
};

function clampCustomDateRange(
  reportId: string | undefined,
  filters: Filters,
): Filters {
  const maxMonths = reportId
    ? MAX_CUSTOM_RANGE_MONTHS_BY_REPORT[reportId]
    : undefined;
  if (!maxMonths || !filters.from || !filters.to) return filters;

  const fromDate = new Date(`${filters.from}T00:00:00`);
  const toDate = new Date(`${filters.to}T00:00:00`);

  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return filters;
  }

  if (toDate < fromDate) {
    return { ...filters, to: filters.from };
  }

  const maxToDate = new Date(fromDate);
  maxToDate.setMonth(maxToDate.getMonth() + maxMonths - 1);

  if (toDate > maxToDate) {
    return { ...filters, to: maxToDate.toISOString().split("T")[0] };
  }

  return filters;
}

export function ReportFiltersComponent({
  filters,
  onFiltersChange,
  availableFilters,
  reportId,
}: ReportFiltersProps) {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showSectorDropdown, setShowSectorDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showReportTypeDropdown, setShowReportTypeDropdown] = useState(false);
  const [showQuestionDropdown, setShowQuestionDropdown] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showRevenueDropdown, setShowRevenueDropdown] = useState(false);
  const [showKamDropdown, setShowKamDropdown] = useState(false);
  const [showSegmentDropdown, setShowSegmentDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);

  const dateRef = useRef<HTMLDivElement>(null);
  const sectorRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLDivElement>(null);
  const reportTypeRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const revenueRef = useRef<HTMLDivElement>(null);
  const kamRef = useRef<HTMLDivElement>(null);
  const segmentRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const typeRef = useRef<HTMLDivElement>(null);

  // Default to date if not specified (backward compatibility)
  const enabledFilters = availableFilters || ["date"];

  const updateFilters = (next: Filters) => {
    onFiltersChange(clampCustomDateRange(reportId, next));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false);
      }
      if (
        sectorRef.current &&
        !sectorRef.current.contains(event.target as Node)
      ) {
        setShowSectorDropdown(false);
      }
      if (yearRef.current && !yearRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false);
      }
      if (
        reportTypeRef.current &&
        !reportTypeRef.current.contains(event.target as Node)
      ) {
        setShowReportTypeDropdown(false);
      }
      if (
        questionRef.current &&
        !questionRef.current.contains(event.target as Node)
      ) {
        setShowQuestionDropdown(false);
      }
      if (bankRef.current && !bankRef.current.contains(event.target as Node)) {
        setShowBankDropdown(false);
      }
      if (
        revenueRef.current &&
        !revenueRef.current.contains(event.target as Node)
      ) {
        setShowRevenueDropdown(false);
      }
      if (kamRef.current && !kamRef.current.contains(event.target as Node)) {
        setShowKamDropdown(false);
      }
      if (
        segmentRef.current &&
        !segmentRef.current.contains(event.target as Node)
      ) {
        setShowSegmentDropdown(false);
      }
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
      if (
        monthRef.current &&
        !monthRef.current.contains(event.target as Node)
      ) {
        setShowMonthDropdown(false);
      }
      if (typeRef.current && !typeRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatDateRange = () => {
    if (!filters.from || !filters.to) return "All Time";

    // Check if it matches a preset (simplified for UI)
    const from = new Date(filters.from);
    const to = new Date(filters.to);
    const now = new Date();

    if (
      from.toDateString() === to.toDateString() &&
      from.toDateString() === now.toDateString()
    )
      return "Today";

    return `${from.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${to.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  };

  const handlePresetSelect = (value: string) => {
    const to = new Date();
    const from = new Date();

    switch (value) {
      case "all":
        updateFilters({ ...filters, from: "", to: "" });
        break;
      case "today":
        updateFilters({
          ...filters,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        });
        break;
      case "last_day":
        from.setDate(from.getDate() - 1);
        to.setDate(to.getDate() - 1);
        updateFilters({
          ...filters,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        });
        break;
      case "this_week":
        from.setDate(from.getDate() - from.getDay());
        updateFilters({
          ...filters,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        });
        break;
      case "this_month":
        from.setDate(1);
        updateFilters({
          ...filters,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        });
        break;
      case "7d":
        from.setDate(from.getDate() - 7);
        updateFilters({
          ...filters,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        });
        break;
      case "30d":
        from.setDate(from.getDate() - 30);
        updateFilters({
          ...filters,
          from: from.toISOString().split("T")[0],
          to: to.toISOString().split("T")[0],
        });
        break;
      default:
        break;
    }
    setShowDateDropdown(false);
  };

  const handleSectorSelect = (sector: string) => {
    updateFilters({ ...filters, sector });
    setShowSectorDropdown(false);
  };

  const handleYearSelect = (year: number) => {
    updateFilters({ ...filters, year });
    setShowYearDropdown(false);
  };

  const handleReportTypeSelect = (trendType: string) => {
    updateFilters({ ...filters, trendType });
    setShowReportTypeDropdown(false);
  };

  const handleQuestionSelect = (question: string) => {
    updateFilters({ ...filters, question });
    setShowQuestionDropdown(false);
  };

  const handleBankSelect = (bank: string) => {
    updateFilters({ ...filters, bank });
    setShowBankDropdown(false);
  };

  const handleRevenueSelect = (revenueType: string) => {
    updateFilters({
      ...filters,
      revenueType,
      ...(revenueType === "kam" ? { kam: undefined } : {}),
    });
    setShowRevenueDropdown(false);
  };

  const handleKamSelect = (kam: string) => {
    updateFilters({ ...filters, kam });
    setShowKamDropdown(false);
  };

  const handleSegmentSelect = (segment: string) => {
    updateFilters({ ...filters, segment });
    setShowSegmentDropdown(false);
  };

  const handleStatusSelect = (status: string) => {
    updateFilters({ ...filters, status });
    setShowStatusDropdown(false);
  };

  const handleMonthSelect = (month: string) => {
    // preserve the year if exists
    const currentMonthStr =
      filters.month || new Date().toISOString().slice(0, 7);
    const year = currentMonthStr.split("-")[0];
    updateFilters({ ...filters, month: `${year}-${month}` });
    setShowMonthDropdown(false);
  };

  const handleTypeSelect = (type: string) => {
    updateFilters({ ...filters, type });
    setShowTypeDropdown(false);
  };

  const sectorOptions = getSectorOptions(reportId);
  const currentSector =
    sectorOptions.find((s) => s.value === filters.sector) || sectorOptions[0];

  return (
    <div className="flex items-center gap-3 flex-nowrap shrink-0 overflow-visible">
      {/* Year Picker */}
      {enabledFilters.includes("year") && (
        <div className="relative" ref={yearRef}>
          <button
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.year
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            Year:{" "}
            {filters.year
              ? reportId === "financial-year"
                ? `${filters.year} - ${filters.year + 1}`
                : filters.year
              : reportId === "financial-year"
                ? `${new Date().getFullYear() - 1} - ${new Date().getFullYear()}`
                : new Date().getFullYear()}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showYearDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1">
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - 1 - i,
              ).map((year) => {
                const displayValue =
                  reportId === "financial-year"
                    ? `${year} - ${year + 1}`
                    : year;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                      filters.year === year
                        ? "text-primary-600 font-semibold bg-primary-50/30"
                        : "text-slate-700"
                    }`}
                  >
                    {displayValue}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Month Picker */}
      {enabledFilters.includes("month") && (
        <div className="relative" ref={monthRef}>
          <button
            onClick={() => setShowMonthDropdown(!showMonthDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.month
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            Month:{" "}
            {filters.month
              ? monthOptions.find(
                  (m) => m.value === filters.month?.split("-")[1],
                )?.label || "Month"
              : monthOptions[new Date().getMonth()].label}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showMonthDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-1 max-h-64 overflow-y-auto">
              {monthOptions.map((m) => (
                <button
                  key={m.value}
                  onClick={() => handleMonthSelect(m.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors ${
                    filters.month?.split("-")[1] === m.value
                      ? "text-primary-600 font-semibold bg-primary-50/30"
                      : "text-slate-700"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Question Dropdown */}
      {enabledFilters.includes("question") && (
        <div
          className="relative z-30 shrink-0 max-w-[600px] min-w-[280px]"
          ref={questionRef}
        >
          <button
            onClick={() => setShowQuestionDropdown(!showQuestionDropdown)}
            className={clsx(
              "flex items-center justify-between gap-3 px-3 py-1.5 rounded-full text-sm transition-all border w-full",
              filters.question && filters.question !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            <div className="flex items-center overflow-hidden min-w-0">
              <span className="text-left font-semibold tracking-tight leading-snug truncate">
                {filters.question
                  ? surveyQuestions.find((q) => q.value === filters.question)
                      ?.label
                  : "Select Survey Question to Analyze"}
              </span>
            </div>
            <ChevronDown
              className={clsx(
                "w-3 h-3 flex-shrink-0 text-slate-400 transition-transform duration-200",
                showQuestionDropdown && "rotate-180",
              )}
            />
          </button>

          {showQuestionDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full max-w-[600px] min-w-[320px] bg-white rounded-xl shadow-xl border border-slate-200 z-50 py-2 max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 pb-2 mb-2 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  Available Survey Questions
                </p>
              </div>
              {surveyQuestions.map((q) => (
                <button
                  key={q.value}
                  onClick={() => handleQuestionSelect(q.value)}
                  className={clsx(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors relative group",
                    filters.question === q.value
                      ? "text-primary-600 font-semibold bg-primary-50/50"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span className="leading-snug">{q.label}</span>
                  {filters.question === q.value && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-full" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Date Range Picker */}
      {enabledFilters.includes("date") && (
        <div className="relative z-30 shrink-0" ref={dateRef}>
          <button
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className={clsx(
              "flex items-center justify-between gap-2 pl-3 pr-3 py-1.5 border rounded-full text-sm transition-all min-w-[120px]",
              filters.from && filters.to
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium",
            )}
          >
            <span className="truncate">{formatDateRange()}</span>
            <ChevronDown
              className={clsx(
                "w-4 h-4 transition-transform duration-200",
                filters.from && filters.to
                  ? "text-primary-600"
                  : "text-slate-400",
                showDateDropdown && "rotate-180",
              )}
            />
          </button>

          {showDateDropdown && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="py-1">
                {dateRangePresets.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => handlePresetSelect(preset.value)}
                    className={clsx(
                      "w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                      (preset.value === "all" && !filters.from) ||
                        (preset.value === "today" &&
                          filters.from ===
                            new Date().toISOString().split("T")[0])
                        ? "text-primary-600 bg-primary-50"
                        : "text-slate-700",
                    )}
                  >
                    {preset.label}
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
                      value={filters.from}
                      onChange={(e) =>
                        updateFilters({ ...filters, from: e.target.value })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      To
                    </label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) =>
                        updateFilters({ ...filters, to: e.target.value })
                      }
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sector Dropdown */}
      {enabledFilters.includes("sector") && (
        <div className="relative" ref={sectorRef}>
          <button
            onClick={() => setShowSectorDropdown(!showSectorDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.sector && filters.sector !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            {filters.sector ? currentSector.label : "All Sectors"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSectorDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
              {sectorOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleSectorSelect(s.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.sector === s.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Segment Dropdown */}
      {enabledFilters.includes("segment") && (
        <div className="relative" ref={segmentRef}>
          <button
            onClick={() => setShowSegmentDropdown(!showSegmentDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.segment && filters.segment !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            {filters.segment
              ? segmentOptions.find((s) => s.value === filters.segment)?.label
              : "Segment"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showSegmentDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
              {segmentOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleSegmentSelect(s.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.segment === s.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Store ID Filter */}
      {enabledFilters.includes("store") && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Store ID"
            value={filters.storeId || ""}
            onChange={(e) =>
              updateFilters({ ...filters, storeId: e.target.value })
            }
            className={clsx(
              "pl-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all w-32 focus:w-44",
              filters.storeId ? "pr-8" : "pr-3",
            )}
          />
          {filters.storeId && (
            <button
              onClick={() => updateFilters({ ...filters, storeId: "" })}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Merchant ID Filter */}
      {enabledFilters.includes("merchant") && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Merchant Name / ID"
            value={filters.merchantId || ""}
            onChange={(e) =>
              updateFilters({ ...filters, merchantId: e.target.value })
            }
            className={clsx(
              "pl-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all w-36 focus:w-48",
              filters.merchantId ? "pr-8" : "pr-3",
            )}
          />
          {filters.merchantId && (
            <button
              onClick={() => updateFilters({ ...filters, merchantId: "" })}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Segment Name Filter (Text) */}
      {enabledFilters.includes("segmentName") && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Enter Segment Name"
            value={filters.segmentName || ""}
            onChange={(e) =>
              updateFilters({ ...filters, segmentName: e.target.value })
            }
            className={clsx(
              "pl-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all w-40 focus:w-56",
              filters.segmentName ? "pr-8" : "pr-3",
            )}
          />
          {filters.segmentName && (
            <button
              onClick={() => updateFilters({ ...filters, segmentName: "" })}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Report Type / Trend Type Dropdown */}
      {enabledFilters.includes("trend") && (
        <div className="relative" ref={reportTypeRef}>
          <button
            onClick={() => setShowReportTypeDropdown(!showReportTypeDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.trendType
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            {filters.trendType
              ? `${getTrendFilterLabel(reportId)}: ${getTrendOptions(reportId).find((t) => t.value === filters.trendType)?.label}`
              : getTrendFilterLabel(reportId)}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showReportTypeDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
              {getTrendOptions(reportId).map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleReportTypeSelect(t.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.trendType === t.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bank Dropdown */}
      {enabledFilters.includes("bank") && (
        <div className="relative" ref={bankRef}>
          <button
            onClick={() => setShowBankDropdown(!showBankDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.bank && filters.bank !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            {filters.bank
              ? bankOptions.find((b) => b.value === filters.bank)?.label
              : "Select Bank"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showBankDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
              {bankOptions.map((b) => (
                <button
                  key={b.value}
                  onClick={() => handleBankSelect(b.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.bank === b.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Revenue Type Dropdown */}
      {enabledFilters.includes("revenueType") && (
        <div className="relative" ref={revenueRef}>
          <button
            onClick={() => setShowRevenueDropdown(!showRevenueDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.revenueType && filters.revenueType !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            {filters.revenueType
              ? getRevenueTypeOptions(reportId).find(
                  (r) => r.value === filters.revenueType,
                )?.label
              : "Revenue Type"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showRevenueDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
              {getRevenueTypeOptions(reportId).map((r) => (
                <button
                  key={r.value}
                  onClick={() => handleRevenueSelect(r.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.revenueType === r.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* KAM Dropdown (Revenue Report — merchants view only) */}
      {enabledFilters.includes("kam") &&
        reportId === "kam-revenue" &&
        filters.revenueType !== "kam" && (
          <div className="relative" ref={kamRef}>
            <button
              onClick={() => setShowKamDropdown(!showKamDropdown)}
              className={clsx(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
                filters.kam && filters.kam !== "all"
                  ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
              )}
            >
              {filters.kam
                ? REVENUE_KAM_OPTIONS.find((k) => k.value === filters.kam)
                    ?.label
                : "Select KAM"}
              <ChevronDown className="w-3 h-3" />
            </button>

            {showKamDropdown && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
                {REVENUE_KAM_OPTIONS.map((k) => (
                  <button
                    key={k.value}
                    onClick={() => handleKamSelect(k.value)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                      filters.kam === k.value
                        ? "text-primary-600 font-medium"
                        : "text-slate-700"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Error Description Input */}
      {enabledFilters.includes("errorDescription") && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Error Description"
            value={filters.errorDescription || ""}
            onChange={(e) =>
              updateFilters({ ...filters, errorDescription: e.target.value })
            }
            className={clsx(
              "pl-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all w-48 focus:w-64",
              filters.errorDescription ? "pr-8" : "pr-3",
            )}
          />
          {filters.errorDescription && (
            <button
              onClick={() =>
                updateFilters({ ...filters, errorDescription: "" })
              }
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Tracker ID Input */}
      {enabledFilters.includes("trackerId") && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Tracker ID"
            value={filters.trackerId || ""}
            onChange={(e) =>
              updateFilters({ ...filters, trackerId: e.target.value })
            }
            className={clsx(
              "pl-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all w-36 focus:w-48",
              filters.trackerId ? "pr-8" : "pr-3",
            )}
          />
          {filters.trackerId && (
            <button
              onClick={() => updateFilters({ ...filters, trackerId: "" })}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Status Dropdown */}
      {enabledFilters.includes("status") && (
        <div className="relative" ref={statusRef}>
          <button
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.status && filters.status !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            {getStatusFilterLabel(reportId, filters.status)}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-20 py-2">
              {getStatusOptions(reportId).map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatusSelect(s.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.status === s.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Upload Toggle */}
      {enabledFilters.includes("bulkUpload") && (
        <label
          className={clsx(
            "inline-flex items-center cursor-pointer rounded-full px-3 py-1.5 transition-colors border",
            filters.bulkUpload
              ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
          )}
        >
          <input
            type="checkbox"
            checked={filters.bulkUpload || false}
            onChange={(e) =>
              updateFilters({ ...filters, bulkUpload: e.target.checked })
            }
            className="sr-only peer"
          />
          <span className="text-sm">Bulk Upload</span>
          <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600 ml-2"></div>
        </label>
      )}

      {/* Type Dropdown */}
      {enabledFilters.includes("type") && (
        <div className="relative" ref={typeRef}>
          <button
            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
            className={clsx(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors border",
              filters.type && filters.type !== "all"
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium",
            )}
          >
            Type:{" "}
            {filters.type
              ? riskySanctionTypes.find((t) => t.value === filters.type)?.label
              : "Select Type"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showTypeDropdown && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-50 py-2">
              {riskySanctionTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeSelect(t.value)}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                    filters.type === t.value
                      ? "text-primary-600 font-medium"
                      : "text-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter Value Filter */}
      {enabledFilters.includes("filterValue") && (
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Filter Value"
            value={filters.filterValue || ""}
            onChange={(e) =>
              updateFilters({ ...filters, filterValue: e.target.value })
            }
            className={clsx(
              "pl-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-full text-sm font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all w-48 focus:w-64",
              filters.filterValue ? "pr-8" : "pr-3",
            )}
          />
          {filters.filterValue && (
            <button
              onClick={() => updateFilters({ ...filters, filterValue: "" })}
              className="absolute right-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
