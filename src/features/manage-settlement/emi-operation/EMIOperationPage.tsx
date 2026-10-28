import { useState } from "react";
import { EMIDrawer } from "./components/EMIDrawer";
import { EMIFilters } from "./components/EMIFilters";
import { EMIOverview } from "./components/EMIOverview";
import { EMITable } from "./components/EMITable";
import { useEMIOperations } from "./hooks/useEMIOperations";

export default function EMIOperationsPage() {
  const {
    filters,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleExportCSV,
    filteredData,
    metrics,
    isLoading,
    pagination,
    isExporting, // Destructure isExporting from the hook
  } = useEMIOperations();

  const [selectedEMIId, setSelectedEMIId] = useState<number | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">EMI Operations</h1>
        <p className="text-slate-500 text-sm">
          Monitor and manage EMI transaction requests
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <EMIFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <EMIOverview metrics={metrics} />

        <EMITable
          data={filteredData}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewDetail={setSelectedEMIId}
          isLoading={isLoading}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />
      </div>

      {/* Drawer */}
      <EMIDrawer emiId={selectedEMIId} onClose={() => setSelectedEMIId(null)} />
    </div>
  );
}
