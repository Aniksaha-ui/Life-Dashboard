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

interface SectorWiseReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface SectorWiseReportHandle {
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

export const SectorWiseReport = forwardRef<
  SectorWiseReportHandle,
  SectorWiseReportProps
>(({ sections, filters }, ref) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [monthPages, setMonthPages] = useState<Record<string, number>>({});

  const [localTrendType, setLocalTrendType] = useState<
    "count" | "amount" | "revenue" | "mom"
  >((filters.trendType as any) || "amount");

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
  ]);

  // Filter sectors based on filters
  const filteredSections = useMemo(() => {
    return sections.filter((section) => {
      // Sector Filter
      if (filters.sector && filters.sector !== "all") {
        if (section.title.toLowerCase() !== filters.sector.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [sections, filters.sector]);

  // Trend logic
  const trendValue =
    localTrendType === "count"
      ? "number"
      : localTrendType === "revenue"
        ? "revenue"
        : localTrendType === "mom"
          ? "revenue"
          : "amount";
  const trendLabel =
    localTrendType === "count"
      ? "Number"
      : localTrendType === "revenue"
        ? "Revenue"
        : localTrendType === "mom"
          ? "MoM Growth"
          : "Amount";

  // Calculate Grand Totals
  const yearTotals = useMemo(() => {
    let totalNumber = 0;
    let totalAmount = 0;
    let totalRevenue = 0;

    filteredSections.forEach((sector) => {
      MONTHS.forEach((m) => {
        const d = sector.customData?.monthlyData?.[m];
        if (d) {
          totalNumber += d.number || 0;
          totalAmount += d.amount || 0;
          totalRevenue += d.revenue || 0;
        }
      });
    });

    return { totalNumber, totalAmount, totalRevenue };
  }, [filteredSections]);

  const calculateMoM = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const getPreviousMonthMetric = (
    sector: ReportSection,
    currentMonth: string,
    metric: "number" | "amount" | "revenue",
  ) => {
    const currentIndex = MONTHS.indexOf(currentMonth);
    if (currentIndex <= 0) return 0;
    const prevMonth = MONTHS[currentIndex - 1];
    return sector.customData?.monthlyData?.[prevMonth]?.[metric] || 0;
  };

  // Export Functionality
  const generateCsvContent = () => {
    const rows: any[] = [];

    // Build Headers
    const headerRow1 = ["#", "Sector"];
    MONTHS.forEach((month) => {
      headerRow1.push(month, "", "", "");
    });
    headerRow1.push("GRAND TOTAL", "", "");

    const headerRow2 = ["", ""];
    MONTHS.forEach(() => {
      headerRow2.push("Number", "Amount", "Revenue", "MoM Growth");
    });
    headerRow2.push("Number", "Amount", "Revenue");

    filteredSections.forEach((sector, index) => {
      const row = [index + 1, sector.title];
      let sectorGrandTotalNumber = 0;
      let sectorGrandTotalAmount = 0;
      let sectorGrandTotalRevenue = 0;
      const monthlyData = sector.customData?.monthlyData || {};

      MONTHS.forEach((month) => {
        const data = monthlyData[month] || { number: 0, amount: 0, revenue: 0 };
        const prevRevenue = getPreviousMonthMetric(sector, month, "revenue");
        const mom = calculateMoM(data.revenue, prevRevenue);

        row.push(
          data.number,
          data.amount ? data.amount.toFixed(2) : "0",
          data.revenue ? data.revenue.toFixed(2) : "0",
          `${mom.toFixed(0)}%`,
        );
        sectorGrandTotalNumber += data.number || 0;
        sectorGrandTotalAmount += data.amount || 0;
        sectorGrandTotalRevenue += data.revenue || 0;
      });

      row.push(
        sectorGrandTotalNumber,
        sectorGrandTotalAmount ? sectorGrandTotalAmount.toFixed(2) : "0",
        sectorGrandTotalRevenue ? sectorGrandTotalRevenue.toFixed(2) : "0",
      );
      rows.push(row);
    });

    if (rows.length === 0) return null;

    return [
      headerRow1.join(","),
      headerRow2.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");
  };

  const downloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const content = generateCsvContent();
      if (content) {
        const filename = `sector-wise-${filters.year || new Date().getFullYear()}.csv`;
        downloadCsv(content, filename);
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (filteredSections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No sectors found matching the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grand Total Card with Horizontal Trend Table */}
      {(() => {
        // Pagination configuration for Grand Total
        const SECTORS_PER_PAGE = 10;
        const grandTotalPage = monthPages["grand-total"] || 1;
        const grandTotalPages = Math.max(
          1,
          Math.ceil(filteredSections.length / SECTORS_PER_PAGE),
        );
        const pagedGrandTotalSections = filteredSections.slice(
          (grandTotalPage - 1) * SECTORS_PER_PAGE,
          grandTotalPage * SECTORS_PER_PAGE,
        );

        return (
          <div className="bg-blue-50/40 rounded-xl border border-blue-200 shadow-sm overflow-hidden text-blue-900">
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
                  <h3 className="text-lg font-medium text-blue-900 leading-none">
                    GRAND TOTAL{" "}
                    <span className="font-normal opacity-70">(All Months)</span>
                  </h3>

                  <div className="hidden sm:flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[10px] text-blue-800/70 mb-0.5 uppercase tracking-wider font-medium">
                        Transactions
                      </div>
                      <div className="font-medium text-blue-900 text-base leading-tight">
                        {yearTotals.totalNumber.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-blue-800/70 mb-0.5 uppercase tracking-wider font-medium">
                        Amount
                      </div>
                      <div className="font-medium text-blue-900 text-base leading-tight">
                        ৳{" "}
                        {yearTotals.totalAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-blue-800/70 mb-0.5 uppercase tracking-wider font-medium">
                        Revenue
                      </div>
                      <div className="font-medium text-blue-900 text-base leading-tight">
                        ৳{" "}
                        {yearTotals.totalRevenue.toLocaleString("en-US", {
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
                {/* Local Toggle */}
                <div className="px-6 py-4 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex bg-blue-100/50 p-1 rounded-lg border border-blue-200/50">
                    <button
                      onClick={() => setLocalTrendType("count")}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${localTrendType === "count" ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-600/70 hover:text-blue-700 hover:bg-white/50"}`}
                    >
                      Number
                    </button>
                    <button
                      onClick={() => setLocalTrendType("amount")}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${localTrendType === "amount" ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-600/70 hover:text-blue-700 hover:bg-white/50"}`}
                    >
                      Amount
                    </button>
                    <button
                      onClick={() => setLocalTrendType("revenue")}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${localTrendType === "revenue" ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-600/70 hover:text-blue-700 hover:bg-white/50"}`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setLocalTrendType("mom")}
                      className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${localTrendType === "mom" ? "bg-white text-blue-700 shadow-sm border border-blue-100" : "text-blue-600/70 hover:text-blue-700 hover:bg-white/50"}`}
                    >
                      MoM Growth
                    </button>
                  </div>
                  <div className="text-[11px] text-blue-500 font-medium">
                    Displaying {trendLabel} trends across sectors
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-blue-100/50 text-blue-800 border-b border-blue-200">
                      <tr className="text-[10px] uppercase tracking-wider font-medium">
                        <th className="px-6 py-3 font-medium w-16 text-center">
                          #
                        </th>
                        <th className="px-6 py-3 font-medium min-w-[150px]">
                          Sector
                        </th>
                        {MONTHS.map((m) => (
                          <th
                            key={m}
                            className="px-4 py-3 font-medium text-right"
                          >
                            {m.substring(0, 3)}
                          </th>
                        ))}
                        <th className="px-6 py-3 font-medium text-right">
                          TOTAL
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {pagedGrandTotalSections.map((sector, index) => {
                        let sectorGrandTotal = 0;
                        const monthlyData =
                          sector.customData?.monthlyData || {};

                        return (
                          <tr
                            key={sector.sectionId}
                            className="hover:bg-blue-50/50"
                          >
                            <td className="px-6 py-3 text-center text-blue-500 font-medium">
                              {(grandTotalPage - 1) * SECTORS_PER_PAGE +
                                index +
                                1}
                            </td>
                            <td className="px-6 py-3 font-medium text-blue-950">
                              {sector.title || "(No Sector)"}
                            </td>
                            {MONTHS.map((m) => {
                              const d = monthlyData[m] || {
                                number: 0,
                                amount: 0,
                                revenue: 0,
                              };
                              const prevRevenue = getPreviousMonthMetric(
                                sector,
                                m,
                                "revenue",
                              );
                              const mom = calculateMoM(d.revenue, prevRevenue);
                              const value =
                                d[
                                  trendValue as "number" | "amount" | "revenue"
                                ] || 0;
                              sectorGrandTotal += value;

                              if (localTrendType === "mom") {
                                return (
                                  <td
                                    key={m}
                                    className={`px-4 py-3 text-right tabular-nums font-semibold ${mom > 0 ? "text-emerald-600" : mom < 0 ? "text-rose-600" : "text-slate-400"}`}
                                  >
                                    {mom > 0 ? "+" : ""}
                                    {mom.toFixed(0)}%
                                  </td>
                                );
                              }

                              return (
                                <td
                                  key={m}
                                  className="px-4 py-3 text-right tabular-nums text-blue-800/80"
                                >
                                  {["amount", "revenue"].includes(trendValue)
                                    ? value.toLocaleString(undefined, {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      })
                                    : value.toLocaleString()}
                                </td>
                              );
                            })}
                            <td className="px-6 py-3 text-right tabular-nums text-blue-900 font-bold whitespace-nowrap bg-blue-100/30">
                              {localTrendType === "mom"
                                ? "-"
                                : ["amount", "revenue"].includes(trendValue)
                                  ? sectorGrandTotal.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })
                                  : sectorGrandTotal.toLocaleString()}
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
                      Showing {(grandTotalPage - 1) * SECTORS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        grandTotalPage * SECTORS_PER_PAGE,
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

      {/* Monthly Cards with Detailed Detailed Table */}
      {MONTHS.map((month) => {
        const hasData = filteredSections.some((sector) => {
          const data = sector.customData?.monthlyData?.[month];
          return (
            data && (data.number > 0 || data.amount > 0 || data.revenue > 0)
          );
        });

        if (!hasData) return null;

        let monthTotalNumber = 0;
        let monthTotalAmount = 0;
        let monthTotalRevenue = 0;

        filteredSections.forEach((sector) => {
          const data = sector.customData?.monthlyData?.[month];
          if (data) {
            monthTotalNumber += data.number || 0;
            monthTotalAmount += data.amount || 0;
            monthTotalRevenue += data.revenue || 0;
          }
        });

        // Pagination configuration
        const SECTORS_PER_PAGE = 10;
        const currentPage = monthPages[month] || 1;
        const totalPages = Math.max(
          1,
          Math.ceil(filteredSections.length / SECTORS_PER_PAGE),
        );
        const pagedSections = filteredSections.slice(
          (currentPage - 1) * SECTORS_PER_PAGE,
          currentPage * SECTORS_PER_PAGE,
        );

        return (
          <div
            key={month}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div
              onClick={() => toggleExpanded(month)}
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-100 group"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`mt-1 p-1.5 rounded-md transition-all duration-200 ${expanded[month] ? "bg-slate-100 rotate-90" : "bg-slate-50 group-hover:bg-slate-100"}`}
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>

                <div className="flex-1 flex items-center justify-between gap-6">
                  <h3 className="text-lg font-medium text-slate-900 leading-none">
                    {month}
                  </h3>

                  <div className="hidden sm:flex items-center gap-8">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider font-medium">
                        Transactions
                      </div>
                      <div className="font-medium text-slate-900 text-base leading-tight">
                        {monthTotalNumber.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider font-medium">
                        Amount
                      </div>
                      <div className="font-medium text-slate-900 text-base leading-tight">
                        ৳{" "}
                        {monthTotalAmount.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 mb-0.5 uppercase tracking-wider font-medium">
                        Revenue
                      </div>
                      <div className="font-medium text-slate-900 text-base leading-tight">
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

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${expanded[month] ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white text-slate-500 border-b border-slate-100">
                      <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                        <th className="px-6 py-3 font-medium w-16 text-center">
                          #
                        </th>
                        <th className="px-6 py-3 font-medium">Sector</th>
                        <th className="px-6 py-3 font-medium text-right">
                          Number
                        </th>
                        <th className="px-6 py-3 font-medium text-right">
                          Amount
                        </th>
                        <th className="px-6 py-3 font-medium text-right">
                          Revenue
                        </th>
                        <th className="px-6 py-3 font-medium text-right">
                          MoM Growth
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedSections.map((sector, index) => {
                        const data = sector.customData?.monthlyData?.[
                          month
                        ] || { number: 0, amount: 0, revenue: 0 };
                        const prevRevenue = getPreviousMonthMetric(
                          sector,
                          month,
                          "revenue",
                        );
                        const mom = calculateMoM(data.revenue, prevRevenue);

                        return (
                          <tr
                            key={sector.sectionId}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-3 text-center text-slate-500 font-medium">
                              {(currentPage - 1) * SECTORS_PER_PAGE + index + 1}
                            </td>
                            <td className="px-6 py-3 font-medium text-slate-900">
                              {sector.title || "(No Sector)"}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-600 font-medium">
                              {data.number.toLocaleString()}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-900 font-medium">
                              {data.amount === 0
                                ? "0.00"
                                : data.amount.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                            </td>
                            <td className="px-6 py-3 text-right tabular-nums text-slate-900 font-medium">
                              {data.revenue === 0
                                ? "0.00"
                                : data.revenue.toLocaleString(undefined, {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                            </td>
                            <td
                              className={`px-6 py-3 text-right tabular-nums font-semibold ${mom > 0 ? "text-emerald-600" : mom < 0 ? "text-rose-600" : "text-slate-400"}`}
                            >
                              {mom > 0 ? "+" : ""}
                              {mom.toFixed(0)}%
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
                      Showing {(currentPage - 1) * SECTORS_PER_PAGE + 1} to{" "}
                      {Math.min(
                        currentPage * SECTORS_PER_PAGE,
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
        );
      })}
    </div>
  );
});

SectorWiseReport.displayName = "SectorWiseReport";
