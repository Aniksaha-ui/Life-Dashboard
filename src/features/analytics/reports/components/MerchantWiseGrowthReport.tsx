import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { ChevronRight } from "lucide-react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface MerchantWiseGrowthReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface MerchantWiseGrowthReportHandle {
  exportData: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const MerchantWiseGrowthReport = forwardRef<
  MerchantWiseGrowthReportHandle,
  MerchantWiseGrowthReportProps
>(({ sections, filters }, ref) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"merchant" | "segment">("merchant");
  const [monthPages, setMonthPages] = useState<Record<string, number>>({});

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setExpanded({});
    setMonthPages({});
  }, [
    filters.sector,
    filters.from,
    filters.to,
    filters.merchantId,
    filters.segment,
    viewMode,
  ]);

  // Filter based on filters and viewMode
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      // First filter by viewMode
      const isMerchantRecord = section.sectionId.startsWith("M-");
      const isSegmentRecord = section.sectionId.startsWith("SEG-");

      if (viewMode === "merchant" && !isMerchantRecord) return false;
      if (viewMode === "segment" && !isSegmentRecord) return false;

      // If no type specified, default depends on viewMode
      if (!section.customData?.type && viewMode === "segment") {
        return false;
      }

      if (filters.merchantId && viewMode === "merchant") {
        const search = filters.merchantId.toLowerCase();
        if (
          !section.title.toLowerCase().includes(search) &&
          !section.sectionId.toLowerCase().includes(search)
        ) {
          return false;
        }
      }

      if (filters.segment && viewMode === "segment") {
        if (section.title.toLowerCase() !== filters.segment.toLowerCase()) {
          return false;
        }
      }

      if (
        filters.sector &&
        filters.sector !== "all" &&
        viewMode === "merchant"
      ) {
        if (
          section.customData?.sector?.toLowerCase() !==
          filters.sector.toLowerCase()
        ) {
          return false;
        }
      }

      return true;
    });
  }, [sections, filters.merchantId, filters.segment, filters.sector, viewMode]);

  // Export Functionality
  const generateCsvContent = () => {
    const rows: any[] = [];

    // Build Headers
    const headerRow1 = ["#", "Merchant", "Segment"];
    MONTHS.forEach((month) => {
      headerRow1.push(month, "", "", "");
    });
    headerRow1.push("GRAND TOTAL", "", "", "");

    const headerRow2 = ["", "", ""];
    MONTHS.forEach(() => {
      headerRow2.push("Number", "Account", "Revenue", "MOM Growth");
    });
    headerRow2.push("Number", "Account", "Revenue", "MOM Growth");

    filteredSections.forEach((section, index) => {
      const isMerchant = section.sectionId.startsWith("M-");
      const row = [
        index + 1,
        isMerchant ? section.title : "",
        isMerchant ? section.customData?.segment || "" : section.title,
      ];

      let grandTotalNumber = 0;
      let grandTotalAmount = 0;
      let grandTotalRevenue = 0;
      const monthlyData = section.customData?.monthlyData || {};

      MONTHS.forEach((month) => {
        const data = monthlyData[month] || {
          revenue: 0,
          count: 0,
          amount: 0,
          momGrowth: "0%",
        };
        row.push(
          data.count || 0,
          data.amount ? data.amount.toFixed(2) : "0",
          data.revenue ? data.revenue.toFixed(2) : "0",
          data.momGrowth,
        );
        grandTotalNumber += data.count || 0;
        grandTotalAmount += data.amount || 0;
        grandTotalRevenue += data.revenue || 0;
      });

      row.push(
        grandTotalNumber,
        grandTotalAmount.toFixed(2),
        grandTotalRevenue.toFixed(2),
        "",
      );

      rows.push(row);
    });

    if (rows.length === 0) return null;

    const csvContent = [
      headerRow1.join(","),
      headerRow2.join(","),
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
        const filename = `${viewMode}-growth-${filters.year || new Date().getFullYear()}.csv`;
        downloadCsv(content, filename);
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (filteredSections.length === 0) {
    return (
      <div className="space-y-6">
        {/* View Toggle */}
        <div className="flex bg-blue-100/30 p-1 rounded-lg border border-blue-100 w-fit">
          <button
            onClick={() => setViewMode("merchant")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "merchant" ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-600/70 hover:text-blue-700 hover:bg-white/50"}`}
          >
            By Merchant
          </button>
          <button
            onClick={() => setViewMode("segment")}
            className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${viewMode === "segment" ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-600/70 hover:text-blue-700 hover:bg-white/50"}`}
          >
            By Segment
          </button>
        </div>

        <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          No {viewMode}s found matching the current filters.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grand Total Card */}
      {(() => {
        let grandTotalRevenue = 0;

        filteredSections.forEach((section) => {
          MONTHS.forEach((m) => {
            const d = section.customData?.monthlyData?.[m];
            if (d) {
              grandTotalRevenue += d.revenue || 0;
            }
          });
        });

        // Pagination configuration for Grand Total
        const MERCHANTS_PER_PAGE = 10;
        const grandTotalPage = monthPages["grand-total"] || 1;
        const grandTotalPages = Math.max(
          1,
          Math.ceil(filteredSections.length / MERCHANTS_PER_PAGE),
        );
        const pagedGrandTotalSections = filteredSections.slice(
          (grandTotalPage - 1) * MERCHANTS_PER_PAGE,
          grandTotalPage * MERCHANTS_PER_PAGE,
        );

        return (
          <div className="bg-blue-50/40 rounded-xl border border-blue-200 shadow-sm overflow-hidden text-blue-900 mb-8 font-sans">
            <div
              onClick={() => toggleExpanded("grand-total")}
              className="px-6 py-5 cursor-pointer hover:bg-blue-100/50 transition-colors border-b border-blue-200 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 p-1.5 rounded-md transition-all duration-200 ${expanded["grand-total"] ? "bg-blue-200/60 rotate-90" : "bg-blue-100/60 group-hover:bg-blue-200/60"}`}
                >
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg font-bold text-blue-900 leading-none tracking-tight uppercase">
                    GRAND TOTAL{" "}
                    <span className="font-light opacity-70 text-sm ml-1">
                      (All Months)
                    </span>
                  </h3>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-wider font-semibold text-blue-800/70 mb-0.5">
                        Total Revenue
                      </div>
                      <div className="font-bold text-blue-900 text-base leading-tight">
                        ৳{" "}
                        {grandTotalRevenue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded["grand-total"] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-100/50 text-blue-800 border-b border-blue-200">
                      <tr className="text-[10px] uppercase tracking-wider font-semibold">
                        <th className="px-6 py-3 font-semibold w-16 text-center">
                          #
                        </th>
                        <th className="px-6 py-3 font-semibold">Merchant</th>
                        <th className="px-6 py-3 font-semibold">Segment</th>
                        <th className="px-6 py-3 font-semibold text-right">
                          Number
                        </th>
                        <th className="px-6 py-3 font-semibold text-right">
                          Account
                        </th>
                        <th className="px-6 py-3 font-semibold text-right">
                          Total Revenue
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {pagedGrandTotalSections.map((section, index) => {
                        let totalNumber = 0;
                        let totalAmount = 0;
                        let totalRevenue = 0;

                        MONTHS.forEach((m) => {
                          const d = section.customData?.monthlyData?.[m];
                          if (d) {
                            totalNumber += d.count || 0;
                            totalAmount += d.amount || 0;
                            totalRevenue += d.revenue || 0;
                          }
                        });

                        const isMerchant = section.sectionId.startsWith("M-");

                        return (
                          <tr
                            key={section.sectionId}
                            className="hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-6 py-3 text-center text-blue-500 font-medium">
                              {(grandTotalPage - 1) * MERCHANTS_PER_PAGE +
                                index +
                                1}
                            </td>
                            <td className="px-6 py-3">
                              {isMerchant ? (
                                <div className="flex flex-col gap-1">
                                  {section.customData?.sector && (
                                    <div className="flex">
                                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100/50 text-blue-600 uppercase tracking-wider leading-none">
                                        {section.customData.sector}
                                      </span>
                                    </div>
                                  )}
                                  <div className="font-semibold text-blue-950 leading-tight">
                                    {section.title}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-blue-400 font-medium">
                                  -
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3 font-medium text-blue-950">
                              {isMerchant
                                ? section.customData?.segment || "N/A"
                                : section.title}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-blue-900 font-medium">
                              {totalNumber}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-blue-900 font-medium">
                              ৳{" "}
                              {totalAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-blue-900 font-semibold">
                              ৳{" "}
                              {totalRevenue.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {grandTotalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-3 bg-blue-50/50 border-t border-blue-200">
                    <div className="text-xs text-blue-800/70 font-medium font-sans">
                      Showing {(grandTotalPage - 1) * MERCHANTS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        grandTotalPage * MERCHANTS_PER_PAGE,
                        filteredSections.length,
                      )}{" "}
                      of {filteredSections.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="px-3 py-1 text-xs border border-blue-200 rounded-lg bg-white hover:bg-blue-100/50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-blue-700 cursor-pointer"
                        onClick={() =>
                          setMonthPages((prev) => ({
                            ...prev,
                            "grand-total": grandTotalPage - 1,
                          }))
                        }
                        disabled={grandTotalPage === 1}
                      >
                        Previous
                      </button>
                      <span className="text-xs text-blue-800/70 font-medium font-sans">
                        Page {grandTotalPage} of {grandTotalPages}
                      </span>
                      <button
                        className="px-3 py-1 text-xs border border-blue-200 rounded-lg bg-white hover:bg-blue-100/50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-blue-700 cursor-pointer"
                        onClick={() =>
                          setMonthPages((prev) => ({
                            ...prev,
                            "grand-total": grandTotalPage + 1,
                          }))
                        }
                        disabled={grandTotalPage === grandTotalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Monthly Cards */}
      {MONTHS.map((month) => {
        const hasData = filteredSections.some((section) => {
          const data = section.customData?.monthlyData?.[month];
          return (
            data &&
            (data.revenue > 0 || (data.momGrowth && data.momGrowth !== "0%"))
          );
        });

        if (!hasData) return null;

        let monthTotalNumber = 0;
        let monthTotalAmount = 0;
        let monthTotalRevenue = 0;
        filteredSections.forEach((section) => {
          const data = section.customData?.monthlyData?.[month];
          if (data) {
            monthTotalNumber += data.count || 0;
            monthTotalAmount += data.amount || 0;
            monthTotalRevenue += data.revenue || 0;
          }
        });

        // Pagination configuration
        const MERCHANTS_PER_PAGE = 10;
        const currentPage = monthPages[month] || 1;
        const totalPages = Math.max(
          1,
          Math.ceil(filteredSections.length / MERCHANTS_PER_PAGE),
        );
        const pagedSections = filteredSections.slice(
          (currentPage - 1) * MERCHANTS_PER_PAGE,
          currentPage * MERCHANTS_PER_PAGE,
        );

        return (
          <div
            key={month}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-slate-300"
          >
            <div
              onClick={() => toggleExpanded(month)}
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 p-1.5 rounded-md transition-all duration-300 ${expanded[month] ? "bg-slate-200 rotate-90 text-blue-600" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100 group-hover:text-slate-600"}`}
                >
                  <ChevronRight className="w-4 h-4" />
                </div>
                <div className="flex-1 flex items-center justify-between gap-6">
                  <h3 className="text-lg font-bold text-slate-900 leading-none tracking-tight">
                    {month}
                  </h3>
                  <div className="flex items-center gap-8">
                    <div className="flex gap-6">
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
                          Number
                        </div>
                        <div className="font-bold text-slate-900 text-base leading-tight">
                          {monthTotalNumber.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
                          Account
                        </div>
                        <div className="font-bold text-slate-900 text-base leading-tight">
                          ৳{" "}
                          {monthTotalAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 mb-0.5">
                          Revenue
                        </div>
                        <div className="font-bold text-slate-900 text-base leading-tight">
                          ৳{" "}
                          {monthTotalRevenue.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded[month] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-100">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                          <th className="px-6 py-3 font-semibold w-16 text-center">
                            #
                          </th>
                          <th className="px-6 py-3 font-semibold">Merchant</th>
                          <th className="px-6 py-3 font-semibold">Segment</th>
                          <th className="px-6 py-3 font-semibold text-right">
                            Number
                          </th>
                          <th className="px-6 py-3 font-semibold text-right">
                            Account
                          </th>
                          <th className="px-6 py-3 font-semibold text-right">
                            Revenue
                          </th>
                          <th className="px-6 py-3 font-semibold text-right">
                            MOM Growth
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedSections.map((section, index) => {
                          const data = section.customData?.monthlyData?.[
                            month
                          ] || { revenue: 0, momGrowth: "0%" };
                          const isMerchant = section.sectionId.startsWith("M-");
                          return (
                            <tr
                              key={section.sectionId}
                              className="hover:bg-slate-50/50 transition-colors"
                            >
                              <td className="px-6 py-3 text-center text-slate-400 font-medium">
                                {(currentPage - 1) * MERCHANTS_PER_PAGE +
                                  index +
                                  1}
                              </td>
                              <td className="px-6 py-3">
                                {isMerchant ? (
                                  <div className="flex flex-col gap-1">
                                    {section.customData?.sector && (
                                      <div className="flex">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider leading-none">
                                          {section.customData.sector}
                                        </span>
                                      </div>
                                    )}
                                    <div className="font-semibold text-slate-900 leading-tight">
                                      {section.title}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-300 font-medium">
                                    -
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-3 font-medium text-slate-900">
                                {isMerchant
                                  ? section.customData?.segment || "N/A"
                                  : section.title}
                              </td>
                              <td className="px-6 py-3 text-right tabular-nums text-slate-600">
                                {data.count || 0}
                              </td>
                              <td className="px-6 py-3 text-right tabular-nums text-slate-600">
                                ৳{" "}
                                {data.amount?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }) || "0.00"}
                              </td>
                              <td className="px-6 py-3 text-right tabular-nums text-slate-600">
                                ৳{" "}
                                {data.revenue?.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }) || "0.00"}
                              </td>
                              <td
                                className={`px-6 py-3 text-right tabular-nums font-semibold ${data.color === "red" ? "text-rose-500" : data.color === "green" ? "text-emerald-500" : "text-slate-400"}`}
                              >
                                {data.momGrowth}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
                      <div className="text-xs text-slate-500 font-medium">
                        Showing {(currentPage - 1) * MERCHANTS_PER_PAGE + 1} to{" "}
                        {Math.min(
                          currentPage * MERCHANTS_PER_PAGE,
                          filteredSections.length,
                        )}{" "}
                        of {filteredSections.length} entries
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                          onClick={() =>
                            setMonthPages((prev) => ({
                              ...prev,
                              [month]: currentPage - 1,
                            }))
                          }
                          disabled={currentPage === 1}
                        >
                          Previous
                        </button>
                        <span className="text-xs text-slate-500 font-medium">
                          Page {currentPage} of {totalPages}
                        </span>
                        <button
                          className="px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                          onClick={() =>
                            setMonthPages((prev) => ({
                              ...prev,
                              [month]: currentPage + 1,
                            }))
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});

MerchantWiseGrowthReport.displayName = "MerchantWiseGrowthReport";
