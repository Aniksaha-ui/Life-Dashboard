import type { ColumnDef } from "@tanstack/react-table";
import clsx from "clsx";
import { CopyButton } from "../../../../components/CopyButton";
import type { RefundRow } from "../types";

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case "Success":
      return "bg-emerald-50 text-emerald-600";
    case "Processing":
    case "Pending":
      return "bg-amber-50 text-amber-600";
    case "Initial":
    case "Initiate":
      return "bg-blue-50 text-blue-600";
    case "Cancelled":
    case "Failed":
      return "bg-rose-50 text-rose-600";
    default:
      return "bg-slate-100 text-slate-500";
  }
};

export const getColumns = (
  onViewDetails: (id: string) => void,
): ColumnDef<RefundRow>[] => [
  {
    accessorKey: "requestedOn",
    header: "REQUESTED",
    cell: ({ row }) => (
      <div className="text-xs font-normal text-slate-900">
        {row.original.requestedOn
          ? new Date(row.original.requestedOn).toLocaleString([], {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : ""}
      </div>
    ),
  },
  {
    accessorKey: "transactionDate",
    header: "TXN DATE",
    cell: ({ row }) => (
      <div className="text-xs font-normal text-slate-900">
        {row.original.transactionDate
          ? new Date(row.original.transactionDate).toLocaleString([], {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })
          : ""}
      </div>
    ),
  },
  {
    accessorKey: "transactionId",
    header: "TXN ID",
    size: 160,
    cell: ({ row }) => (
      <div className="text-xs text-slate-900 max-w-[160px] break-all whitespace-normal">
        {row.original.transactionId}
      </div>
    ),
  },
  {
    accessorKey: "refundRefId",
    header: "REFUND REF. ID",
    cell: ({ row }) => (
      <div className="text-xs font-mono font-medium text-slate-700">
        {row.original.refundRefId}
      </div>
    ),
  },
  {
    accessorKey: "merchantName",
    header: "MERCHANT",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 group">
        <div>
          <div className="text-xs font-normal text-slate-900">
            {row.original.merchantName}
          </div>
          <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
            {row.original.merchantId}
            <CopyButton value={row.original.merchantId} />
          </div>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "storeName",
    header: "STORE",
    cell: ({ row }) => (
      <div className="flex flex-col group">
        <span className="text-xs text-slate-700 font-medium">
          {row.original.storeName}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          {row.original.storeId}
          <CopyButton value={row.original.storeId} />
        </div>
      </div>
    ),
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">AMOUNT</div>,
    cell: ({ row }) => (
      <div
        className={clsx(
          "text-right text-xs font-medium text-slate-900 tabular-nums",
        )}
      >
        ৳{Math.abs(row.original.amount).toLocaleString()}
      </div>
    ),
  },
  {
    accessorKey: "finalStatus",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={clsx(
          "px-2 py-0.5 rounded-full text-xs font-medium capitalize whitespace-nowrap inline-block",
          getStatusBadgeClass(row.original.finalStatus),
        )}
      >
        {row.original.finalStatus}
      </span>
    ),
  },
  {
    id: "view",
    header: "View",
    cell: ({ row }) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(row.original.id);
        }}
        className="text-xs font-medium text-primary-600 hover:text-primary-700 hover:underline"
      >
        Details
      </button>
    ),
  },
];
