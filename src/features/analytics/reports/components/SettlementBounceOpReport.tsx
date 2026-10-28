import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { ChevronRight, Download, X } from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import { clsx } from "clsx";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface SettlementBounceOpReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface SettlementBounceOpReportHandle {
  exportData: () => void;
}

export const SettlementBounceOpReport = forwardRef<
  SettlementBounceOpReportHandle,
  SettlementBounceOpReportProps
>(({ sections, filters }, ref) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [hiddenStores, setHiddenStores] = useState<Record<string, Set<string>>>(
    {},
  );

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

  // ── Pagination ────────────────────────────────────────────────────────
  const MERCHANTS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 whenever the filtered result set changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    filteredSections.length,
    filters.merchantId,
    filters.sector,
    filters.storeId,
  ]);

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
    // Collapse all expanded cards when switching pages
    setExpanded({});
  };

  // Auto-expand on Store ID search match
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
      "KAM",
      "Transaction Date",
      "Reference Code",
      "Description",
      "Amount",
      "Nature",
      "Tracker",
      "Status",
    ];

    const targetSections = specificMerchantId
      ? sections.filter((s) => s.sectionId === specificMerchantId)
      : filteredSections;

    targetSections.forEach((merchant) => {
      const stores = merchant.customData?.stores || [];
      stores.forEach((store: any) => {
        if (isStoreVisible(merchant.sectionId, store.storeId)) {
          store.bounceList.forEach((item: any) => {
            rows.push([
              merchant.sectionId,
              merchant.title,
              store.storeId,
              item.kam,
              item.transactionDate,
              item.referenceCode,
              item.currentDesc,
              item.credit,
              item.natureType,
              item.tracker,
              item.status,
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
          `settlement-bounce-operation-${filters.from}-${filters.to}.csv`,
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
        `settlement-bounce-operation-${merchant.sectionId}-${filters.from}-${filters.to}.csv`,
      );
    }
  };

  const calculateMerchantTotals = (merchant: ReportSection) => {
    let totalCredit = 0;
    let totalRecords = 0;

    const stores = merchant.customData?.stores || [];
    stores.forEach((store: any) => {
      if (isStoreVisible(merchant.sectionId, store.storeId)) {
        store.bounceList.forEach((item: any) => {
          totalCredit += parseFloat(item.credit) || 0;
          totalRecords++;
        });
      }
    });

    return {
      totalCredit: `৳ ${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      totalRecords,
    };
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
        const { totalCredit, totalRecords } = calculateMerchantTotals(merchant);

        return (
          <div
            key={merchant.sectionId}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div
              onClick={() => toggleExpanded(merchant.sectionId)}
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors group"
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

                  <div className="flex flex-wrap gap-2 pl-11">
                    {merchant.customData?.stores.map((store: any) => {
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
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-50 text-slate-300 border border-slate-100 cursor-not-allowed"
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
                          className={clsx(
                            "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all",
                            filters.storeId
                              ? "bg-primary-50 text-primary-700 border-primary-100 cursor-default"
                              : isHidden
                                ? "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                                : "bg-white text-slate-700 border-slate-300 hover:border-primary-400 shadow-sm",
                          )}
                        >
                          {store.storeId}
                          {!filters.storeId && isHidden && (
                            <X className="w-3 h-3 ml-1.5 opacity-50" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="hidden sm:flex items-center gap-8">
                    <div className="text-right">
                      <div
                        className={`text-slate-500 mb-0.5 font-medium uppercase tracking-wider ${isUnder1400 ? "text-[11px]" : "text-xs"}`}
                      >
                        Total Credit{" "}
                        <span className="text-[10px] opacity-60 font-normal">
                          ({totalRecords} Records)
                        </span>
                      </div>
                      <div
                        className={`font-bold text-slate-900 leading-tight tabular-nums ${isUnder1400 ? "text-[13px]" : "text-lg"}`}
                      >
                        {totalCredit}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleMerchantExport(e, merchant)}
                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                    title="Export CSV"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div
              className={clsx(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                expanded[merchant.sectionId]
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-100 bg-slate-50/50 p-6">
                  <div className="space-y-6">
                    {merchant.customData?.stores.map((store: any) => {
                      if (!isStoreVisible(merchant.sectionId, store.storeId))
                        return null;

                      const storeCredit = store.bounceList.reduce(
                        (acc: number, curr: any) =>
                          acc + (parseFloat(curr.credit) || 0),
                        0,
                      );

                      return (
                        <div
                          key={store.storeId}
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                        >
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                            <span className="font-medium text-sm text-slate-700">
                              {store.storeId}
                            </span>
                            <div className="flex gap-4 text-xs text-slate-500 font-medium">
                              <span className="whitespace-nowrap">
                                {store.bounceList.length} Records
                              </span>
                              <span className="text-slate-900 whitespace-nowrap">
                                ৳{" "}
                                {storeCredit.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border-collapse min-w-[1200px]">
                              <thead>
                                <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-medium border-b border-slate-100 bg-white">
                                  <th className="px-4 py-2 font-medium">Kam</th>
                                  <th className="px-4 py-2 font-medium">
                                    Reference Code
                                  </th>
                                  <th className="px-4 py-2 font-medium">
                                    Description
                                  </th>
                                  <th className="px-4 py-2 font-medium text-right">
                                    Amount (Credit/Debit)
                                  </th>
                                  <th className="px-4 py-2 font-medium">
                                    Nature / Status
                                  </th>
                                  <th className="px-4 py-2 font-medium">
                                    Tracker
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50 bg-white">
                                {store.bounceList.map(
                                  (item: any, idx: number) => (
                                    <tr
                                      key={idx}
                                      className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                      <td className="px-4 py-2 align-top">
                                        <div className="flex flex-col gap-1">
                                          <div className="text-slate-700 font-medium whitespace-nowrap">
                                            {item.kam}
                                          </div>
                                          <div className="text-slate-400 text-[10px] font-medium whitespace-nowrap">
                                            {item.transactionDate}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 align-top">
                                        <div className="flex flex-col gap-1.5 min-w-[180px]">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                              Code:
                                            </span>
                                            <span className="text-slate-700 font-medium text-[11px]">
                                              {item.code}
                                            </span>
                                          </div>
                                          <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                              Original Code:
                                            </span>
                                            <div className="flex items-center gap-1">
                                              <span className="text-[11px] font-medium text-slate-900 break-all uppercase leading-tight bg-slate-100 px-1.5 py-0.5 rounded inline-block w-fit">
                                                {item.originalCode}
                                              </span>
                                              <CopyButton
                                                value={item.originalCode}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 align-top">
                                        <div className="flex flex-col gap-2 min-w-[300px]">
                                          <div className="text-[11px] leading-relaxed font-medium">
                                            <span className="text-slate-900 mr-2 uppercase text-[10px] font-bold">
                                              Current:
                                            </span>
                                            <span className="text-slate-700 uppercase">
                                              {item.currentDesc}
                                            </span>
                                          </div>
                                          <div className="text-[11px] leading-relaxed">
                                            <span className="font-bold text-slate-900 mr-2 uppercase text-[10px]">
                                              Original:
                                            </span>
                                            <span className="text-slate-500 font-medium italic">
                                              {item.originalDesc}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap align-top">
                                        <div className="flex flex-col gap-1 text-right tabular-nums">
                                          <div className="flex justify-end gap-2 items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                              Credit:
                                            </span>
                                            <span className="text-slate-900 font-medium text-sm">
                                              {item.credit}
                                            </span>
                                          </div>
                                          <div className="flex justify-end gap-2 items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                              Debit:
                                            </span>
                                            <span className="text-slate-400 font-medium">
                                              {item.debit}
                                            </span>
                                          </div>
                                          <div className="flex justify-end gap-2 items-center">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                              Balance:
                                            </span>
                                            <span className="text-slate-900 font-medium text-[11px]">
                                              ৳ {item.balance}
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap align-top">
                                        <div className="flex flex-col gap-1.5">
                                          <div className="flex flex-col">
                                            <span className="text-slate-900 text-xs leading-tight">
                                              {item.natureType}
                                            </span>
                                            <span className="text-slate-900 text-xs leading-tight">
                                              {item.natureSub}
                                            </span>
                                          </div>
                                          <span
                                            className={clsx(
                                              "px-2 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider w-fit",
                                              item.status === "Assigned"
                                                ? "bg-primary-50 text-primary-600 border border-primary-100"
                                                : "bg-amber-50 text-amber-600 border border-amber-100",
                                            )}
                                          >
                                            {item.status}
                                          </span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap align-top font-medium text-slate-500 text-[10px] tabular-nums">
                                        {item.tracker}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
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

SettlementBounceOpReport.displayName = "SettlementBounceOpReport";
