import { useState } from "react";
import { ChargebackDrawer } from "./components/ChargebackDrawer";
import { ChargebackFilters } from "./components/ChargebackFilters";
import { ChargebackOverview } from "./components/ChargebackOverview";
import { ChargebackTable } from "./components/ChargebackTable";
import { useChargebacks } from "./hooks/useChargebacks";

export default function ChargebacksPage() {
  const {
    filters,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    filteredData,
    handleExportCSV: onExportCSV,
    metrics,
    isLoading,
    pagination,
    isExporting,
  } = useChargebacks();

  const [selectedChargebackId, setSelectedChargebackId] = useState<
    number | null
  >(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Chargebacks</h1>
        <p className="text-slate-500 text-sm">
          Manage and track chargeback requests
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Filters Row */}
        <ChargebackFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Overview Section */}
        <ChargebackOverview metrics={metrics} />

        {/* Table Section */}
        <ChargebackTable
          data={filteredData}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewDetails={setSelectedChargebackId}
          isLoading={isLoading}
          onExportCSV={onExportCSV}
          isExporting={isExporting}
        />
      </div>

      {/* Drawer */}
      <ChargebackDrawer
        chargebackId={selectedChargebackId}
        onClose={() => setSelectedChargebackId(null)}
      />
    </div>
  );
}
