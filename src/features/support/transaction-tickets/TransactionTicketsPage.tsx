import { useState } from "react";
import { TransactionDetailDrawer } from "./components/TransactionDetailDrawer";
import { TransactionTicketDrawer } from "./components/TransactionTicketDrawer";
import { TransactionTicketFilters } from "./components/TransactionTicketFilters";
import { TransactionTicketOverview } from "./components/TransactionTicketOverview";
import { TransactionTicketTable } from "./components/TransactionTicketTable";
import { useTransactionTickets } from "./hooks/useTransactionTickets";

export default function TransactionTicketsPage() {
  const {
    filters,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    filteredData,
    isLoading,
    metrics,
    pagination,
    handleExportCSV: onExportCSV,
    isExporting,
  } = useTransactionTickets();

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Transaction Tickets
        </h1>
        <p className="text-slate-500 text-sm">
          Track and manage transaction-related support requests
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col">
        {/* Filters Row */}
        <TransactionTicketFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Overview Section */}
        {!isLoading && <TransactionTicketOverview metrics={metrics} />}

        {/* Table Section */}
        <TransactionTicketTable
          data={filteredData}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewSupportDetails={setSelectedTicketId}
          onViewTransactionDetails={setSelectedTransactionId}
          isLoading={isLoading}
          onExportCSV={onExportCSV}
          isExporting={isExporting}
        />
      </div>

      {/* Drawer */}
      <TransactionTicketDrawer
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />

      <TransactionDetailDrawer
        transactionId={selectedTransactionId}
        onClose={() => setSelectedTransactionId(null)}
      />
    </div>
  );
}
