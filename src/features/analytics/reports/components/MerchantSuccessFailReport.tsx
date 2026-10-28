import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import {
  ChevronRight,
  Download,
  X,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface MerchantSuccessFailReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MerchantSuccessFailReportHandle {
  exportData: () => void;
}

export const MerchantSuccessFailReport = forwardRef<
  MerchantSuccessFailReportHandle,
  MerchantSuccessFailReportProps
>(({ sections, filters }, ref) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hiddenStores, setHiddenStores] = useState<Record<string, Set<string>>>(
    {},
  );

  // Pagination state for stores inside expanded merchants
  const [storePages, setStorePages] = useState<Record<string, number>>({});

  // Pagination state for rows inside each store
  const [storeRowPages, setStoreRowPages] = useState<Record<string, number>>(
    {},
  );

  // Dropdown state for "More" stores
  const [openDropdownMerchantId, setOpenDropdownMerchantId] = useState<
    string | null
  >(null);
  const [storeSearchQuery, setStoreSearchQuery] = useState("");

  // Screen size state for responsive layouts (under 1400px)
  const [isUnder1400, setIsUnder1400] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsUnder1400(window.innerWidth < 1400);
    };
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  // Close stores dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownMerchantId) {
        const target = event.target as HTMLElement;
        if (!target.closest(".dropdown-container")) {
          setOpenDropdownMerchantId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownMerchantId]);

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleStoreVisibility = (merchantId: string, storeId: string) => {
    if (filters.storeId) return;
    setHiddenStores((prev) => {
      const currentHidden = new Set(prev[merchantId] || []);
      if (currentHidden.has(storeId)) {
        currentHidden.delete(storeId);
      } else {
        currentHidden.add(storeId);
      }
      return { ...prev, [merchantId]: currentHidden };
    });
  };

  useEffect(() => {
    setExpanded({});
    setHiddenStores({});
    setStorePages({});
    setStoreRowPages({});
  }, [filters.sector, filters.from, filters.to, filters.merchantId]);

  const isStoreVisible = (merchantId: string, storeId: string) => {
    if (filters.storeId) {
      return storeId.toLowerCase().includes(filters.storeId.toLowerCase());
    }
    return !hiddenStores[merchantId]?.has(storeId);
  };

  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      if (filters.merchantId) {
        const search = filters.merchantId.toLowerCase();
        const matchesId = section.sectionId.toLowerCase().includes(search);
        const matchesName = section.title.toLowerCase().includes(search);
        if (!matchesId && !matchesName) return false;
      }
      if (filters.sector && filters.sector !== "all") {
        const merchantSectors = (section.customData?.sectors || []).map(
          (s: string) => s.toLowerCase(),
        );
        if (!merchantSectors.includes(filters.sector.toLowerCase()))
          return false;
      }
      if (filters.storeId) {
        const stores = section.customData?.stores || [];
        const hasMatchingStore = stores.some((s: any) =>
          s.storeId.toLowerCase().includes(filters.storeId!.toLowerCase()),
        );
        if (!hasMatchingStore) return false;
      }
      return true;
    });
  }, [sections, filters.storeId, filters.merchantId, filters.sector]);

  const MERCHANTS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the filtered result set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSections]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSections.length / MERCHANTS_PER_PAGE),
  );

  const pagedSections = useMemo(() => {
    const start = (currentPage - 1) * MERCHANTS_PER_PAGE;
    return filteredSections.slice(start, start + MERCHANTS_PER_PAGE);
  }, [filteredSections, currentPage]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setExpanded({});
  };

  useEffect(() => {
    if (filters.storeId && filters.storeId.length > 0) {
      const newExpanded: Record<string, boolean> = {};
      pagedSections.forEach((section) => {
        newExpanded[section.sectionId] = true;
      });
      setExpanded(newExpanded);
    }
  }, [filters.storeId, pagedSections]);

  const generateCsvContent = (specificMerchantId?: string) => {
    const rows: any[] = [];
    const headers = [
      "Merchant ID",
      "Merchant Name",
      "Store ID",
      "Date",
      "Success",
      "Pending",
      "Failed",
      "Cancelled",
      "Total Transactions",
    ];

    const targetSections = specificMerchantId
      ? sections.filter((s) => s.sectionId === specificMerchantId)
      : filteredSections;

    targetSections.forEach((merchant) => {
      const stores = merchant.customData?.stores || [];
      stores.forEach((store: any) => {
        if (isStoreVisible(merchant.sectionId, store.storeId)) {
          store.rows.forEach((row: any) => {
            rows.push([
              merchant.sectionId,
              merchant.title,
              store.storeId,
              row.date,
              row.success,
              row.pending,
              row.failed,
              row.cancelled,
              row.totalTransactions,
            ]);
          });
        }
      });
    });

    if (rows.length === 0) return null;

    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const content = generateCsvContent();
      if (content) {
        downloadCsv(
          content,
          `merchant-success-fail-${filters.from}-${filters.to}.csv`,
        );
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  const handleMerchantExport = (
    e: React.MouseEvent,
    merchant: ReportSection,
  ) => {
    e.stopPropagation();
    const content = generateCsvContent(merchant.sectionId);
    if (content) {
      downloadCsv(
        content,
        `merchant-success-fail-${merchant.sectionId}-${filters.from}-${filters.to}.csv`,
      );
    }
  };

  const calculateMerchantTotals = (merchant: ReportSection) => {
    let success = 0;
    let pending = 0;
    let failed = 0;
    let cancelled = 0;
    let total = 0;

    const stores = merchant.customData?.stores || [];
    stores.forEach((store: any) => {
      if (isStoreVisible(merchant.sectionId, store.storeId)) {
        store.rows.forEach((row: any) => {
          success += row.success || 0;
          pending += row.pending || 0;
          failed += row.failed || 0;
          cancelled += row.cancelled || 0;
          total += row.totalTransactions || 0;
        });
      }
    });

    return [
      { label: "Success", value: success },
      { label: "Pending", value: pending },
      { label: "Failed", value: failed },
      { label: "Cancelled", value: cancelled },
      { label: "Total", value: total },
    ];
  };

  if (filteredSections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No merchants found matching the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pagedSections.map((merchant) => {
        const totals = calculateMerchantTotals(merchant);

        return (
          <div
            key={merchant.sectionId}
            className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-200 ${
              openDropdownMerchantId === merchant.sectionId
                ? "overflow-visible"
                : "overflow-hidden"
            }`}
          >
            <div
              onClick={() => toggleExpanded(merchant.sectionId)}
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors rounded-t-xl"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center gap-4">
                    {/* Chevron Column */}
                    <div
                      className={`p-1.5 rounded-md transition-all duration-200 shrink-0 ${expanded[merchant.sectionId] ? "bg-slate-100 rotate-90" : "bg-slate-50 group-hover:bg-slate-100"}`}
                    >
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>

                    {/* Merchant Name & ID Consolidated */}
                    <div className="flex flex-col py-0.5 group">
                      <div
                        className={`font-medium text-slate-900 leading-tight ${isUnder1400 ? "text-base" : "text-lg"}`}
                      >
                        {merchant.title}
                      </div>
                      <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                        {merchant.sectionId}
                        <CopyButton value={merchant.sectionId} />
                        {merchant.customData?.sectors?.length > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                            {merchant.customData.sectors[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pl-11">
                    {(() => {
                      const stores = merchant.customData?.stores || [];
                      let visibleStores = [];
                      let dropdownStores = [];

                      if (filters.storeId) {
                        visibleStores = stores.filter((s: any) =>
                          s.storeId
                            .toLowerCase()
                            .includes(filters.storeId!.toLowerCase()),
                        );
                        dropdownStores = [];
                      } else {
                        const limit = isUnder1400 ? 3 : 5;
                        visibleStores = stores.slice(0, limit);
                        dropdownStores = stores.slice(limit);
                      }

                      return (
                        <>
                          {visibleStores.map((store: any) => {
                            const isHidden = !isStoreVisible(
                              merchant.sectionId,
                              store.storeId,
                            );
                            const matchesFilter =
                              !filters.storeId ||
                              store.storeId
                                .toLowerCase()
                                .includes(filters.storeId.toLowerCase());

                            if (!matchesFilter) {
                              return (
                                <span
                                  key={store.storeId}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
                                >
                                  {store.storeId}
                                </span>
                              );
                            }

                            return (
                              <button
                                key={store.storeId}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleStoreVisibility(
                                    merchant.sectionId,
                                    store.storeId,
                                  );
                                }}
                                disabled={!!filters.storeId}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border transition-all ${
                                  filters.storeId
                                    ? "bg-primary-50 text-primary-700 border-primary-100 cursor-default"
                                    : isHidden
                                      ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                      : "bg-white text-slate-700 border-slate-300 hover:border-primary-400 shadow-sm"
                                }`}
                              >
                                {store.storeId}
                                {!filters.storeId && isHidden && (
                                  <X className="w-3 h-3 ml-1.5 opacity-50" />
                                )}
                              </button>
                            );
                          })}

                          {dropdownStores.length > 0 && (
                            <div className="relative dropdown-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownMerchantId((prev) =>
                                    prev === merchant.sectionId
                                      ? null
                                      : merchant.sectionId,
                                  );
                                  setStoreSearchQuery("");
                                }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-all gap-1 shadow-sm cursor-pointer animate-in fade-in duration-200"
                              >
                                <span>+ {dropdownStores.length} More</span>
                                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                              </button>

                              {openDropdownMerchantId ===
                                merchant.sectionId && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[150] p-3 animate-in fade-in slide-in-from-top-1 duration-200"
                                >
                                  <div className="relative mb-2">
                                    <input
                                      type="text"
                                      placeholder="Search stores..."
                                      value={storeSearchQuery}
                                      onChange={(e) =>
                                        setStoreSearchQuery(e.target.value)
                                      }
                                      className="w-full pl-8 pr-8 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-slate-700"
                                      autoFocus
                                    />
                                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    {storeSearchQuery && (
                                      <button
                                        onClick={() => setStoreSearchQuery("")}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>

                                  {dropdownStores.filter((s: any) =>
                                    s.storeId
                                      .toLowerCase()
                                      .includes(storeSearchQuery.toLowerCase()),
                                  ).length > 0 && (
                                    <div className="flex items-center justify-between px-1 py-1.5 mb-1.5 border-b border-slate-100">
                                      <button
                                        onClick={() => {
                                          const filteredDropdownStores =
                                            dropdownStores.filter((s: any) =>
                                              s.storeId
                                                .toLowerCase()
                                                .includes(
                                                  storeSearchQuery.toLowerCase(),
                                                ),
                                            );
                                          const allVisible =
                                            filteredDropdownStores.every(
                                              (s: any) =>
                                                isStoreVisible(
                                                  merchant.sectionId,
                                                  s.storeId,
                                                ),
                                            );
                                          setHiddenStores((prev) => {
                                            const currentHidden = new Set(
                                              prev[merchant.sectionId] || [],
                                            );
                                            filteredDropdownStores.forEach(
                                              (s: any) => {
                                                if (allVisible) {
                                                  currentHidden.add(s.storeId);
                                                } else {
                                                  currentHidden.delete(
                                                    s.storeId,
                                                  );
                                                }
                                              },
                                            );
                                            return {
                                              ...prev,
                                              [merchant.sectionId]:
                                                currentHidden,
                                            };
                                          });
                                        }}
                                        className="text-xs font-semibold text-primary-600 hover:text-primary-700 cursor-pointer transition-colors"
                                      >
                                        {(() => {
                                          const filteredDropdownStores =
                                            dropdownStores.filter((s: any) =>
                                              s.storeId
                                                .toLowerCase()
                                                .includes(
                                                  storeSearchQuery.toLowerCase(),
                                                ),
                                            );
                                          const allVisible =
                                            filteredDropdownStores.every(
                                              (s: any) =>
                                                isStoreVisible(
                                                  merchant.sectionId,
                                                  s.storeId,
                                                ),
                                            );
                                          return allVisible
                                            ? "Deselect All"
                                            : "Select All";
                                        })()}
                                      </button>
                                      <span className="text-[10px] text-slate-400">
                                        {(() => {
                                          const filteredDropdownStores =
                                            dropdownStores.filter((s: any) =>
                                              s.storeId
                                                .toLowerCase()
                                                .includes(
                                                  storeSearchQuery.toLowerCase(),
                                                ),
                                            );
                                          const selectedCount =
                                            filteredDropdownStores.filter(
                                              (s: any) =>
                                                isStoreVisible(
                                                  merchant.sectionId,
                                                  s.storeId,
                                                ),
                                            ).length;
                                          return `${selectedCount}/${filteredDropdownStores.length} Selected`;
                                        })()}
                                      </span>
                                    </div>
                                  )}

                                  <div className="max-h-80 overflow-y-auto space-y-0.5 pr-1">
                                    {dropdownStores
                                      .filter((s: any) =>
                                        s.storeId
                                          .toLowerCase()
                                          .includes(
                                            storeSearchQuery.toLowerCase(),
                                          ),
                                      )
                                      .map((store: any) => {
                                        const isHidden = !isStoreVisible(
                                          merchant.sectionId,
                                          store.storeId,
                                        );
                                        const storeTx = store.rows.reduce(
                                          (sum: number, row: any) =>
                                            sum + (row.totalTransactions || 0),
                                          0,
                                        );

                                        return (
                                          <button
                                            key={store.storeId}
                                            onClick={() => {
                                              toggleStoreVisibility(
                                                merchant.sectionId,
                                                store.storeId,
                                              );
                                            }}
                                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                                              isHidden
                                                ? "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                                : "text-slate-700 hover:bg-slate-50"
                                            }`}
                                          >
                                            <span className="truncate mr-2">
                                              {store.storeId}
                                            </span>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                              <span className="text-[10px] text-slate-400 font-normal">
                                                {storeTx} Tnx
                                              </span>
                                              <div
                                                className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                  isHidden
                                                    ? "border-slate-300"
                                                    : "border-primary-600 bg-primary-600 text-white"
                                                }`}
                                              >
                                                {!isHidden && (
                                                  <Check className="w-3 h-3 stroke-[3]" />
                                                )}
                                              </div>
                                            </div>
                                          </button>
                                        );
                                      })}
                                    {dropdownStores.filter((s: any) =>
                                      s.storeId
                                        .toLowerCase()
                                        .includes(
                                          storeSearchQuery.toLowerCase(),
                                        ),
                                    ).length === 0 && (
                                      <div className="text-center py-4 text-xs text-slate-400">
                                        No stores found
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex items-center gap-8">
                    {totals.map((item, idx) => (
                      <div key={idx} className="text-right">
                        <div
                          className={`text-slate-500 mb-0.5 whitespace-nowrap font-medium ${isUnder1400 ? "text-[11px]" : "text-xs"}`}
                        >
                          {item.label}
                        </div>
                        <div
                          className={`font-medium leading-tight text-slate-900 ${isUnder1400 ? "text-[13px]" : "text-base"}`}
                        >
                          {item.value.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={(e) => handleMerchantExport(e, merchant)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors self-center"
                    title="Export CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded[merchant.sectionId] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                  <div className="space-y-6">
                    {(() => {
                      const visibleStores = (
                        merchant.customData?.stores || []
                      ).filter((store: any) =>
                        isStoreVisible(merchant.sectionId, store.storeId),
                      );
                      const limit = isUnder1400 ? 3 : 5;
                      const STORES_PER_PAGE =
                        Math.min(visibleStores.length, limit) || 3;
                      const storePage = storePages[merchant.sectionId] || 1;
                      const totalStorePages = Math.max(
                        1,
                        Math.ceil(visibleStores.length / STORES_PER_PAGE),
                      );
                      const pagedStores = visibleStores.slice(
                        (storePage - 1) * STORES_PER_PAGE,
                        storePage * STORES_PER_PAGE,
                      );

                      return (
                        <>
                          {pagedStores.map((store: any) => {
                            let sSuccess = 0;
                            let sPending = 0;
                            let sFailed = 0;
                            let sCancelled = 0;
                            let sTotal = 0;

                            store.rows.forEach((row: any) => {
                              sSuccess += row.success || 0;
                              sPending += row.pending || 0;
                              sFailed += row.failed || 0;
                              sCancelled += row.cancelled || 0;
                              sTotal += row.totalTransactions || 0;
                            });

                            const storeKey = `${merchant.sectionId}_${store.storeId}`;
                            const rowPage = storeRowPages[storeKey] || 1;
                            const ROWS_PER_PAGE = 7;
                            const totalRowPages = Math.max(
                              1,
                              Math.ceil(store.rows.length / ROWS_PER_PAGE),
                            );
                            const pagedRows = store.rows.slice(
                              (rowPage - 1) * ROWS_PER_PAGE,
                              rowPage * ROWS_PER_PAGE,
                            );

                            return (
                              <div
                                key={store.storeId}
                                className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                              >
                                <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                  <span
                                    className={`font-medium text-slate-700 ${isUnder1400 ? "text-xs" : "text-sm"}`}
                                  >
                                    {store.storeId}
                                  </span>
                                  <div
                                    className={`flex gap-4 text-slate-500 font-medium ${isUnder1400 ? "text-[11px]" : "text-xs"}`}
                                  >
                                    <span className="text-slate-900 font-medium whitespace-nowrap">
                                      {sSuccess.toLocaleString()} Success
                                    </span>
                                    <span className="text-slate-900 font-medium whitespace-nowrap">
                                      {sPending.toLocaleString()} Pending
                                    </span>
                                    <span className="text-slate-900 font-medium whitespace-nowrap">
                                      {sFailed.toLocaleString()} Failed
                                    </span>
                                    <span className="text-slate-900 font-medium whitespace-nowrap">
                                      {sCancelled.toLocaleString()} Cancelled
                                    </span>
                                    <span className="text-slate-900 font-medium whitespace-nowrap">
                                      {sTotal.toLocaleString()} Total
                                    </span>
                                  </div>
                                </div>
                                <table
                                  className={`w-full text-left ${isUnder1400 ? "text-xs" : "text-sm"}`}
                                >
                                  <thead className="bg-white text-slate-500 border-b border-slate-100">
                                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                      <th className="px-4 py-2 font-medium">
                                        Date
                                      </th>
                                      <th className="px-4 py-2 font-medium text-right">
                                        Success
                                      </th>
                                      <th className="px-4 py-2 font-medium text-right">
                                        Pending
                                      </th>
                                      <th className="px-4 py-2 font-medium text-right">
                                        Failed
                                      </th>
                                      <th className="px-4 py-2 font-medium text-right">
                                        Cancelled
                                      </th>
                                      <th className="px-4 py-2 font-medium text-right">
                                        Transaction
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {pagedRows.map((row: any, idx: number) => (
                                      <tr
                                        key={idx}
                                        className="hover:bg-slate-50/50"
                                      >
                                        <td className="px-4 py-2 text-slate-600 whitespace-nowrap font-medium">
                                          {row.date}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-slate-900 font-medium">
                                          {row.success}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-slate-900 font-medium">
                                          {row.pending}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-slate-900 font-medium">
                                          {row.failed}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-slate-900 font-medium">
                                          {row.cancelled}
                                        </td>
                                        <td className="px-4 py-2 text-right tabular-nums text-slate-900 font-medium">
                                          {row.totalTransactions}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                {totalRowPages > 1 && (
                                  <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-t border-slate-100">
                                    <div className="text-[11px] text-slate-500 font-medium">
                                      Showing{" "}
                                      {(rowPage - 1) * ROWS_PER_PAGE + 1} to{" "}
                                      {Math.min(
                                        rowPage * ROWS_PER_PAGE,
                                        store.rows.length,
                                      )}{" "}
                                      of {store.rows.length} transactions
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        className="px-2 py-0.5 text-[11px] border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                                        onClick={() =>
                                          setStoreRowPages((prev) => ({
                                            ...prev,
                                            [storeKey]: rowPage - 1,
                                          }))
                                        }
                                        disabled={rowPage === 1}
                                      >
                                        Previous
                                      </button>
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        Page {rowPage} of {totalRowPages}
                                      </span>
                                      <button
                                        className="px-2 py-0.5 text-[11px] border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                                        onClick={() =>
                                          setStoreRowPages((prev) => ({
                                            ...prev,
                                            [storeKey]: rowPage + 1,
                                          }))
                                        }
                                        disabled={rowPage === totalRowPages}
                                      >
                                        Next
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {totalStorePages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                              <div className="text-xs text-slate-500 font-medium">
                                Showing {(storePage - 1) * STORES_PER_PAGE + 1}{" "}
                                to{" "}
                                {Math.min(
                                  storePage * STORES_PER_PAGE,
                                  visibleStores.length,
                                )}{" "}
                                of {visibleStores.length} stores
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                                  onClick={() =>
                                    setStorePages((prev) => ({
                                      ...prev,
                                      [merchant.sectionId]: storePage - 1,
                                    }))
                                  }
                                  disabled={storePage === 1}
                                >
                                  Previous
                                </button>
                                <span className="text-xs text-slate-500 font-medium">
                                  Page {storePage} of {totalStorePages}
                                </span>
                                <button
                                  className="px-2.5 py-1 text-xs border border-slate-200 rounded bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                                  onClick={() =>
                                    setStorePages((prev) => ({
                                      ...prev,
                                      [merchant.sectionId]: storePage + 1,
                                    }))
                                  }
                                  disabled={storePage === totalStorePages}
                                >
                                  Next
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {/* ── Pagination Bar ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-2 pt-4">
        <div className="flex-1 text-sm text-slate-500">
          {(() => {
            const total = filteredSections.length;
            if (total === 0) return "";
            const from = (currentPage - 1) * MERCHANTS_PER_PAGE + 1;
            const to = Math.min(currentPage * MERCHANTS_PER_PAGE, total);
            return `Showing ${from} to ${to} of ${total} entries`;
          })()}
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-colors"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-sm text-slate-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-white disabled:opacity-50 transition-colors"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
});

MerchantSuccessFailReport.displayName = "MerchantSuccessFailReport";
