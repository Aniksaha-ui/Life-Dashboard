import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { ChevronRight, Download } from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface KamRevenueReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface KamRevenueReportHandle {
  exportData: () => void;
}

export const KamRevenueReport = forwardRef<
  KamRevenueReportHandle,
  KamRevenueReportProps
>(({ sections, filters }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // State for expanded cards
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

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

  // Filter sections based on filters (e.g. merchantId, sector)
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      // Merchant search
      if (filters.merchantId) {
        const search = filters.merchantId.toLowerCase();
        const matchesId = section.sectionId.toLowerCase().includes(search);
        const matchesName = section.title.toLowerCase().includes(search);
        if (!matchesId && !matchesName) {
          return false;
        }
      }

      // Sector filter
      if (filters.sector && filters.sector !== "all") {
        if (
          section.customData?.sector?.toLowerCase() !==
          filters.sector.toLowerCase()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [sections, filters.merchantId, filters.sector]);

  // Auto-sum summary calculation
  const summary = useMemo(() => {
    let totalTdrBdt = 0;
    let totalBankChargesBdt = 0;
    let totalProfitBdt = 0;

    filteredSections.forEach((section: any) => {
      const data = section.customData;
      if (data) {
        totalTdrBdt += data.tdrBdt || 0;
        totalBankChargesBdt += data.bankChargesBdt || 0;
        totalProfitBdt += data.profitBdt || 0;
      }
    });

    return { totalTdrBdt, totalBankChargesBdt, totalProfitBdt };
  }, [filteredSections]);

  // KAM Summary Calculation
  const kamSummaries = useMemo(() => {
    const groups: Record<string, any> = {};

    filteredSections.forEach((section) => {
      const data = section.customData;
      const kam = data?.kamName || "Unknown";

      if (!groups[kam]) {
        groups[kam] = {
          kamName: kam,
          tdrBdt: 0,
          tdrPct: 0,
          bankChargesBdt: 0,
          bankChargesPct: 0,
          profitBdt: 0,
          profitPct: 0,
          count: 0,
        };
      }

      groups[kam].tdrBdt += data?.tdrBdt || 0;
      groups[kam].tdrPct += data?.tdrPct || 0;
      groups[kam].bankChargesBdt += data?.bankChargesBdt || 0;
      groups[kam].bankChargesPct += data?.bankChargesPct || 0;
      groups[kam].profitBdt += data?.profitBdt || 0;
      groups[kam].profitPct += data?.profitPct || 0;
      groups[kam].count += 1;
    });

    // Calculate averages per KAM
    return Object.values(groups).map((g) => ({
      ...g,
      tdrBdt: g.tdrBdt / g.count,
      tdrPct: g.tdrPct / g.count,
      bankChargesBdt: g.bankChargesBdt / g.count,
      bankChargesPct: g.bankChargesPct / g.count,
      profitBdt: g.profitBdt / g.count,
      profitPct: g.profitPct / g.count,
    }));
  }, [filteredSections]);

  // Export Functionality
  const generateCsvContent = (specificSectionId?: string) => {
    const targetSections = specificSectionId
      ? filteredSections.filter((s) => s.sectionId === specificSectionId)
      : filteredSections;

    if (targetSections.length === 0) return null;

    const headers = [
      "#",
      "Merchant Id",
      "Merchant Name",
      "Sector",
      "Average TDR Rate(BDT)",
      "Average TDR Rate(%)",
      "Average Bank Charges(BDT)",
      "Average Bank Charges(%)",
      "Average Profit(BDT)",
      "Average Profit(%)",
    ];

    const rows = targetSections.map((section, index) => [
      index + 1,
      section.sectionId,
      section.title,
      section.customData?.sector || "",
      section.customData?.tdrBdt || 0,
      section.customData?.tdrPct || 0,
      section.customData?.bankChargesBdt || 0,
      section.customData?.bankChargesPct || 0,
      section.customData?.profitBdt || 0,
      section.customData?.profitPct || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    return csvContent;
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
        const filename = `revenue-report-${filters.from}-to-${filters.to}.csv`;
        downloadCsv(content, filename);
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  const handleMerchantExport = (e: React.MouseEvent, section: any) => {
    e.stopPropagation();
    const content = generateCsvContent(section.sectionId);
    if (content) {
      const filename = `revenue-merchant-${section.sectionId}-${new Date().getTime()}.csv`;
      downloadCsv(content, filename);
    }
  };

  if (filteredSections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No data found for this report.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="space-y-8">
      {/* KAM Summary Section */}
      <div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              {kamSummaries.length === 1
                ? kamSummaries[0].kamName
                : "KAM Summary"}
            </h3>
            <button
              onClick={() => {
                const content = [
                  ["Avg TDR Rate", "Avg Bank Charges", "Avg Profit"].join(","),
                  ...kamSummaries.map((k) =>
                    [
                      `৳ ${k.tdrBdt.toFixed(2)} (${k.tdrPct.toFixed(2)}%)`,
                      `৳ ${k.bankChargesBdt.toFixed(2)} (${k.bankChargesPct.toFixed(2)}%)`,
                      `৳ ${k.profitBdt.toFixed(2)} (${k.profitPct.toFixed(2)}%)`,
                    ].join(","),
                  ),
                ].join("\n");
                const blob = new Blob([content], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `kam-summary-${new Date().toISOString().split("T")[0]}.csv`;
                a.click();
              }}
              className="text-[10px] font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1 uppercase tracking-widest"
            >
              <Download className="w-3 h-3" />
              Export Summary
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                <tr className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                  <th className="px-6 py-3 font-medium text-center">
                    Avg TDR Rate
                  </th>
                  <th className="px-6 py-3 font-medium text-center">
                    Avg Bank Charges
                  </th>
                  <th className="px-6 py-3 font-medium text-center">
                    Avg Profit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 bg-white">
                {kamSummaries.map((kam) => (
                  <tr
                    key={kam.kamName}
                    className="group/row hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-center tabular-nums">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-medium text-slate-900 text-xs">
                          ৳ {kam.tdrBdt.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({kam.tdrPct.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center tabular-nums text-slate-600">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-normal text-slate-900 text-xs">
                          ৳ {kam.bankChargesBdt.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          ({kam.bankChargesPct.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center tabular-nums">
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="font-medium text-primary-600 text-xs">
                          ৳ {kam.profitBdt.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-primary-500/70 font-normal">
                          ({kam.profitPct.toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grand Total Card */}
      <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-6 relative overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-blue-900 leading-tight">
                GRAND TOTAL
              </h2>
              <p className="text-[11px] text-blue-700 font-medium uppercase tracking-wider mt-1">
                Overall Revenue Report Summary
              </p>
            </div>
          </div>

          <div className="flex items-center gap-8 md:gap-12">
            <div className="text-right border-r border-blue-100 pr-8 md:pr-12 last:border-0">
              <div className="text-[10px] text-blue-800/70 mb-1 font-medium uppercase tracking-wider">
                Total TDR(BDT)
              </div>
              <div className="font-medium text-blue-900 text-base leading-tight">
                ৳{" "}
                {summary.totalTdrBdt.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-right border-r border-blue-100 pr-8 md:pr-12 last:border-0">
              <div className="text-[10px] text-blue-800/70 mb-1 font-medium uppercase tracking-wider">
                Total Bank Charges(BDT)
              </div>
              <div className="font-medium text-blue-900 text-base leading-tight">
                ৳{" "}
                {summary.totalBankChargesBdt.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-blue-800/70 mb-1 font-medium uppercase tracking-wider">
                Total Profit(BDT)
              </div>
              <div className="font-medium text-blue-900 text-base leading-tight">
                ৳{" "}
                {summary.totalProfitBdt.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Cards */}
      <div className="space-y-8">
        {filteredSections.map((section) => {
          const data = section.customData;
          return (
            <div
              key={section.sectionId}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group"
            >
              {/* Card Header - Clickable */}
              <div
                onClick={() => toggleExpanded(section.sectionId)}
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {/* Chevron Column */}
                      <div
                        className={`p-1.5 rounded-md transition-all duration-200 shrink-0 ${expanded[section.sectionId] ? "bg-slate-100 rotate-90" : "bg-slate-50 group-hover:bg-slate-100"}`}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>

                      {/* Merchant Name & ID Consolidated */}
                      <div className="flex flex-col py-0.5 group">
                        <div
                          className={`font-medium text-slate-900 leading-tight ${isUnder1400 ? "text-base" : "text-lg"}`}
                        >
                          {section.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                          {section.sectionId}
                          <CopyButton value={section.sectionId} />
                          {data?.sector && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                              {data.sector}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {/* Header Totals */}
                    <div className="hidden sm:flex items-center gap-8">
                      <div className="text-right">
                        <div
                          className={`text-slate-500 mb-0.5 ${isUnder1400 ? "text-[11px]" : "text-xs"}`}
                        >
                          Average Profit
                        </div>
                        <div
                          className={`font-medium text-slate-900 leading-tight flex items-center gap-1.5 justify-end ${isUnder1400 ? "text-[13px]" : "text-base"}`}
                        >
                          <span>
                            ৳{" "}
                            {data?.profitBdt?.toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }) || "0.00"}
                          </span>
                          <span
                            className={`text-slate-500 font-normal ${isUnder1400 ? "text-[10px]" : "text-xs"}`}
                          >
                            ({data?.profitPct?.toFixed(2)}%)
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleMerchantExport(e, section)}
                      className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors self-center"
                      title="Export CSV"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  expanded[section.sectionId]
                    ? "grid-rows-[1fr]"
                    : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-slate-100">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100">
                          <tr className="text-[10px] uppercase tracking-wider font-medium text-slate-400">
                            <th className="px-6 py-3 font-medium text-center">
                              Avg TDR Rate
                            </th>
                            <th className="px-6 py-3 font-medium text-center">
                              Avg Bank Charges
                            </th>
                            <th className="px-6 py-3 font-medium text-center">
                              Avg Profit
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                          <tr className="group/row">
                            <td className="px-6 py-4 text-center tabular-nums">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-medium text-slate-900 leading-tight">
                                  ৳ {data?.tdrBdt?.toFixed(2)}
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  ({data?.tdrPct?.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center tabular-nums text-slate-600">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-normal text-slate-900 leading-tight">
                                  ৳ {data?.bankChargesBdt?.toFixed(2)}
                                </span>
                                <span className="text-[11px] text-slate-500 font-normal">
                                  ({data?.bankChargesPct?.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center tabular-nums">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-medium text-primary-600 leading-tight">
                                  ৳ {data?.profitBdt?.toFixed(2)}
                                </span>
                                <span className="text-[11px] text-primary-500/70 font-normal">
                                  ({data?.profitPct?.toFixed(2)}%)
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

KamRevenueReport.displayName = "KamRevenueReport";
