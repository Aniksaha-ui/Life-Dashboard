import { useState } from "react";
import { RefundDrawer } from "./components/RefundDrawer";
import { RefundFilters } from "./components/RefundFilters";
import { RefundOverview } from "./components/RefundOverview";
import { RefundTable } from "./components/RefundTable";
import { useRefunds } from "./hooks/useRefunds";

export default function RefundsPage() {
  const {
    filters,
    handleFilterChange,
    handleClearFilters,
    filteredData,
    handleExportCSV: onExportCSV,
    metrics,
    isLoading,
    pagination,
    handlePageChange,
    isExporting,
  } = useRefunds();

  const [selectedRefundId, setSelectedRefundId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Refunds</h1>
        <p className="text-slate-500 text-sm">
          Track refund requests and settlement status
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Filters Row */}
        <RefundFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Overview Section */}
        <RefundOverview metrics={metrics} />

        {/* Table Section */}
        <RefundTable
          data={filteredData}
          onViewDetails={setSelectedRefundId}
          isLoading={isLoading}
          onExportCSV={onExportCSV}
          isExporting={isExporting}
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Drawer */}
      <RefundDrawer
        refundId={selectedRefundId}
        onClose={() => setSelectedRefundId(null)}
      />
    </div>
  );
}
