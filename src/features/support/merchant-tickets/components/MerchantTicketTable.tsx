import { useMemo } from "react";
import { DataTable } from "../../../../components/DataTable";
import { Skeleton } from "../../../../components/Skeleton";
import type { MerchantTicketTableProps } from "../types";
import { getColumns } from "./columns";

export function MerchantTicketTable({
  data,
  pagination,
  onPageChange,
  onViewDetails,
  onPreviewImage,
  isLoading,
}: MerchantTicketTableProps) {
  const columns = useMemo(
    () => getColumns(onViewDetails, onPreviewImage),
    [onViewDetails, onPreviewImage],
  );

  return (
    <div className="pt-4">
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          hideToolbarDateFilter={true}
          externalPagination={pagination}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
