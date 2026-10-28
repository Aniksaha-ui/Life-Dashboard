import { clsx } from "clsx";
import { useMemo, useState } from "react";
import { filterMerchants, type FilterState } from "../kam-intelligence/data";
import { ProfileTab } from "../kam-intelligence/components/ProfileTab";
import { TrendTab } from "../kam-intelligence/components/TrendTab";
import { ErrorTab } from "../kam-intelligence/components/ErrorTab";
import { SegmentListDrawer } from "../kam-intelligence/components/SegmentListDrawer";
import { MerchantDetailDrawer } from "../kam-intelligence/components/MerchantDetailDrawer";

const tabs = [
  { key: "profile", label: "Segment Explorer" },
  { key: "trend", label: "Trend Analysis" },
  { key: "risk", label: "Error Patterns" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function QRMerchantsAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
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
    month?: string | null;
  }>({
    profile: null,
    trend: null,
    count: null,
    month: null,
  });

  const filterState: FilterState = {
    period: "all",
    sector: "All",
    profile: "all",
    risk: "all",
    search: "",
    smart: null,
    lifecycle: "all",
    trend: "all",
  };

  const data = useMemo(() => filterMerchants(filterState), []);

  const openSegment = (
    profile: string | null,
    trend: string | null = null,
    count: number | null = null,
    month: string | null = null,
  ) => {
    setSegmentFilters({ profile, trend, count, month });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 text-left">
            QR Merchants Analytics
          </h1>
          <p className="text-slate-500 text-sm text-left">
            Deep-dive into QR merchant segments, behavioral trends, and error
            patterns
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2.5 overflow-auto pb-1 flex-shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                "px-4 py-2 text-xs font-bold rounded-full border whitespace-nowrap transition-colors shadow-sm",
                activeTab === tab.key
                  ? "bg-primary-600 border-primary-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "profile" && (
          <ProfileTab
            data={data}
            onOpenDrawer={(id) => setDrawerConfig({ id, mode: "details" })}
            onOpenSegmentDrawer={openSegment}
          />
        )}
        {activeTab === "trend" && (
          <TrendTab onOpenSegmentDrawer={openSegment} />
        )}
        {activeTab === "risk" && <ErrorTab />}
      </div>

      {/* Drawers */}
      <SegmentListDrawer
        filters={segmentFilters}
        onClose={() =>
          setSegmentFilters({
            profile: null,
            trend: null,
            count: null,
            month: null,
          })
        }
        onOpenMerchant={(id) => {
          setSegmentFilters({
            profile: null,
            trend: null,
            count: null,
            month: null,
          });
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
