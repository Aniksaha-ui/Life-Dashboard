import { useMemo, forwardRef, useImperativeHandle } from "react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface GatewayTransactionReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface GatewayTransactionReportHandle {
  exportData: () => void;
}

export const GatewayTransactionReport = forwardRef<
  GatewayTransactionReportHandle,
  GatewayTransactionReportProps
>(({ sections, filters }, ref) => {
  // Filter sections based on filters
  const filteredSections = useMemo(() => {
    return sections;
  }, [sections]);

  // Get available days from sections to avoid "extra data"
  const daysInMonth = useMemo(() => {
    const daysSet = new Set<string>();
    filteredSections.forEach((section) => {
      Object.keys(section.customData?.dailyData || {}).forEach((day) =>
        daysSet.add(day),
      );
    });
    return Array.from(daysSet).sort((a, b) => parseInt(a) - parseInt(b));
  }, [filteredSections]);

  // Export Functionality
  const generateCsvContent = () => {
    const rows: any[] = [];
    // Headers: Gateway, Day 1 Count, Day 1 Amount, ...
    const headers = ["Gateway"];
    daysInMonth.forEach((day) => {
      headers.push(`${day} (Count)`, `${day} (Amount)`);
    });
    headers.push("Total Count", "Total Amount");

    filteredSections.forEach((section) => {
      const row = [section.title];
      let rowCount = 0;
      let rowAmount = 0;

      daysInMonth.forEach((day) => {
        const rawData = section.customData?.dailyData?.[day];
        const data =
          typeof rawData === "object" && rawData !== null
            ? {
                count: Number(rawData.count || 0),
                amount: Number(rawData.amount || 0),
              }
            : { count: typeof rawData === "number" ? rawData : 0, amount: 0 };

        row.push(data.count.toString());
        row.push(data.amount.toString());
        rowCount += data.count;
        rowAmount += data.amount;
      });

      row.push(rowCount.toString());
      row.push(rowAmount.toString());
      rows.push(row);
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
        const filename = `gateway-transaction-${filters.month || "report"}.csv`;
        downloadCsv(content, filename);
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (filteredSections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No data found matching the current filters.
      </div>
    );
  }

  const totals = useMemo(() => {
    let totalCount = 0;
    let totalAmount = 0;
    filteredSections.forEach((section) => {
      Object.values(section.customData?.dailyData || {}).forEach((val: any) => {
        if (typeof val === "object" && val !== null) {
          totalCount += Number(val.count || 0);
          totalAmount += Number(val.amount || 0);
        } else if (typeof val === "number") {
          totalCount += val;
        }
      });
    });
    return {
      totalCount: isNaN(totalCount) ? 0 : totalCount,
      totalAmount: isNaN(totalAmount) ? 0 : totalAmount,
    };
  }, [filteredSections]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-start gap-4">
            <div className="flex-1 flex items-center justify-between gap-6">
              <h3 className="text-lg font-bold text-slate-900 leading-none">
                Gateway
              </h3>
              <div className="flex items-center gap-8">
                <div className="text-right border-r border-slate-100 pr-8">
                  <div className="text-xs text-slate-500 mb-0.5">
                    Total Transactions
                  </div>
                  <div className="font-bold text-slate-900 text-base leading-tight">
                    {totals.totalCount.toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 mb-0.5">
                    Total Amount
                  </div>
                  <div className="font-bold text-slate-900 text-base leading-tight">
                    ৳{" "}
                    {totals.totalAmount.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-white text-slate-500 border-b border-slate-100">
                  <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="px-6 py-3 min-w-[200px] sticky left-0 bg-white z-20 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]"></th>
                    {daysInMonth.map((day) => (
                      <th
                        key={day}
                        className="px-6 py-3 font-semibold text-center min-w-[100px]"
                      >
                        {day}
                      </th>
                    ))}
                    <th className="px-6 py-3 font-semibold text-center min-w-[120px] sticky right-0 bg-white z-20 border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSections.map((section) => {
                    let rowCount = 0;
                    let rowAmount = 0;
                    return (
                      <tr
                        key={section.sectionId}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-3 font-medium text-slate-900 sticky left-0 bg-white group-hover:bg-slate-50 z-20 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          {section.title}
                        </td>
                        {daysInMonth.map((day) => {
                          const rawData = section.customData?.dailyData?.[day];
                          const data =
                            typeof rawData === "object" && rawData !== null
                              ? {
                                  count: Number(rawData.count || 0),
                                  amount: Number(rawData.amount || 0),
                                }
                              : {
                                  count:
                                    typeof rawData === "number" ? rawData : 0,
                                  amount: 0,
                                };

                          rowCount += data.count;
                          rowAmount += data.amount;
                          return (
                            <td
                              key={day}
                              className="px-4 py-3 text-center tabular-nums"
                            >
                              <div className="flex flex-col items-center">
                                <span className="text-slate-900 font-medium">
                                  {data.count.toLocaleString()}
                                </span>
                                {data.amount > 0 && (
                                  <span className="text-slate-400 text-[10px] mt-0.5">
                                    ৳{" "}
                                    {data.amount.toLocaleString("en-US", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td className="px-6 py-3 text-center tabular-nums font-bold text-slate-900 sticky right-0 bg-white group-hover:bg-slate-50 z-20 border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          <div className="flex flex-col items-center">
                            <span>{rowCount.toLocaleString()}</span>
                            <span className="text-slate-600 text-[10px]">
                              ৳{" "}
                              {rowAmount.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row (Day totals) */}
                  <tr className="bg-slate-50 font-bold border-t-2 border-slate-100 sticky bottom-0 z-40">
                    <td className="px-6 py-3 text-slate-900 uppercase text-[10px] tracking-wider font-bold sticky left-0 bg-slate-50 z-30 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-center">
                      Total
                    </td>
                    {daysInMonth.map((day) => {
                      let dayCount = 0;
                      let dayAmount = 0;
                      filteredSections.forEach((section) => {
                        const rawData = section.customData?.dailyData?.[day];
                        const data =
                          typeof rawData === "object" && rawData !== null
                            ? {
                                count: Number(rawData.count || 0),
                                amount: Number(rawData.amount || 0),
                              }
                            : {
                                count:
                                  typeof rawData === "number" ? rawData : 0,
                                amount: 0,
                              };

                        dayCount += data.count;
                        dayAmount += data.amount;
                      });
                      return (
                        <td
                          key={day}
                          className="px-4 py-3 text-center tabular-nums text-slate-900 font-bold bg-slate-50"
                        >
                          <div className="flex flex-col items-center">
                            <span>{dayCount.toLocaleString()}</span>
                            {dayAmount > 0 && (
                              <span className="text-slate-500 text-[10px] font-normal">
                                ৳{" "}
                                {dayAmount.toLocaleString("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                    <td className="px-6 py-3 text-center tabular-nums text-slate-900 font-black sticky right-0 bg-slate-50 z-50 border-l border-slate-100 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <div className="flex flex-col items-center">
                        <span>{totals.totalCount.toLocaleString()}</span>
                        <span className="text-slate-600 text-[10px] font-normal">
                          ৳{" "}
                          {totals.totalAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
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
});

GatewayTransactionReport.displayName = "GatewayTransactionReport";
