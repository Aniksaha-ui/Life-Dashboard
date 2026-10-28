import { Download, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { clsx } from "clsx";
import { DataTable } from "../../../../components/DataTable";
import type { TransactionTicketTableProps } from "../types";
import { getColumns } from "./columns";

export function TransactionTicketTable({
  data,
  pagination,
  onPageChange,
  onViewSupportDetails,
  onViewTransactionDetails,
  onExportCSV,
  isExporting,
}: TransactionTicketTableProps) {
  const columns = useMemo(
    () => getColumns(onViewSupportDetails, onViewTransactionDetails),
    [onViewSupportDetails, onViewTransactionDetails],
  );

  return (
    <div className="pt-4">
      <DataTable
        columns={columns}
        data={data}
        hideToolbarDateFilter={true}
        viewButtonLabel="View Column"
        externalPagination={pagination}
        onPageChange={onPageChange}
        filterActions={
          <h2 className="text-sm font-semibold text-slate-900 ml-1">
            Showing tickets data
          </h2>
        }
        toolbarEndContent={
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
        }
      />
    </div>
  );
}
