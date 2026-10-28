import clsx from "clsx";
import { Download, Loader2 } from "lucide-react";
import { DataTable } from "../../../components/DataTable";
import type { TransactionTableProps } from "../types";
import { getTransactionColumns } from "./columns";

export function TransactionTable({
  data,
  pagination,
  onPageChange,
  onViewDetail,
  onViewCustomer,
  onViewCard,
  onViewLogs,
  onExportCSV,
  isExporting,
}: TransactionTableProps) {
  const columns = getTransactionColumns({
    onViewDetail,
    onViewCustomer,
    onViewCard,
    onViewLogs,
  });

  return (
    <div className="pt-4">
      <DataTable
        columns={columns}
        data={data}
        mobileCardTitleColumn={2}
        hideToolbarDateFilter={true}
        viewButtonLabel="View Column"
        externalPagination={pagination}
        onPageChange={onPageChange}
        filterActions={
          <h2 className="text-sm font-semibold text-slate-900 ml-1">
            Showing transaction details
          </h2>
        }
        toolbarEndContent={
          <div className="flex gap-2">
            <button
              onClick={onExportCSV}
              disabled={isExporting}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md transition-all shadow-sm active:scale-95",
                isExporting
                  ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50",
              )}
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isExporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        }
      />
    </div>
  );
}
