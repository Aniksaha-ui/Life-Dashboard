import {
  useState,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { ChevronRight, FileText, Download } from "lucide-react";
import { clsx } from "clsx";
import { CopyButton } from "../../../../components/CopyButton";
import { MerchantCertificateModal } from "./MerchantCertificateModal";
import { MerchantCertificate } from "./MerchantCertificate";
import { generateCertificatePDF } from "../utils/pdfGenerator";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface FinancialYearReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface FinancialYearReportHandle {
  exportData: () => void;
}

export const FinancialYearReport = forwardRef<
  FinancialYearReportHandle,
  FinancialYearReportProps
>(({ sections, filters }, ref) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [yearPages, setYearPages] = useState<Record<string, number>>({});
  const [selectedMerchant, setSelectedMerchant] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [downloadingMerchant, setDownloadingMerchant] = useState<any | null>(
    null,
  );
  const hiddenDownloadRef = useRef<HTMLDivElement>(null);

  const toggleSection = (sectionId: string) => {
    setExpanded((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  useEffect(() => {
    setYearPages({});
  }, [filters.year, filters.merchantId]);

  const handleTableDownload = (merchant: any, year: string) => {
    setDownloadingMerchant({
      ...merchant,
      year,
    });
  };

  useEffect(() => {
    if (downloadingMerchant && hiddenDownloadRef.current) {
      const timer = setTimeout(async () => {
        if (hiddenDownloadRef.current) {
          const filename = `Merchant_Certificate_${downloadingMerchant.merchantId}_${downloadingMerchant.year}.pdf`;
          try {
            await generateCertificatePDF(hiddenDownloadRef.current, filename);
          } finally {
            setDownloadingMerchant(null);
          }
        }
      }, 100); // Small delay to ensure render
      return () => clearTimeout(timer);
    }
  }, [downloadingMerchant]);

  // Filter sections based on year and merchant if provided
  const filteredSections = useMemo(() => {
    let result = sections;

    // 1. Filter by Year
    if (filters.year) {
      const yearStr = filters.year.toString();
      result = result.filter(
        (section) =>
          section.customData?.year === yearStr ||
          section.title.includes(yearStr),
      );
    }

    // 2. Filter by Merchant (Search)
    if (filters.merchantId) {
      const search = filters.merchantId.toLowerCase();
      result = result
        .map((section) => {
          const merchants = (section.customData?.merchants || []).filter(
            (m: any) =>
              m.merchantId.toLowerCase().includes(search) ||
              m.merchantName.toLowerCase().includes(search),
          );

          if (merchants.length === 0) return null;

          return {
            ...section,
            customData: {
              ...section.customData,
              merchants,
              totals: {
                merchantCount: merchants.length,
              },
            },
          };
        })
        .filter(Boolean) as ReportSection[];
    }

    return result;
  }, [sections, filters.year, filters.merchantId]);

  // Calculate Grand Totals
  const totalMerchants = useMemo(() => {
    return filteredSections.reduce((acc, section) => {
      return acc + (section.customData?.totals?.merchantCount || 0);
    }, 0);
  }, [filteredSections]);

  useImperativeHandle(ref, () => ({
    exportData: () => {
      // Simplified export for now
      alert("Financial Year Report Exporting...");
    },
  }));

  if (filteredSections.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No financial year data found matching the current filters.
      </div>
    );
  }

  return (
    <>
      {/* Hidden container for background PDF generation */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          width: "210mm",
        }}
        aria-hidden="true"
      >
        {downloadingMerchant && (
          <MerchantCertificate
            ref={hiddenDownloadRef}
            merchantData={downloadingMerchant}
          />
        )}
      </div>

      <div className="space-y-6">
        {/* Grand Total Card */}
        <div className="bg-indigo-50/40 rounded-xl border border-indigo-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider">
                  CONSOLIDATED SUMMARY
                </h3>
                <p className="text-xs text-indigo-600 font-medium">
                  Financial year reports over {filteredSections.length} years
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-indigo-500 mb-0.5">
                Total Merchants
              </div>
              <div className="text-2xl font-bold text-indigo-800 tabular-nums">
                {totalMerchants.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Yearly Cards */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <div
              key={section.sectionId}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              {/* Card Header */}
              <div
                onClick={() => toggleSection(section.sectionId)}
                className="p-5 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-1.5 rounded-md transition-all duration-200 ${expanded[section.sectionId] ? "bg-slate-100 rotate-90" : "bg-slate-50"}`}
                  >
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-slate-900">
                      {section.customData?.year}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Generated reports for{" "}
                      {section.customData?.merchants?.length} merchants
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-tight">
                      Merchants
                    </span>
                    <span className="text-sm font-bold text-slate-900 tabular-nums">
                      {section.customData?.merchants?.length.toLocaleString()}
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
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-medium border-b border-slate-200">
                            <th className="px-6 py-4">Merchant</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-center">Details</th>
                            <th className="px-6 py-4 text-right">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {(() => {
                            const merchants =
                              section.customData?.merchants || [];
                            const ITEMS_PER_PAGE = 10;
                            const currentPage =
                              yearPages[section.sectionId] || 1;
                            const pagedMerchants = merchants.slice(
                              (currentPage - 1) * ITEMS_PER_PAGE,
                              currentPage * ITEMS_PER_PAGE,
                            );

                            return pagedMerchants.map(
                              (merchant: any, idx: number) => (
                                <tr
                                  key={idx}
                                  className="hover:bg-slate-50/50 transition-colors group"
                                >
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col py-0.5">
                                      <div className="font-medium text-slate-900 leading-tight">
                                        {merchant.merchantName}
                                      </div>
                                      <div className="text-[11px] text-slate-500 font-normal flex items-center gap-1 mt-0.5">
                                        {merchant.merchantId}
                                        <CopyButton
                                          value={merchant.merchantId}
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span
                                      className={clsx(
                                        "px-2 py-1 rounded-full text-[10px] font-medium uppercase tracking-wide",
                                        merchant.status === "Generated"
                                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                          : "bg-amber-50 text-amber-600 border border-amber-100",
                                      )}
                                    >
                                      {merchant.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <button
                                      onClick={() => {
                                        setSelectedMerchant({
                                          ...merchant,
                                          year: section.customData?.year,
                                        });
                                        setIsModalOpen(true);
                                      }}
                                      className="text-primary-600 hover:text-primary-700 text-xs font-medium transition-colors"
                                    >
                                      Details
                                    </button>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <button
                                      disabled={
                                        !merchant.downloadUrl ||
                                        !!downloadingMerchant
                                      }
                                      onClick={() =>
                                        handleTableDownload(
                                          merchant,
                                          section.customData?.year,
                                        )
                                      }
                                      className={clsx(
                                        "inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all",
                                        merchant.downloadUrl &&
                                          !downloadingMerchant
                                          ? "bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow active:scale-95"
                                          : "bg-slate-100 text-slate-300 cursor-not-allowed",
                                      )}
                                    >
                                      <Download
                                        className={clsx(
                                          "w-3.5 h-3.5",
                                          downloadingMerchant?.merchantId ===
                                            merchant.merchantId &&
                                            "animate-bounce",
                                        )}
                                      />
                                      {downloadingMerchant?.merchantId ===
                                      merchant.merchantId
                                        ? "Preparing..."
                                        : "Download PDF"}
                                    </button>
                                  </td>
                                </tr>
                              ),
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Footer */}
                    {(() => {
                      const merchants = section.customData?.merchants || [];
                      const ITEMS_PER_PAGE = 10;
                      const currentPage = yearPages[section.sectionId] || 1;
                      const totalPages = Math.max(
                        1,
                        Math.ceil(merchants.length / ITEMS_PER_PAGE),
                      );

                      if (totalPages <= 1) return null;

                      return (
                        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
                          <div className="text-xs text-slate-500 font-medium font-sans">
                            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
                            {Math.min(
                              currentPage * ITEMS_PER_PAGE,
                              merchants.length,
                            )}{" "}
                            of {merchants.length} entries
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              className="px-3 py-1 text-xs border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-colors font-medium text-slate-600 cursor-pointer"
                              onClick={() =>
                                setYearPages((prev) => ({
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
                                setYearPages((prev) => ({
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

      <MerchantCertificateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        merchantData={selectedMerchant}
      />
    </>
  );
});

FinancialYearReport.displayName = "FinancialYearReport";
