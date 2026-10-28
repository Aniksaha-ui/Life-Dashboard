import { useState, useEffect } from "react";
import { Drawer } from "../../../components/Drawer";
import { type Merchant, merchants, fmt, actionTagClass } from "../data";
import { clsx } from "clsx";

interface SegmentListDrawerProps {
  filters: {
    profile: string | null;
    trend: string | null;
    count: number | null;
    month?: string | null;
  };
  onClose: () => void;
  onOpenMerchant: (id: number) => void;
}

const HEALTH_TABS: Record<string, string[]> = {
  "Active & Growing": [
    "All",
    "Champion Merchants",
    "Loyal Big Merchants",
    "Loyal Regular Merchants",
    "High Value Irregular Merchants",
    "Potential Up-sell",
    "Stable Merchants",
  ],
  Watch: ["All", "Monitor Closely"],
  Declining: [
    "All",
    "High Risk Big Merchants",
    "Lost Merchants",
    "Inactive Merchants",
  ],
};

export function SegmentListDrawer({
  filters,
  onClose,
  onOpenMerchant,
}: SegmentListDrawerProps) {
  const { profile, trend, month } = filters;
  const [activeSubTab, setActiveSubTab] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const isHealthCategory = profile && HEALTH_TABS[profile];
  const tabs = isHealthCategory ? HEALTH_TABS[profile] : [];

  // Reset sub-tab and page when profile changes
  useEffect(() => {
    if (isHealthCategory && tabs.length > 0) {
      setActiveSubTab("All");
    } else {
      setActiveSubTab(null);
    }
    setCurrentPage(1);
  }, [profile]);

  // Reset page when sub-tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab]);

  const list = (() => {
    const base = merchants.filter((m) => {
      if (!profile && !trend) return false;

      // Handle Health Categories with Sub-Tab Filtering
      if (isHealthCategory) {
        const matchesSubTab =
          !activeSubTab || activeSubTab === "All" || m.segment === activeSubTab;
        let matchesHealth = false;
        if (profile === "Active & Growing")
          matchesHealth =
            m.trend === "Accelerating Growth" || m.trend === "Soft Growth";
        if (profile === "Watch")
          matchesHealth =
            m.segment === "Monitor Closely" || m.trend === "Soft Decline";
        if (profile === "Declining")
          matchesHealth =
            m.trend === "Rapid Fall" || m.trend === "Losing Volume";

        return matchesHealth && matchesSubTab;
      }

      // Default RFM/Trend filtering
      const matchesProfile = !profile || m.segment === profile;
      const matchesTrend = !trend || m.trend === trend;
      return matchesProfile && matchesTrend;
    });

    // If we have any filters active, pad the list to at least 100 items for high-fidelity demo
    if ((profile || trend) && base.length < 100) {
      const needed = 100 - base.length;
      const dummyItems = Array.from({ length: needed }, (_, i) => {
        const id = 10000 + i;
        const segmentName =
          activeSubTab && activeSubTab !== "All"
            ? activeSubTab
            : profile || "Stable Merchants";
        const isRisk =
          profile === "Declining" ||
          segmentName.includes("Risk") ||
          segmentName === "Lost Merchants";

        return {
          id,
          name: `${segmentName} Merchant ${i + 1}`,
          storeId: `st_${id.toString(16)}`,
          gmv: isRisk
            ? 50000 + Math.random() * 500000
            : 500000 + Math.random() * 10000000,
          successRate: isRisk
            ? 10 + Math.random() * 30
            : 60 + Math.random() * 35,
          riskScore: isRisk
            ? 70 + Math.floor(Math.random() * 30)
            : Math.floor(Math.random() * 40),
          action: isRisk
            ? (["Action Now", "Win-back"] as const)[
                Math.floor(Math.random() * 2)
              ]
            : (["Growth", "Follow Up"] as const)[Math.floor(Math.random() * 2)],
          segment: segmentName,
          trend: trend || (isRisk ? "Rapid Fall" : "Soft Growth"),
          month: "May 2026",
          errors: isRisk ? 45 : 4,
        } as Merchant;
      });
      return [...base, ...dummyItems];
    }
    return base;
  })();

  const totalPages = Math.ceil(list.length / itemsPerPage);
  const paginatedList = list.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const title =
    profile && trend
      ? `${profile} | ${trend}`
      : profile || trend || "Segment Merchants";
  const displayCount =
    activeSubTab === "All" && filters.count ? filters.count : list.length;

  const scrollListToTop = () => {
    const scrollEl = document.querySelector(".segment-list-drawer-scroll");
    if (scrollEl) scrollEl.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Drawer
      open={profile !== null || trend !== null}
      onClose={onClose}
      title={title}
      subtitle={
        <span>
          {displayCount.toLocaleString()} merchants found
          {month && (
            <>
              {" "}
              for <strong className="font-bold text-slate-800">{month}</strong>
            </>
          )}
        </span>
      }
      width="xl"
      noPadding
      contentClassName="overflow-hidden flex flex-col"
    >
      <div className="flex flex-col h-full min-h-0 bg-white">
        {isHealthCategory && tabs.length > 1 && (
          <div className="shrink-0 px-6 pt-5 pb-4 bg-white border-b border-slate-100">
            <div className="flex flex-wrap gap-2 p-1 bg-slate-50 border border-slate-100 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={clsx(
                    "px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all uppercase tracking-wider",
                    activeSubTab === tab
                      ? "bg-white text-primary-600 shadow-sm border border-slate-200"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="segment-list-drawer-scroll flex-1 min-h-0 overflow-y-auto px-6 py-4 bg-white">
          {paginatedList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {paginatedList.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => onOpenMerchant(m.id)}
                  className="py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-all px-2 -mx-2 rounded-lg group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-[10px] font-bold text-slate-300 w-8 group-hover:text-primary-400 transition-colors">
                      {((currentPage - 1) * itemsPerPage + idx + 1)
                        .toString()
                        .padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {m.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        ID: {m.storeId} · {fmt(m.gmv)} · SR:{" "}
                        {m.successRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span
                      className={clsx(
                        "px-2.5 py-0.5 text-[10px] font-bold rounded-full border border-opacity-50",
                        actionTagClass(m.action),
                      )}
                    >
                      {m.action}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      Risk {m.riskScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm text-slate-400">
                No {activeSubTab || "merchants"} found in this category.
              </p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-100">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500">
                Page <span className="text-slate-900">{currentPage}</span> of{" "}
                {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((prev) => Math.max(1, prev - 1));
                    scrollListToTop();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                    scrollListToTop();
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
