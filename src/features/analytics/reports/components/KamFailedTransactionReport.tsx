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

interface KamFailedTransactionReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface KamFailedTransactionReportHandle {
  exportData: () => void;
}

export const KamFailedTransactionReport = forwardRef<
  KamFailedTransactionReportHandle,
  KamFailedTransactionReportProps
>(({ sections, filters }, ref) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [monthPages, setMonthPages] = useState<Record<string, number>>({});

  const toggleExpanded = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setMonthPages({});
  }, [filters.errorDescription, filters.month, filters.from, filters.to]);

  // Filter sections based on errorDescription and month if provided
  const filteredSections = useMemo(() => {
    let result = sections;

    // 1. Filter by Search (Error Description)
    if (filters.errorDescription) {
      const search = filters.errorDescription.toLowerCase();
      result = result
        .map((section) => {
          const failedTnx = (section.customData?.failedTnx || []).filter(
            (tnx: any) => tnx.errorDescription.toLowerCase().includes(search),
          );

          if (failedTnx.length === 0) return null;

          return {
            ...section,
            customData: {
              ...section.customData,
              failedTnx,
              totals: {
                timesFailed: failedTnx.reduce(
                  (acc: number, t: any) => acc + t.timesFailed,
                  0,
                ),
              },
            },
          };
        })
        .filter(Boolean) as ReportSection[];
    }

    // 2. Filter by Month
    if (filters.month) {
      result = result.filter(
        (section) => section.customData?.monthYear === filters.month,
      );
    }

    return result;
  }, [sections, filters.errorDescription, filters.month]);

  // Auto-expand if month filter is selected
  useMemo(() => {
    if (filters.month && filteredSections.length > 0) {
      const sectionId = filteredSections[0].sectionId;
      // Using a timeout or simple check to ensure we don't trigger too many renders if needed,
      // but since it's inside useMemo/useEffect it should be fine.
      if (!expanded[sectionId]) {
        setExpanded((prev) => ({ ...prev, [sectionId]: true }));
      }
    }
  }, [filters.month, filteredSections]);

  // Calculate Grand Totals
  const grandTotals = useMemo(() => {
    return filteredSections.reduce((acc, section) => {
      return acc + (section.customData?.totals?.timesFailed || 0);
    }, 0);
  }, [filteredSections]);

  // Export Functionality
  const generateCsvContent = () => {
    const headers = [
      "Month",
      "#",
      "Transaction Date",
      "Error Description",
      "Times Failed",
    ];
    const rows: any[] = [];

    filteredSections.forEach((section) => {
      const month = section.customData?.month;
      const failedTnx = section.customData?.failedTnx || [];

      failedTnx.forEach((tnx: any, index: number) => {
        // Extract time if present
        const time = tnx.detailTime ? tnx.detailTime.split(" ")[1] : "";
        const fullDate = time ? `${tnx.date} ${time}` : tnx.date;

        rows.push([
          month,
          index + 1,
          fullDate,
          tnx.errorDescription,
          tnx.timesFailed,
        ]);
      });
    });

    if (rows.length === 0) return null;

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
        const filename = `kam-failed-tnx-${filters.from}-to-${filters.to}.csv`;
        downloadCsv(content, filename);
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (filteredSections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No failed transactions found matching the current filters.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grand Total Card (Growth Style) */}
      <div className="bg-blue-50/40 rounded-xl border border-blue-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider">
                GRAND TOTAL
              </h3>
              <p className="text-xs text-blue-600 font-medium">
                Consolidated failed transaction summary
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-blue-500 mb-0.5">
              Total Times Failed
            </div>
            <div className="text-2xl font-bold text-blue-800 tabular-nums">
              {grandTotals.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Cards */}
      <div className="space-y-4">
        {filteredSections.map((section) => (
          <div
            key={section.sectionId}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            {/* Card Header */}
            <div
              onClick={() => toggleExpanded(section.sectionId)}
              className="p-5 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-1.5 rounded-md transition-all duration-200 ${expanded[section.sectionId] ? "bg-slate-100 rotate-90" : "bg-slate-50"}`}
                >
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {section.customData?.month} 2025
                </h3>
              </div>
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-500 uppercase tracking-tight">
                    Times Failed
                  </span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">
                    {section.customData?.totals?.timesFailed.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                expanded[section.sectionId]
                  ? "grid-rows-[1fr]"
                  : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-slate-100 bg-slate-50/30">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse table-fixed">
                      <thead>
                        <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                          <th className="px-6 py-4 w-16">#</th>
                          <th className="px-6 py-4 w-64">Transaction Date</th>
                          <th className="px-6 py-4">Error Description</th>
                          <th className="px-6 py-4 w-32 whitespace-nowrap text-right">
                            Times Failed
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {(() => {
                          const failedTnx = section.customData?.failedTnx || [];
                          const ITEMS_PER_PAGE = 10;
                          const currentPage =
                            monthPages[section.sectionId] || 1;
                          const pagedTnx = failedTnx.slice(
                            (currentPage - 1) * ITEMS_PER_PAGE,
                            currentPage * ITEMS_PER_PAGE,
                          );

                          return pagedTnx.map((tnx: any, idx: number) => {
                            const globalIdx =
                              (currentPage - 1) * ITEMS_PER_PAGE + idx + 1;
                            return (
                              <tr
                                key={idx}
                                className="hover:bg-slate-50/50 transition-colors"
                              >
                                <td className="px-6 py-4 text-slate-500 truncate">
                                  {globalIdx}
                                </td>
                                <td className="px-6 py-4 text-slate-700 font-medium truncate">
                                  {tnx.date}
                                  {tnx.detailTime && (
                                    <span className="ml-2 text-[11px] font-normal text-slate-400 tabular-nums">
                                      {tnx.detailTime.split(" ")[1] || ""}
                                    </span>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-slate-600 truncate">
                                  {tnx.errorDescription}
                                </td>
                                <td className="px-6 py-4 text-slate-900 font-bold truncate whitespace-nowrap text-right">
                                  {tnx.timesFailed}
                                </td>
                              </tr>
                            );
                          });
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Footer */}
                  {(() => {
                    const failedTnx = section.customData?.failedTnx || [];
                    const ITEMS_PER_PAGE = 10;
                    const currentPage = monthPages[section.sectionId] || 1;
                    const totalPages = Math.max(
                      1,
                      Math.ceil(failedTnx.length / ITEMS_PER_PAGE),
                    );

                    if (totalPages <= 1) return null;

                    return (
                      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-medium font-sans">
                          Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                          {Math.min(
                            currentPage * ITEMS_PER_PAGE,
                            failedTnx.length,
                          )}{" "}
                          of {failedTnx.length} entries
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                            onClick={() =>
                              setMonthPages((prev) => ({
                                ...prev,
                                [section.sectionId]: currentPage - 1,
                              }))
                            }
                            disabled={currentPage === 1}
                          >
                            Previous
                          </button>
                          <span className="text-xs text-slate-500 font-medium font-sans">
                            Page {currentPage} of {totalPages}
                          </span>
                          <button
                            className="px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                            onClick={() =>
                              setMonthPages((prev) => ({
                                ...prev,
                                [section.sectionId]: currentPage + 1,
                              }))
                            }
                            disabled={currentPage === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

KamFailedTransactionReport.displayName = "KamFailedTransactionReport";
