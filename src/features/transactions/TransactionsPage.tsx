import { useState } from "react";
import { CardDetailsDrawer } from "./components/CardDetailsDrawer";
import { CustomerTransactionsDrawer } from "./components/CustomerTransactionsDrawer";
import { FileLogsDrawer } from "./components/FileLogsDrawer";
import { TransactionDetailDrawer } from "./components/TransactionDetailDrawer";
import { TransactionFilters } from "./components/TransactionFilters";
import { TransactionOverview } from "./components/TransactionOverview";
import { TransactionTable } from "./components/TransactionTable";
import { useTransactions } from "./hooks/useTransactions";

export default function TransactionsPage() {
  const {
    filteredData,
    summaryMetrics,
    filters,
    pagination,
    handleFilterChange,
    handleClearFilters,
    handlePageChange,
    handleExportCSV,
    isExporting,
  } = useTransactions();

  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const [selectedCustomerTid, setSelectedCustomerTid] = useState<number | null>(
    null,
  );
  const [logSelection, setLogSelection] = useState<{
    tid: number;
    txnId: string;
    ip: string;
  } | null>(null);
  const [selectedMaskedCard, setSelectedMaskedCard] = useState<string | null>(
    null,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transaction</h1>
        <p className="text-slate-500 text-sm">
          Monitor and search between all payments and transactions.
        </p>
      </div>

      <div className="flex flex-col">
        <TransactionFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <TransactionOverview
          metrics={summaryMetrics}
          onFilterChange={(newPartialFilters) =>
            handleFilterChange({ ...filters, ...newPartialFilters })
          }
        />

        <TransactionTable
          data={filteredData}
          pagination={pagination}
          onPageChange={handlePageChange}
          onViewDetail={setSelectedTransactionId}
          onViewCustomer={setSelectedCustomerTid}
          onViewCard={setSelectedMaskedCard}
          onViewLogs={(tid, txnId, ip) => setLogSelection({ tid, txnId, ip })}
          onExportCSV={handleExportCSV}
          isExporting={isExporting}
        />
      </div>

      {/* Drawers */}
      {selectedTransactionId && (
        <TransactionDetailDrawer
          transactionId={selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          onShowLogs={(tid, txnId, ip) => setLogSelection({ tid, txnId, ip })}
          onShowCard={setSelectedMaskedCard}
        />
      )}

      {selectedCustomerTid && (
        <CustomerTransactionsDrawer
          tid={selectedCustomerTid}
          onClose={() => setSelectedCustomerTid(null)}
        />
      )}

      {logSelection && (
        <FileLogsDrawer
          tid={logSelection.tid}
          txnId={logSelection.txnId}
          ip={logSelection.ip}
          onClose={() => setLogSelection(null)}
        />
      )}

      {selectedMaskedCard && (
        <CardDetailsDrawer
          maskedCard={selectedMaskedCard}
          onClose={() => setSelectedMaskedCard(null)}
          onShowLogs={(tid, txnId, ip) => setLogSelection({ tid, txnId, ip })}
        />
      )}
    </div>
  );
}
