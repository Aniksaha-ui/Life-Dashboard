import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

interface HomeFiltersProps {
  queueType: "my" | "all";
  setQueueType: (type: "my" | "all") => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  datePickerRef: React.RefObject<HTMLDivElement | null>;
  setCustomDateRange: (range: { from: string; to: string }) => void;
  tempDateRange: { from: string; to: string };
  setTempDateRange: (range: { from: string; to: string }) => void;
  selectedSector: string;
  setSelectedSector: (sector: string) => void;
  availableSectors?: string[];
  showSectorDropdown: boolean;
  setShowSectorDropdown: (show: boolean) => void;
  sectorDropdownRef: React.RefObject<HTMLDivElement | null>;
  selectedPeriodLabel: string;
  showQueueType?: boolean;
  showPeriod?: boolean;
}

export function HomeFilters({
  queueType,
  setQueueType,
  selectedPeriod,
  setSelectedPeriod,
  showDatePicker,
  setShowDatePicker,
  datePickerRef,
  setCustomDateRange,
  tempDateRange,
  setTempDateRange,
  selectedSector,
  setSelectedSector,
  availableSectors = [],
  showSectorDropdown,
  setShowSectorDropdown,
  sectorDropdownRef,
  selectedPeriodLabel,
  showQueueType = true,
  showPeriod = true,
}: HomeFiltersProps) {
  const sectors = ["All", ...availableSectors];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Merchant Toggle */}
      {showQueueType && (
        <div className="flex items-center bg-white rounded-full border border-slate-200">
          <button
            onClick={() => setQueueType("all")}
            className={clsx(
              "flex items-center px-3 py-2 text-xs font-semibold rounded-full transition-all",
              queueType === "all"
                ? "bg-[#295cab21] text-primary-600"
                : "text-slate-500 hover:text-slate-700 font-medium",
            )}
          >
            All Merchants
          </button>
          <button
            onClick={() => setQueueType("my")}
            className={clsx(
              "flex items-center px-3 py-2 text-xs font-semibold rounded-full transition-all",
              queueType === "my"
                ? "bg-[#295cab21] text-primary-600"
                : "text-slate-500 hover:text-slate-700 font-medium",
            )}
          >
            My Merchants
          </button>
        </div>
      )}

      {/* Period Selector */}
      {showPeriod && (
        <div className="relative" ref={datePickerRef}>
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={clsx(
              "flex items-center justify-between gap-2 pl-3 pr-3 py-2 border rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all min-w-[120px] shadow-sm",
              selectedPeriod !== "all" // Assuming 'all' or default state? Actually looking at code, it seems the button is always "actively" selecting a period. But standard says light blue only if "isActive".
                ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium",
            )}
          >
            <span className="truncate">{selectedPeriodLabel}</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDatePicker && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="py-1">
                {[
                  { value: "today", label: "Today" },
                  { value: "last_day", label: "Last Day" },
                  { value: "this_week", label: "This Week" },
                  { value: "this_month", label: "This Month" },
                  { value: "7d", label: "Past 7 Days" },
                  { value: "30d", label: "Past 30 Days" },
                  { value: "custom", label: "Custom Range" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSelectedPeriod(option.value);
                    }}
                    className={clsx(
                      "w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                      selectedPeriod === option.value
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
                      value={tempDateRange.from}
                      onChange={(e) => {
                        setTempDateRange({
                          ...tempDateRange,
                          from: e.target.value,
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500 mb-0.5">
                      To
                    </label>
                    <input
                      type="date"
                      value={tempDateRange.to}
                      onChange={(e) => {
                        setTempDateRange({
                          ...tempDateRange,
                          to: e.target.value,
                        });
                      }}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-700 focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>
                <button
                  onClick={() => {
                    setCustomDateRange(tempDateRange);
                    setSelectedPeriod("custom");
                    setShowDatePicker(false);
                  }}
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

      {/* Sector Filter */}
      <div className="relative" ref={sectorDropdownRef}>
        <button
          onClick={() => setShowSectorDropdown(!showSectorDropdown)}
          className={clsx(
            "flex items-center justify-between gap-2 pl-3 pr-3 py-2 border rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer shadow-sm transition-all min-w-[120px]",
            selectedSector !== "All"
              ? "bg-[#295cab21] text-primary-600 border-primary-600 font-semibold"
              : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 font-medium",
          )}
        >
          <span className="truncate max-w-[200px]">
            {selectedSector === "All" ? "All Sectors" : selectedSector}
          </span>
          <ChevronDown
            className={clsx(
              "w-4 h-4",
              selectedSector !== "All" ? "text-primary-600" : "text-slate-400",
            )}
          />
        </button>

        {showSectorDropdown && (
          <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200 max-h-[300px] overflow-y-auto">
            <div className="py-1">
              {sectors.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setSelectedSector(s);
                    setShowSectorDropdown(false);
                  }}
                  className={clsx(
                    "w-full text-left px-4 py-2 text-xs font-medium transition-colors hover:bg-slate-50",
                    selectedSector === s
                      ? "text-primary-600 bg-primary-50"
                      : "text-slate-700",
                  )}
                >
                  {s === "All" ? "All Sectors" : s}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
