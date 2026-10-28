import { useMemo } from "react";
import { clsx } from "clsx";
import { Loader2, Download } from "lucide-react";
import { getColumns } from "./columns";
import { DataTable } from "../../../../components/DataTable";
import { Skeleton } from "../../../../components/Skeleton";
import type { ChargebackTableProps } from "../types";

export function ChargebackTable({
  data,
  pagination,
  onPageChange,
  onViewDetails,
  isLoading,
  onExportCSV,
  isExporting,
}: ChargebackTableProps) {
  const columns = useMemo(() => getColumns(onViewDetails), [onViewDetails]);

  return (
    <div className="pt-4">
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          hideToolbarDateFilter={true}
          viewButtonLabel="View Column"
          externalPagination={pagination}
          onPageChange={onPageChange}
          filterActions={
            <h2 className="text-sm font-semibold text-slate-900 ml-1">
              Showing chargebacks data ({pagination.total})
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
      )}
    </div>
  );
}
