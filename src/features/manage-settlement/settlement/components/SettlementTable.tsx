import { Download } from "lucide-react";
import { DataTable } from "../../../../components/DataTable";
import { Skeleton } from "../../../../components/Skeleton";
import type { SettlementTableProps } from "../types";
import { getSettlementColumns } from "./columns";

export function SettlementTable({
  data,
  pagination,
  isLoading,
  onPageChange,
  onViewDetail,
  onExportOnline,
  onExportPhysical,
}: SettlementTableProps) {
  const columns = getSettlementColumns({ onViewDetail });

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
          externalPagination={pagination}
          onPageChange={onPageChange}
          hideToolbarDateFilter={true}
          viewButtonLabel="View Column"
          filterActions={
            <h2 className="text-sm font-semibold text-slate-900 ml-1">
              Showing settlements data
            </h2>
          }
          toolbarEndContent={
            <div className="flex gap-2">
              <button
                onClick={onExportPhysical}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Physical Settlement
              </button>
              <button
                onClick={onExportOnline}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Online Settlement
              </button>
            </div>
          }
        />
      )}
    </div>
  );
}
