import { useState } from "react";
import { SettlementDrawer } from "./components/SettlementDrawer";
import { SettlementFilters } from "./components/SettlementFilters";
import { SettlementOverview } from "./components/SettlementOverview";
import { SettlementTable } from "./components/SettlementTable";
import { useSettlements } from "./hooks/useSettlements";

export default function SettlementsPage() {
  const {
    settlements,
    pagination,
    metrics,
    filters,
    isLoading,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleExportOnline,
    handleExportPhysical,
  } = useSettlements();

  const [selectedTransactionId, setSelectedTransactionId] = useState<
    string | null
  >(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settlements</h1>
        <p className="text-slate-500 text-sm">
          Review settlement batches and payment status
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        <SettlementFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <SettlementOverview
          metrics={metrics}
          onFilterChange={handleFilterChange}
        />

        <SettlementTable
          data={settlements}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          onViewDetail={(id) => setSelectedTransactionId(id)}
          onExportOnline={handleExportOnline}
          onExportPhysical={handleExportPhysical}
        />
      </div>

      {/* Drawer */}
      <SettlementDrawer
        transactionId={selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
      />
    </div>
  );
}
