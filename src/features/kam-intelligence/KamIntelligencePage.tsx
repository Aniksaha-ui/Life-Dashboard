import { clsx } from "clsx";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { FilterBar, type FilterConfig } from "../../components/FilterBar";
import {
  filterMerchants,
  fmt,
  profiles,
  months,
  type FilterState,
} from "./data";
import { MerchantLedgerTab } from "./components/MerchantLedgerTab";
import { MerchantDetailDrawer } from "./components/MerchantDetailDrawer";
import { SegmentListDrawer } from "./components/SegmentListDrawer";

const segmentOptions = [
  { label: "All Segments", value: "all" },
  ...profiles.map((p) => ({ label: p, value: p })),
];

const riskOptions = [
  { label: "All Action Types", value: "all" },
  { label: "Act Now", value: "Action Now" },
  { label: "Follow Up", value: "Follow Up" },
  { label: "Growth", value: "Growth" },
  { label: "Routine", value: "Routine" },
  { label: "Win-back", value: "Win-back" },
];

const lifecycleOptions = [
  { label: "All Lifecycle Statuses", value: "all" },
  { label: "Active & Growing", value: "Active & Growing" },
  { label: "Watch", value: "Watch" },
  { label: "Declining", value: "Declining" },
];

const trendOptions = [
  { label: "All Trends", value: "all" },
  { label: "Accelerating Growth", value: "Accelerating Growth" },
  { label: "Soft Growth", value: "Soft Growth" },
  { label: "Recovering", value: "Recovering" },
  { label: "Reactivated", value: "Reactivated" },
  { label: "New Active", value: "New Active" },
  { label: "Returning", value: "Returning" },
  { label: "Stable Healthy", value: "Stable Healthy" },
  { label: "Stable Weak", value: "Stable Weak" },
  { label: "Irregular Pattern", value: "Irregular Pattern" },
  { label: "Soft Decline", value: "Soft Decline" },
  { label: "Losing Volume", value: "Losing Volume" },
  { label: "Rapid Fall", value: "Rapid Fall" },
  { label: "Zero Success", value: "Zero Success" },
];

const primaryFilterConfig: FilterConfig[] = [
  {
    key: "search",
    label: "Search",
    type: "input",
    icon: Search,
    placeholder: "Merchant, ID, KAM owner",
  },
  { key: "risk", label: "Action Type", type: "select", options: riskOptions },
  {
    key: "lifecycle",
    label: "Lifecycle Status",
    type: "select",
    options: lifecycleOptions,
  },
  { key: "trend", label: "Trend", type: "select", options: trendOptions },
  {
    key: "profile",
    label: "Portfolio Segment",
    type: "select",
    options: segmentOptions,
  },
];

export default function KamIntelligencePage() {
  const [drawerConfig, setDrawerConfig] = useState<{
    id: number | null;
    mode: "details" | "action";
  }>({
    id: null,
    mode: "details",
  });
  const [segmentFilters, setSegmentFilters] = useState<{
    profile: string | null;
    trend: string | null;
    count: number | null;
  }>({
    profile: null,
    trend: null,
    count: null,
  });
  const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({
    search: "",
    date: months,
    profile: undefined,
    risk: undefined,
    smart: "all",
    sortBy: "riskScore",
    sortDir: "desc",
    lifecycle: undefined,
    trend: undefined,
  });
  const [secondaryFilters, setSecondaryFilters] =
    useState<Record<string, any>>(appliedFilters);

  const handleSecondaryFilterChange = (key: string, value: any) => {
    setSecondaryFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(secondaryFilters);
  };

  const hasUnappliedChanges = useMemo(() => {
    return JSON.stringify(secondaryFilters) !== JSON.stringify(appliedFilters);
  }, [secondaryFilters, appliedFilters]);

  const handleClearFilters = () => {
    const defaultFilters = {
      search: "",
      date: months,
      profile: undefined,
      risk: undefined,
      smart: "all",
      sortBy: "riskScore",
      sortDir: "desc",
      lifecycle: undefined,
      trend: undefined,
    };
    setSecondaryFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const filterState: FilterState = {
    period: appliedFilters.date || "all",
    sector: "All",
    profile: appliedFilters.profile || "all",
    risk: appliedFilters.risk || "all",
    search: appliedFilters.search || "",
    smart: appliedFilters.smart === "all" ? null : appliedFilters.smart || null,
    lifecycle: appliedFilters.lifecycle || "all",
    trend: appliedFilters.trend || "all",
  };

  const data = useMemo(
    () => filterMerchants(filterState),
    [
      appliedFilters.profile,
      appliedFilters.risk,
      appliedFilters.search,
      appliedFilters.smart,
      appliedFilters.lifecycle,
      appliedFilters.trend,
    ],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KAM Actions</h1>
          <p className="text-slate-500 text-sm">
            Performance, portfolio health, risk signals and prioritized KAM
            actions
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <FilterBar
            filters={secondaryFilters}
            onFilterChange={handleSecondaryFilterChange}
            config={primaryFilterConfig}
            layout="grid"
          />

          <button
            onClick={handleApplyFilters}
            disabled={!hasUnappliedChanges}
            className={clsx(
              "flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full transition-all shadow-sm",
              hasUnappliedChanges
                ? "bg-primary-600 hover:bg-primary-700 text-white hover:shadow-md active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200",
            )}
          >
            Apply Filters
          </button>

          {(secondaryFilters.search !== "" ||
            (secondaryFilters.profile !== undefined &&
              secondaryFilters.profile !== "all") ||
            (secondaryFilters.risk !== undefined &&
              secondaryFilters.risk !== "all") ||
            (secondaryFilters.lifecycle !== undefined &&
              secondaryFilters.lifecycle !== "all") ||
            (secondaryFilters.trend !== undefined &&
              secondaryFilters.trend !== "all")) && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Overview Section */}
        <div className="flex flex-col gap-4 pt-6">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {["Action Now", "Follow Up", "Growth", "Routine", "Win-back"].map(
              (g) => {
                const arr = data.filter((m) => m.action === g);
                const sum = arr.reduce((s, m) => s + m.gmv, 0);
                return (
                  <div
                    key={g}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300 hover:shadow-md cursor-pointer text-left"
                  >
                    <p className="text-xs font-semibold text-slate-500 uppercase">
                      {g === "Action Now" ? "Act Now" : g}
                    </p>
                    <p className="text-2xl font-bold mt-2 text-slate-900">
                      {arr.length.toString()}
                    </p>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-2">
        <MerchantLedgerTab
          data={data}
          sortBy={appliedFilters.sortBy}
          sortDir={appliedFilters.sortDir}
          onOpenDrawer={(id, mode) =>
            setDrawerConfig({ id, mode: mode || "details" })
          }
        />
      </div>

      {/* Drawers */}
      <SegmentListDrawer
        filters={segmentFilters}
        onClose={() =>
          setSegmentFilters({ profile: null, trend: null, count: null })
        }
        onOpenMerchant={(id) => {
          setSegmentFilters({ profile: null, trend: null, count: null });
          setDrawerConfig({ id, mode: "details" });
        }}
      />
      <MerchantDetailDrawer
        merchantId={drawerConfig.id}
        mode={drawerConfig.mode}
        onClose={() => setDrawerConfig((prev) => ({ ...prev, id: null }))}
      />
    </div>
  );
}
