import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
import { TrendingUp, TrendingDown, ChevronRight, Download } from "lucide-react";
import { CopyButton } from "../../../../components/CopyButton";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface KamwiseMerchantTransactionReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface KamwiseMerchantTransactionReportHandle {
  exportData: () => void;
}

export const KamwiseMerchantTransactionReport = forwardRef<
  KamwiseMerchantTransactionReportHandle,
  KamwiseMerchantTransactionReportProps
>(({ sections }, ref) => {
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

  // Extract data from the first section (registry returns only one section for this report)
  const reportData = sections[0]?.customData;
  const months = reportData?.months || [];
  const merchants = reportData?.merchants || [];

  // Auto-sum summary calculation
  const summary = useMemo(() => {
    let totalAmount = 0;
    let totalCount = 0;

    merchants.forEach((merchant: any) => {
      months.forEach((month: string) => {
        const data = merchant.monthlyData[month];
        if (data) {
          totalAmount += data.amount || 0;
          totalCount += data.count || 0;
        }
      });
    });

    return { totalAmount, totalCount };
  }, [merchants, months]);

  // Export Functionality
  const generateCsvContent = (specificMerchantId?: string) => {
    if (!reportData) return null;

    const targetMerchants = specificMerchantId
      ? merchants.filter((m: any) => m.merchantId === specificMerchantId)
      : merchants;

    if (targetMerchants.length === 0) return null;

    const headers = ["Company Name", "Merchant ID", "Sector", ...months];
    const rows = targetMerchants.map((m: any) => [
      m.merchantName,
      m.merchantId,
      m.sector || "",
      ...months.map((month: string) => m.monthlyData[month]?.amount || 0),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) => row.join(",")),
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
        const filename = `kamwise-merchant-transaction-${new Date().getTime()}.csv`;
        downloadCsv(content, filename);
      } else {
        alert("No rows to export.");
      }
    },
  }));

  const handleMerchantExport = (e: React.MouseEvent, merchant: any) => {
    e.stopPropagation();
    const content = generateCsvContent(merchant.merchantId);
    if (content) {
      const filename = `kamwise-merchant-${merchant.merchantId}-${new Date().getTime()}.csv`;
      downloadCsv(content, filename);
    }
  };

  if (!reportData) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No data found for this report.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Unified Grand Total Card */}
      <div className="bg-blue-50/40 rounded-xl border border-blue-200 shadow-sm overflow-hidden text-blue-900">
        <div className="px-6 py-5 border-b border-blue-100 bg-blue-50/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-lg font-medium text-blue-900 leading-none">
              GRAND TOTAL{" "}
              <span className="font-normal opacity-70">(All Months)</span>
            </h3>

            <div className="flex items-center gap-12">
              <div className="text-right">
                <div className="text-[10px] text-blue-800/70 mb-1 font-medium uppercase tracking-wider">
                  Total Transactions
                </div>
                <div className="font-medium text-blue-900 text-base leading-tight">
                  {summary.totalCount.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-blue-800/70 mb-1 font-medium uppercase tracking-wider">
                  Total Amount
                </div>
                <div className="font-medium text-blue-900 text-base leading-tight">
                  ৳{" "}
                  {summary.totalAmount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merchant Cards */}
      <div className="space-y-4">
        {merchants.map((merchant: any) => {
          // Calculate merchant cumulative total for the header
          const merchantTotal = months.reduce((acc: number, month: string) => {
            return acc + (merchant.monthlyData[month]?.amount || 0);
          }, 0);

          return (
            <div
              key={merchant.merchantId}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden group"
            >
              {/* Card Header - Clickable */}
              <div
                onClick={() => toggleExpanded(merchant.merchantId)}
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-4">
                      {/* Chevron Column */}
                      <div
                        className={`p-1.5 rounded-md transition-all duration-200 shrink-0 ${expanded[merchant.merchantId] ? "bg-slate-100 rotate-90" : "bg-slate-50 group-hover:bg-slate-100"}`}
                      >
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>

                      {/* Merchant Name & ID Consolidated */}
                      <div className="flex flex-col py-0.5 group">
                        <div
                          className={`font-medium text-slate-900 leading-tight ${isUnder1400 ? "text-base" : "text-lg"}`}
                        >
                          {merchant.merchantName}
                        </div>
                        <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                          {merchant.merchantId}
                          <CopyButton value={merchant.merchantId} />
                          {merchant.sector && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500 uppercase tracking-wider ml-1.5">
                              {merchant.sector}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    {/* Header Totals (Stacked Labels & Values) */}
                    <div className="hidden sm:flex items-center gap-8">
                      <div className="text-right">
                        <div
                          className={`text-slate-500 mb-0.5 ${isUnder1400 ? "text-[11px]" : "text-xs"}`}
                        >
                          Cumulative Amount
                        </div>
                        <div
                          className={`font-medium text-slate-900 leading-tight ${isUnder1400 ? "text-[13px]" : "text-base"}`}
                        >
                          ৳{" "}
                          {merchantTotal.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </div>
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

              {/* Expanded Content with Smooth Transition */}
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  expanded[merchant.merchantId]
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
                            {months.map((month: string) => (
                              <th
                                key={month}
                                className="px-6 py-3 font-medium text-right min-w-[140px] whitespace-nowrap"
                              >
                                {month}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                          <tr className="group/row">
                            {months.map((month: string) => {
                              const data = merchant.monthlyData[month];
                              return (
                                <td
                                  key={month}
                                  className="px-6 py-2.5 text-right tabular-nums"
                                >
                                  <div className="flex items-center justify-end gap-2">
                                    <span className="font-medium text-slate-900 text-sm">
                                      {data?.amount.toLocaleString("en-US", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }) || "0.00"}
                                    </span>
                                    {data?.trend === "up" && (
                                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                    )}
                                    {data?.trend === "down" && (
                                      <TrendingDown className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                    )}
                                    {!data?.trend && (
                                      <div className="w-3.5 h-3.5" />
                                    )}
                                  </div>
                                </td>
                              );
                            })}
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

KamwiseMerchantTransactionReport.displayName =
  "KamwiseMerchantTransactionReport";
