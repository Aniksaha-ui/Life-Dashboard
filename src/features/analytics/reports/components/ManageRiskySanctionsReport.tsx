import { useMemo, forwardRef, useImperativeHandle, useState } from "react";
import type { ReportSection } from "../reportRegistry";
import type { ReportFilters } from "../reportApi";
import { EditSanctionModal } from "./EditSanctionModal";

interface ManageRiskySanctionsReportProps {
  sections: ReportSection[];
  filters: ReportFilters;
}

export interface ManageRiskySanctionsReportHandle {
  exportData: () => void;
}

export const ManageRiskySanctionsReport = forwardRef<
  ManageRiskySanctionsReportHandle,
  ManageRiskySanctionsReportProps
>(({ sections, filters }, ref) => {
  const selectedType = filters.type || "all";
  const filterValue = filters.filterValue || "";

  const [localData, setLocalData] = useState<any[]>(() => {
    const section = sections.find(
      (s) => s.sectionId === "manage-risky-sanctions-1",
    );
    return (section?.customData || []) as any[];
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const filteredData = useMemo(() => {
    return localData.filter((item) => {
      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesValue = item.filterValue
        .toLowerCase()
        .includes(filterValue.toLowerCase());
      return matchesType && matchesValue;
    });
  }, [localData, selectedType, filterValue]);

  const handleEditClick = (item: any) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSaveSanction = (updatedItem: any) => {
    setLocalData((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    // In a real app, this would be an API call
    console.log("Saving updated sanction:", updatedItem);
  };

  const generateCsvContent = () => {
    const headers = [
      "#",
      "Type",
      "Filter Value",
      "Remarks",
      "Created By",
      "Updated By",
    ];
    const rows = filteredData.map((item, index) => [
      index + 1,
      item.type,
      item.filterValue,
      item.remarks,
      item.createdBy || "-",
      item.updatedBy || "-",
    ]);

    if (rows.length === 0) return null;
    return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  };

  useImperativeHandle(ref, () => ({
    exportData: () => {
      const content = generateCsvContent();
      if (content) {
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `manage-risky-sanctions.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("No rows to export.");
      }
    },
  }));

  return (
    <div className="space-y-6">
      {/* Data Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr className="text-[11px] uppercase tracking-wider font-semibold">
                <th className="px-6 py-4 font-bold text-slate-900 w-16">#</th>
                <th className="px-6 py-4 font-bold text-slate-900 min-w-[150px]">
                  Type
                </th>
                <th className="px-6 py-4 font-bold text-slate-900 min-w-[200px]">
                  Filter Value
                </th>
                <th className="px-6 py-4 font-bold text-slate-900 min-w-[250px]">
                  Remarks
                </th>
                <th className="px-6 py-4 font-bold text-slate-900 min-w-[120px]">
                  Created By
                </th>
                <th className="px-6 py-4 font-bold text-slate-900 min-w-[120px]">
                  Updated By
                </th>
                <th className="px-6 py-4 font-bold text-slate-900 w-24">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-500">{index + 1}</td>
                    <td className="px-6 py-4 text-slate-700">{item.type}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {item.filterValue}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{item.remarks}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.createdBy || "Anik"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.updatedBy || "Anik"}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-all"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500 italic"
                  >
                    No risky sanctions found matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditSanctionModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveSanction}
        item={selectedItem}
      />
    </div>
  );
});

ManageRiskySanctionsReport.displayName = "ManageRiskySanctionsReport";
