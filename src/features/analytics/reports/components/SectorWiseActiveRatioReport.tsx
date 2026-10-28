import { forwardRef, useImperativeHandle, useMemo } from "react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";

interface SectorWiseActiveRatioReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface SectorWiseActiveRatioReportHandle {
  exportData: () => void;
}

export const SectorWiseActiveRatioReport = forwardRef<
  SectorWiseActiveRatioReportHandle,
  SectorWiseActiveRatioReportProps
>(({ sections, filters }, ref) => {
  const data = useMemo(() => {
    const section = sections.find(
      (s) => s.sectionId === "sector-active-ratio-1",
    );
    return (section?.customData || []) as any[];
  }, [sections]);

  const filteredData = useMemo(() => {
    if (!filters.sector || filters.sector === "all") return data;
    return data.filter(
      (item) => item.sectorName.toLowerCase() === filters.sector?.toLowerCase(),
    );
  }, [data, filters.sector]);

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Sector Name",
      "Store(count)",
      "Active(%)",
      "Inactive(%)",
      "Other(%)",
    ];
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.sectorName,
      item.storeCount,
      item.activePct.toFixed(2),
      item.inactivePct.toFixed(2),
      item.otherPct.toFixed(2),
    ]);

    if (rows.length === 0) return null;
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
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
        downloadCsv(
          content,
          `sector-wise-active-ratio-${filters.from}-${filters.to}.csv`,
        );
      } else {
        alert("No rows to export for current filters.");
      }
    },
  }));

  if (filteredData.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
        No sectors found matching the current filters.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
            <tr className="text-[10px] uppercase tracking-wider font-semibold">
              <th className="px-6 py-4 font-bold text-slate-900 w-16 text-center">
                #
              </th>
              <th className="px-6 py-4 font-bold text-slate-900 min-w-[200px]">
                Sector Name
              </th>
              <th className="px-6 py-4 font-bold text-slate-900 text-right">
                Store(count)
              </th>
              <th className="px-6 py-4 font-bold text-slate-900 text-right">
                Active(%)
              </th>
              <th className="px-6 py-4 font-bold text-slate-900 text-right">
                Inactive(%)
              </th>
              <th className="px-6 py-4 font-bold text-slate-900 text-right">
                Other(%)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-center text-slate-400 font-medium">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {item.sectorName}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600 font-medium">
                  {item.storeCount}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600 font-medium">
                  {item.activePct.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600 font-medium">
                  {item.inactivePct.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-right tabular-nums text-slate-600 font-medium">
                  {item.otherPct.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

SectorWiseActiveRatioReport.displayName = "SectorWiseActiveRatioReport";
